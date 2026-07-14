#!/usr/bin/env node
/**
 * Generates the `exports` map in package.json from the `ui_kit/` source tree,
 * keeping per-component (and theme/lib) subpath exports in sync with the files
 * that `rslib` emits into `dist/` (Issue #315).
 *
 * Why: with `bundle: false`, the build mirrors `ui_kit/` into `dist/`
 * (`ui_kit/components/button/index.tsx` -> `dist/components/button/index.js`).
 * Exposing each component as a subpath lets consumers import narrowly, and
 * `sideEffects: false` (declared in package.json) lets bundlers drop the
 * unreferenced barrel members. The `.` barrel export is preserved unchanged
 * for backward compatibility.
 *
 * The map is derived from source (not from `dist/`), so this runs without a
 * prior build — CI can verify sync before the build step.
 *
 * Usage:
 *   node scripts/generate-exports.mjs           # rewrite package.json exports
 *   node scripts/generate-exports.mjs --check   # exit 1 if package.json drifts
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = join(root, "package.json");

/** Component directories under ui_kit/components that expose an index module. */
function componentEntries() {
    const dir = join(root, "ui_kit", "components");
    return readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .filter((d) => ["index.ts", "index.tsx"].some((f) => existsSync(join(dir, d.name, f))))
        .map((d) => d.name)
        .sort();
}

/** Public theme modules under ui_kit/theme (excluding tests and stories). */
function themeEntries() {
    const dir = join(root, "ui_kit", "theme");
    return readdirSync(dir)
        .filter((f) => /\.tsx?$/.test(f) && !/\.(test|stories)\./.test(f))
        .map((f) => f.replace(/\.tsx?$/, ""))
        .sort();
}

/** Builds the canonical `exports` map. Fixed entries first, then subpaths. */
function buildExports() {
    const exp = {
        ".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
        "./styles.css": "./dist/styles/index.css",
    };

    for (const name of componentEntries()) {
        exp[`./${name}`] = {
            types: `./dist/components/${name}/index.d.ts`,
            import: `./dist/components/${name}/index.js`,
        };
    }

    for (const name of themeEntries()) {
        exp[`./theme/${name}`] = {
            types: `./dist/theme/${name}.d.ts`,
            import: `./dist/theme/${name}.js`,
        };
    }

    // `cn` and other helpers re-exported by the `.` barrel from lib/utils.
    exp["./lib/utils"] = {
        types: "./dist/lib/utils.d.ts",
        import: "./dist/lib/utils.js",
    };

    return exp;
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const expected = buildExports();
const check = process.argv.includes("--check");

if (check) {
    const current = JSON.stringify(pkg.exports ?? {});
    if (current !== JSON.stringify(expected)) {
        console.error(
            "package.json `exports` is out of sync with ui_kit/.\n" +
                "Run `npm run exports:generate` and commit the result.",
        );
        process.exit(1);
    }
    console.log("package.json `exports` in sync with ui_kit/.");
    process.exit(0);
}

pkg.exports = expected;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
console.log(`package.json exports regenerated (${Object.keys(expected).length} entries).`);
