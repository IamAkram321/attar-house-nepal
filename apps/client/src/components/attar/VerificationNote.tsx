import { Link } from "wouter";
import { VERIFICATION_COPY } from "@/lib/attar-taxonomy";
import { Sparkles } from "lucide-react";

export function VerificationNote({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50/40 text-emerald-900 shadow-2xs ${
        compact ? "p-3 text-[11px]" : "p-4 text-xs"
      }`}
    >
      <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
      <p className="font-light leading-relaxed">
        <span className="font-semibold text-emerald-700">Quality assurance:</span>
        {VERIFICATION_COPY.banner}
      </p>
    </div>
  );
}