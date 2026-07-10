import { GuardiaBadge, GuardiaLogo, IsacLogo, IsacSymbol } from "@ds/components/logo";

export function GuardiaRow() {
  return (
    <div className="flex flex-wrap items-center gap-10">
      <div className="flex flex-col items-center gap-2">
        <GuardiaBadge className="h-16 w-auto" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">GuardiaBadge</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        {/* Wordmark branco — sobre Deep Violet (lex-brand-logo) */}
        <div className="flex items-center justify-center rounded-md bg-guardia-purple-500 px-6 py-4">
          <GuardiaLogo className="h-12 w-auto" />
        </div>
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          GuardiaLogo · fundo violeta
        </span>
      </div>
    </div>
  );
}

export function IsacRow() {
  return (
    <div className="flex flex-wrap items-center gap-10">
      <div className="flex flex-col items-center gap-2">
        <IsacSymbol className="h-16 w-auto" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">IsacSymbol</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        {/* Wordmark branco — sobre Deep Violet (lex-brand-logo) */}
        <div className="flex items-center justify-center rounded-md bg-guardia-purple-500 px-6 py-4">
          <IsacLogo className="h-12 w-auto" />
        </div>
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          IsacLogo · fundo violeta
        </span>
      </div>
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex flex-wrap items-end gap-8 rounded-md bg-guardia-purple-500 p-8">
      <GuardiaLogo className="h-6 w-auto" />
      <GuardiaLogo className="h-9 w-auto" />
      <GuardiaLogo className="h-14 w-auto" />
    </div>
  );
}

export function OnVioletRow() {
  return (
    <div className="flex flex-wrap items-center gap-10 rounded-md bg-guardia-purple-500 p-8">
      <GuardiaBadge className="h-16 w-auto" />
      <IsacSymbol className="h-16 w-auto" />
    </div>
  );
}

/**
 * Color variations derived from the official 2026 vector (assets/logo/*.svg).
 * These render the standalone SVG assets — the React components above expose
 * only the full-color mark; the tinted/mono variants live as files until the
 * `Logotipo` component (WIP) surfaces them with a `variant` prop.
 */
type Variant = { file: string; label: string; dark?: boolean };

function VariantTile({ file, label, dark, h }: Variant & { h: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-md px-4 py-3 ${
          dark ? "bg-guardia-purple-900" : "bg-guardia-gray-100"
        }`}
      >
        <img
          src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/assets/logo/${file}.svg`}
          alt={`Guardia logo — ${label}`}
          className={`${h} w-auto`}
        />
      </div>
      <span className="text-[11px] uppercase tracking-wider text-fg-muted">{label}</span>
    </div>
  );
}

const SIGNATURE_VARIANTS: Variant[] = [
  { file: "guardia-logotipo-colorido", label: "colorido" },
  { file: "guardia-logotipo-purple", label: "purple" },
  { file: "guardia-logotipo-orange", label: "orange" },
  { file: "guardia-logotipo-mono-black", label: "mono-black" },
  { file: "guardia-logotipo-mono-white", label: "mono-white", dark: true },
  { file: "guardia-logotipo-branco-roxo", label: "branco-roxo" },
];

const SYMBOL_VARIANTS: Variant[] = [
  { file: "guardia-logo-purple-transparent", label: "purple" },
  { file: "guardia-logo-orange-transparent", label: "orange" },
  { file: "guardia-logo-mono-black", label: "mono-black" },
  { file: "guardia-logo-mono-white", label: "mono-white", dark: true },
  { file: "guardia-logo-purple-and-orange", label: "purple + orange" },
  { file: "guardia-logo-orange-and-purple", label: "orange + purple" },
  { file: "guardia-logo-purple-rounded", label: "purple rounded" },
  { file: "guardia-logo-orange-rounded", label: "orange rounded" },
];

export function SignatureVariationsRow() {
  return (
    <div className="flex flex-wrap items-end gap-8">
      {SIGNATURE_VARIANTS.map((v) => (
        <VariantTile key={v.file} {...v} h="h-7" />
      ))}
    </div>
  );
}

export function SymbolVariationsRow() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      {SYMBOL_VARIANTS.map((v) => (
        <VariantTile key={v.file} {...v} h="h-12" />
      ))}
    </div>
  );
}
