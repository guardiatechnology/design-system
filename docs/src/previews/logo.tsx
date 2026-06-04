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
