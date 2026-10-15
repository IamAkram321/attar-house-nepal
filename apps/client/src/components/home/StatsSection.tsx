import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGetStats } from "@workspace/api-client-react";
import { Sparkles, Droplets, Clock, Award } from "lucide-react";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

function Counter({ end, suffix = "", duration = 2 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutProgress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="flex items-baseline font-serif text-4xl sm:text-5xl md:text-6xl text-neutral-900 font-normal tracking-tight">
      <span>{count}</span>
      {suffix && (
        <span className="font-mono text-2xl sm:text-3xl text-amber-700 ml-0.5 font-light">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function StatsSection() {
  const { data: stats } = useGetStats({
    query: { queryKey: ["stats"] }
  });

  const statItems = [
    {
      label: "Pure Natural Extracts",
      value: 100,
      suffix: "%",
      icon: Droplets,
      code: "METRIC-01"
    },
    {
      label: "Months Maceration",
      value: 6,
      suffix: "+",
      icon: Clock,
      code: "METRIC-02"
    },
    {
      label: "Numbered Flacons Decanted",
      value: 5000,
      suffix: "+",
      icon: Sparkles,
      code: "METRIC-03"
    },
    {
      label: "Patron Satisfaction",
      value: 99,
      suffix: "%",
      icon: Award,
      code: "METRIC-04"
    }
  ];

  return (
    <section className="relative py-14 md:py-20 bg-[#FAF8F5] text-neutral-900 border-y border-neutral-300/80 overflow-hidden selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* Background Subtle Mesh & Ambient Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#c5a265_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-amber-200/20 blur-[130px]" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-7 md:p-8 border border-neutral-300/80 shadow-2xs hover:border-amber-500/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Code Badge & Icon */}
                <div className="flex items-center justify-between mb-4 border-b border-neutral-200/70 pb-3">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-medium">
                    {item.code}
                  </span>
                  <Icon className="w-4 h-4 text-amber-700 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Main Counter Display */}
                <div className="my-1">
                  <Counter end={item.value} suffix={item.suffix} />
                </div>

                {/* Metric Label */}
                <div className="mt-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-600 font-medium block">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}