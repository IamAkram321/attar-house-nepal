import { Link } from "wouter";
import { VERIFICATION_COPY } from "@/lib/attar-taxonomy";
import { ShieldCheck } from "lucide-react";

export function VerificationNote({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-brass/40 bg-brass/10 text-pine-deep shadow-2xs ${
        compact ? "p-3 text-[11px]" : "p-4 text-xs"
      }`}
    >
      <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-brass-deep" />
      <p className="font-light leading-relaxed">
        <span className="font-semibold text-neutral-900">Authenticity note: </span>
        {VERIFICATION_COPY.banner}
      </p>
    </div>
  );
}
