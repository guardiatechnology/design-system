#!/usr/bin/env node
/**
 * Pushes visual baseline changes in __image_snapshots__/ as a single
 * commit, signed by GitHub via the Git Database API.
 *
 * Why API instead of `git push`:
 *   Per lex-signed-commits, every commit reaching the trunk MUST be
 *   verified. Commits created via the REST API are server-signed with
 *   GitHub's GPG key (committer = github-actions[bot]); direct `git push`
 *   from the runner using GITHUB_TOKEN is not. The Git Database API
 *   (blobs + tree + commit + ref) handles the multi-file payload in
 *   a single signed commit.
 *
 * Wired by .github/workflows/regenerate-baselines.yml.
 *
 * Env required:
 *   GH_TOKEN: GITHUB_TOKEN exposed by the workflow
 *   BRANCH:   target branch (defaults to current ref_name in workflow)
 *   GITHUB_REPOSITORY: owner/repo (set automatically in Actions)
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { GH_TOKEN, BRANCH, GITHUB_REPOSITORY } = process.env;
if (!GH_TOKEN || !BRANCH || !GITHUB_REPOSITORY) {
  console.error("Missing GH_TOKEN, BRANCH, or GITHUB_REPOSITORY env var");
  process.exit(1);
}

const [owner, repo] = GITHUB_REPOSITORY.split("/");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GitHub enforces a *secondary* rate limit on bursts of content-creating
// requests (blob/tree/commit), independent of the primary hourly quota. A PR
// that regenerates the whole baseline set (hundreds of PNGs) reliably trips it
// mid-upload with a 403 "secondary rate limit". Honor `retry-after` when
// present, otherwise back off exponentially with jitter.
const MAX_RETRIES = 6;

async function gh(method, endpoint, body) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://api.github.com${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res.json();

    const text = await res.text();
    const secondary =
      (res.status === 403 || res.status === 429) &&
      /secondary rate limit/i.test(text);
    if (secondary && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : Math.min(60000, 2 ** attempt * 1000) +
            Math.floor(Math.random() * 1000);
      console.log(
        `Secondary rate limit on ${method} ${endpoint}; ` +
          `retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(waitMs / 1000)}s`,
      );
      await sleep(waitMs);
      continue;
    }
    throw new Error(
      `GitHub API ${method} ${endpoint} failed: ${res.status} ${text}`,
    );
  }
}

// 1. List PNG changes (added, modified, deleted) under __image_snapshots__/.
// `-uall` (--untracked-files=all) is required so that brand-new directories
// (first-time baselines for a component, e.g. `components/slider/`) are
// expanded into individual files instead of being collapsed into a single
// directory entry (`?? __image_snapshots__/components/slider/`), which the
// `.endsWith(".png")` filter below would drop. Without `-uall`, the first
// regenerate run for any new component reports "No baseline changes to
// push" despite having written PNGs to disk.
const diff = execSync("git status --porcelain -uall __image_snapshots__/", {
  encoding: "utf-8",
});
const changed = diff
  .split("\n")
  .filter((line) => line.trim())
  .map((line) => ({
    status: line.slice(0, 2).trim(),
    path: line.slice(3).trim(),
  }))
  .filter(({ path }) => path.endsWith(".png"));

if (changed.length === 0) {
  console.log("No baseline changes to push");
  process.exit(0);
}
console.log(
  `Pushing ${changed.length} baseline change(s) via GitHub API to ${BRANCH}`,
);

// 2. Snapshot the current branch HEAD
const ref = await gh(
  "GET",
  `/repos/${owner}/${repo}/git/refs/heads/${BRANCH}`,
);
const headSha = ref.object.sha;
const headCommit = await gh(
  "GET",
  `/repos/${owner}/${repo}/git/commits/${headSha}`,
);
const baseTreeSha = headCommit.tree.sha;

// 3. Upload each PNG as a blob; collect tree entries. Small parallel chunks
//    with a pause between them keep the burst under GitHub's secondary-rate
//    limit; the per-request backoff in `gh()` is the safety net when a large
//    changeset (full-baseline regeneration) still trips it mid-upload.
const CHUNK_SIZE = 6;
const CHUNK_PAUSE_MS = 1200;
const treeEntries = [];
for (let i = 0; i < changed.length; i += CHUNK_SIZE) {
  const chunk = changed.slice(i, i + CHUNK_SIZE);
  const results = await Promise.all(
    chunk.map(async ({ status, path }) => {
      if (status === "D") {
        return { path, mode: "100644", type: "blob", sha: null };
      }
      const content = readFileSync(path).toString("base64");
      const blob = await gh("POST", `/repos/${owner}/${repo}/git/blobs`, {
        content,
        encoding: "base64",
      });
      return { path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );
  treeEntries.push(...results);
  console.log(`Uploaded ${treeEntries.length}/${changed.length} blobs`);
  if (i + CHUNK_SIZE < changed.length) await sleep(CHUNK_PAUSE_MS);
}

// 4. Create a tree on top of the current one
const tree = await gh("POST", `/repos/${owner}/${repo}/git/trees`, {
  base_tree: baseTreeSha,
  tree: treeEntries,
});

// 5. Create the signed commit
const commit = await gh("POST", `/repos/${owner}/${repo}/git/commits`, {
  message:
    "chore(visual): regenerate baselines on ubuntu (regenerate-baselines workflow)",
  tree: tree.sha,
  parents: [headSha],
});

// 6. Move the branch ref forward
await gh("PATCH", `/repos/${owner}/${repo}/git/refs/heads/${BRANCH}`, {
  sha: commit.sha,
});

console.log(
  `Pushed signed commit ${commit.sha.slice(0, 7)} with ${changed.length} baseline change(s) to ${BRANCH}`,
);
