#!/usr/bin/env node
/**
 * Regenerates the per-subpath entries of package.json `exports` from the
 * built `dist/components/*` and `dist/theme/` directories, so the map stays
 * in sync with the actual component set instead of being hand-maintained.
 *
 * Fixes #315 (design-system tree-shaking): the barrel-only `exports` map
 * (only `.` and `./styles.css`) forces bundlers to pull in the whole
 * library even when a consumer imports a single component. This script
 * adds one subpath per component (`./button`, `./table`, ...) plus
 * `./theme`, each pointing at the already-tree-shaken per-file build
 * output that `rslib build` produces (bundle: false in rslib.config.ts).
 *
 * Wired as the `postbuild` script, so it runs automatically after
 * `npm run build` / `rslib build`. It only rewrites `exports`; every other
 * package.json field (and key order) is left untouched. The resulting
 * package.json must be committed — the GitHub Packages publish workflow
 * (.github/workflows/publish.yml) publishes the package.json already on
 * disk at tag time, it does not re-run this script.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const pkgPath = join(rootDir, "package.json");
const distComponentsDir = join(rootDir, "dist", "components");
const distThemeIndex = join(rootDir, "dist", "theme", "index.js");

function readPkg() {
  return JSON.parse(readFileSync(pkgPath, "utf8"));
}

function listComponentNames() {
  if (!existsSync(distComponentsDir)) {
    console.error(
      `[generate-exports] dist/components not found at ${distComponentsDir}. Run "rslib build" before this script (it runs automatically as "postbuild").`,
    );
    process.exit(1);
  }

  return readdirSync(distComponentsDir)
    .filter((name) => {
      const full = join(distComponentsDir, name);
      return statSync(full).isDirectory() && existsSync(join(full, "index.js"));
    })
    .sort();
}

function buildExportsMap(pkg) {
  const prev = pkg.exports ?? {};

  // "." and "./styles.css" are hand-maintained; every other key is derived.
  const exportsMap = {
    ".": prev["."] ?? { types: "./dist/index.d.ts", import: "./dist/index.js" },
    "./styles.css": prev["./styles.css"] ?? "./dist/styles/index.css",
  };

  const subpaths = listComponentNames();
  if (existsSync(distThemeIndex)) {
    subpaths.push("theme");
    subpaths.sort();
  }

  for (const name of subpaths) {
    const dir = name === "theme" ? "theme" : `components/${name}`;
    exportsMap[`./${name}`] = {
      types: `./dist/${dir}/index.d.ts`,
      import: `./dist/${dir}/index.js`,
    };
  }

  return exportsMap;
}

function main() {
  const pkg = readPkg();
  const prevExports = pkg.exports ?? {};
  const nextExports = buildExportsMap(pkg);

  const changed = JSON.stringify(prevExports) !== JSON.stringify(nextExports);
  pkg.exports = nextExports;

  const subpathCount = Object.keys(nextExports).length - 2; // minus "." and "./styles.css"

  if (changed) {
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(
      `[generate-exports] package.json exports map updated: ${subpathCount} subpath entries (components + theme) in sync with dist/components/*.`,
    );
  } else {
    console.log(
      `[generate-exports] package.json exports map already up to date (${subpathCount} subpath entries).`,
    );
  }
}

main();
