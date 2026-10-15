import { motion } from "framer-motion";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div className={`flex flex-col mb-4 md:mb-6 ${alignmentClasses[align]} ${className}`}>
      {/* Category / Eyebrow Label */}
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-mono font-medium text-amber-800/90 dark:text-amber-400/90 mb-2"
        >
          {label}
        </motion.div>
      )}

      {/* Main Title */}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-neutral-900 dark:text-neutral-100 tracking-tight leading-[1.1]"
      >
        {title}
      </motion.h2>

      {/* Optional Integrated Subtitle/Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-neutral-600 dark:text-neutral-400 text-base md:text-lg font-light leading-relaxed max-w-2xl"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}