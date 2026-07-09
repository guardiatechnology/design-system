import type { Meta, StoryObj } from "@storybook/react";
import { GuardiaBadge, GuardiaLogo, IsacLogo, IsacSymbol } from "./index";

const meta = {
    title: "Components/Logo",
    component: GuardiaLogo,
    tags: ["autodocs"],
} satisfies Meta<typeof GuardiaLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Deep Violet #552973 — the canonical background for the white wordmarks. */
const violet = { background: "#552973" } as const;

export const GuardiaPrimary: Story = {
    render: () => (
        // White wordmark over Deep Violet (lex-brand-logo): 7.85:1, AAA.
        <div className="flex items-center rounded-lg p-8" style={violet}>
            <GuardiaLogo className="h-12 w-auto" />
        </div>
    ),
};

export const GuardiaSymbol: Story = {
    render: () => <GuardiaBadge className="h-16 w-auto" />,
};

export const Isac: Story = {
    render: () => (
        // White wordmark over Deep Violet (lex-brand-logo): 7.85:1, AAA.
        <div className="flex items-center rounded-lg p-8" style={violet}>
            <IsacLogo className="h-12 w-auto" />
        </div>
    ),
};

export const IsacMark: Story = {
    render: () => <IsacSymbol className="h-16 w-auto" />,
};

export const AllLogos: Story = {
    render: () => (
        // All four over Deep Violet so the white wordmarks stay legible;
        // the full-color marks carry their own contrast on violet too.
        <div className="flex flex-wrap items-center gap-8 rounded-lg p-8" style={violet}>
            <GuardiaBadge className="h-16 w-auto" />
            <GuardiaLogo className="h-12 w-auto" />
            <IsacSymbol className="h-16 w-auto" />
            <IsacLogo className="h-12 w-auto" />
        </div>
    ),
};

/**
 * Per `lex-brand-logo`, the secondary marks belong on violet-spectrum
 * backgrounds. The full-color marks already carry their own contrast,
 * so they render correctly over Deep Violet.
 */
export const OnViolet: Story = {
    render: () => (
        <div
            className="flex flex-wrap items-center gap-8 rounded-lg p-8"
            style={{ background: "#552973" }}
        >
            <GuardiaBadge className="h-16 w-auto" />
            <IsacSymbol className="h-16 w-auto" />
        </div>
    ),
};
