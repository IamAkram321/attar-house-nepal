interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "auto";
  showSubtitle?: boolean;
}

export function BrandLogo({
  className = "",
  size = "md",
  variant = "auto",
  showSubtitle = true,
}: BrandLogoProps) {
  const isLarge = size === "lg" || size === "xl";
  const isSmall = size === "sm";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        className={`flex items-center justify-center rounded-lg bg-pine text-ivory font-semibold ${
          isSmall ? "w-8 h-8 text-xs" : isLarge ? "w-11 h-11 text-base" : "w-10 h-10 text-sm"
        }`}
        aria-hidden
      >
        <span className="tracking-tight">AH</span>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-semibold uppercase tracking-[0.14em] ${
            variant === "dark"
              ? "text-neutral-900"
              : variant === "light"
                ? "text-white"
                : "text-foreground"
          } ${
            isSmall
              ? "text-sm"
              : size === "lg"
                ? "text-xl"
                : size === "xl"
                  ? "text-2xl"
                  : "text-base sm:text-lg"
          }`}
        >
          Attar House <span className="font-medium text-brass-deep">Nepal</span>
        </span>

        {showSubtitle && (
          <span
            className={`uppercase tracking-[0.3em] text-[9px] mt-1 font-medium ${
              variant === "light"
                ? "text-white/60"
                : variant === "dark"
                  ? "text-neutral-500"
                  : "text-neutral-500"
            }`}
          >
            Importer &amp; Retailer
          </span>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;
