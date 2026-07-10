import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { GuardiaBadge, GuardiaLogo, IsacLogo, IsacSymbol } from "./index";
import { axeInThemes } from "@/test-utils/a11y";

describe("Logo", () => {
    // role="img" + default accessible name per lex-frontend-accessibility
    it.each([
        { Comp: GuardiaBadge, name: "Guardia" },
        { Comp: GuardiaLogo, name: "Guardia" },
        { Comp: IsacSymbol, name: "Isac" },
        { Comp: IsacLogo, name: "Isac" },
    ])("$name mark renders role=img with default aria-label", ({ Comp, name }) => {
        render(<Comp />);
        expect(screen.getByRole("img", { name })).toBeInTheDocument();
    });

    it("accepts an overridable aria-label", () => {
        render(<GuardiaLogo aria-label="Logotipo Guardia" />);
        expect(screen.getByRole("img", { name: "Logotipo Guardia" })).toBeInTheDocument();
    });

    it("forwards className to the svg", () => {
        render(<IsacSymbol aria-label="isac" className="my-extra h-20" />);
        const svg = screen.getByRole("img", { name: "isac" });
        expect(svg).toHaveClass("my-extra");
        expect(svg).toHaveClass("h-20");
    });

    it("forwards ref to the underlying svg element", () => {
        const ref = { current: null as SVGSVGElement | null };
        render(<GuardiaBadge ref={ref} />);
        expect(ref.current).toBeInstanceOf(SVGSVGElement);
    });

    // useId contract: two instances of a clipPath-using mark MUST NOT collide,
    // and each <g> MUST reference its own clipPath id (Gemini review, PR #300).
    it.each([
        { Comp: GuardiaLogo, name: "GuardiaLogo" },
        { Comp: IsacLogo, name: "IsacLogo" },
    ])("$name generates a unique clipPath id per instance", ({ Comp }) => {
        const { container } = render(
            <div>
                <Comp aria-label="a" />
                <Comp aria-label="b" />
            </div>,
        );
        const ids = Array.from(container.querySelectorAll("clipPath")).map((c) =>
            c.getAttribute("id"),
        );
        expect(ids).toHaveLength(2);
        expect(ids[0]).toBeTruthy();
        expect(ids[1]).toBeTruthy();
        expect(ids[0]).not.toBe(ids[1]); // no DOM collision

        // each clipped group points at an id that exists in the same render
        container.querySelectorAll("g[clip-path]").forEach((g) => {
            const ref = g.getAttribute("clip-path")!.match(/#(.+)\)/)?.[1];
            expect(ids).toContain(ref);
        });
    });

    // Brand colors pinned to the canonical palette (lex-brand-colors):
    // Warm Orange #F47720 + Deep Violet #552973. Guards against off-palette drift.
    it("GuardiaBadge uses the canonical palette (violet + orange)", () => {
        const { container } = render(<GuardiaBadge />);
        const fills = Array.from(container.querySelectorAll("path[fill]")).map((p) =>
            p.getAttribute("fill"),
        );
        expect(fills).toContain("#552973");
        expect(fills).toContain("#f47720");
    });

    it("GuardiaLogo uses the canonical orange (#f47720, not #e07400)", () => {
        const { container } = render(<GuardiaLogo />);
        const fills = Array.from(container.querySelectorAll("path[fill]")).map((p) =>
            p.getAttribute("fill"),
        );
        expect(fills).toContain("#f47720");
        expect(fills).not.toContain("#e07400");
    });

    // Isac marks consume the dedicated --isac-* tokens (which alias the
    // official palette); guards against the stale bespoke fills.
    it("IsacSymbol consumes the --isac-* tokens, not stale bespoke hexes", () => {
        const { container } = render(<IsacSymbol />);
        const fills = Array.from(container.querySelectorAll("[fill]")).map((el) =>
            el.getAttribute("fill"),
        );
        expect(fills).toContain("var(--isac-violet)");
        expect(fills).toContain("var(--isac-orange)");
        expect(fills).toContain("var(--isac-light)");
        expect(fills).not.toContain("#54266b");
        expect(fills).not.toContain("#ee750d");
        expect(fills).not.toContain("#f4e6f2");
    });

    it("IsacLogo's star uses the --isac-orange token", () => {
        const { container } = render(<IsacLogo />);
        const fills = Array.from(container.querySelectorAll("[fill]")).map((el) =>
            el.getAttribute("fill"),
        );
        expect(fills).toContain("var(--isac-orange)");
    });

    // jest-axe — each mark is WCAG AA clean in light + dark
    it("GuardiaBadge is axe-clean in light + dark", async () => {
        const { container } = render(<GuardiaBadge />);
        await axeInThemes(container);
    });

    it("white wordmarks over Deep Violet are axe-clean in light + dark", async () => {
        const { container } = render(
            <div style={{ background: "#552973" }}>
                <GuardiaLogo />
                <IsacLogo />
            </div>,
        );
        await axeInThemes(container);
    });
});
