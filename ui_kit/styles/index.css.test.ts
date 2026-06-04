import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * Guards the CSS `@import` ordering invariant (issue #299).
 *
 * The CSS spec requires every `@import` to precede all other rules except
 * `@charset` and `@layer`. Turbopack (Next dev) enforces this as a hard parse
 * error — an out-of-order font `@import` 500s every route in a consuming app.
 * `dist/styles/index.css` is a verbatim copy of this source (rslib `copy`),
 * so asserting on the source protects the published artifact too.
 */
const cssPath = resolve(process.cwd(), "ui_kit/styles/index.css");
const css = readFileSync(cssPath, "utf8");

/**
 * Index of the first at-rule that starts at column 0 (line-anchored), so
 * mentions inside comments (which are indented with ` * `) do not count.
 */
const ruleIndex = (rule: string): number =>
    css.search(new RegExp(`^${rule.replace(/[-]/g, "\\$&")}`, "m"));

describe("ui_kit/styles/index.css — @import ordering", () => {
    it("AC-1: the Google Fonts @import precedes the first @source rule", () => {
        const fontImport = ruleIndex("@import url\\(");
        const firstSource = ruleIndex("@source");

        expect(fontImport).toBeGreaterThanOrEqual(0);
        expect(firstSource).toBeGreaterThanOrEqual(0);
        expect(fontImport).toBeLessThan(firstSource);
    });

    it("AC-1: the Google Fonts @import precedes the first @custom-variant rule", () => {
        const fontImport = ruleIndex("@import url\\(");
        const firstCustomVariant = ruleIndex("@custom-variant");

        expect(firstCustomVariant).toBeGreaterThanOrEqual(0);
        expect(fontImport).toBeLessThan(firstCustomVariant);
    });

    it("AC-2: preserves the Poppins + Roboto CDN @import", () => {
        expect(css).toContain(
            "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
        );
    });
});
