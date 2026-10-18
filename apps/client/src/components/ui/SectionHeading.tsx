export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className = "",
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div className={`flex flex-col mb-6 ${alignmentClasses[align]} ${className}`}>
      {label && (
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-accent-foreground mb-2">
          {label}
        </p>
      )}

      <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-[1.15]">
        {title}
      </h2>

      {description && (
        <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
