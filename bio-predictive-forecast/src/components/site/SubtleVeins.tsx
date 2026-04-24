/** Lightweight SVG vein/dataflow background for non-hero sections. */
export const SubtleVeins = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
    <svg className="absolute inset-0 h-full w-full opacity-[0.18]" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="vein" x1="0" x2="1">
          <stop offset="0%"  stopColor="hsl(154 100% 50%)" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(154 100% 50%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(154 100% 50%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 8 }).map((_, i) => {
        const y = 80 + i * 90;
        return (
          <path
            key={i}
            d={`M -50 ${y} C 200 ${y - 40 + i * 6}, 500 ${y + 80 - i * 8}, 800 ${y - 30}, 1100 ${y + 20}, 1300 ${y - 10}`}
            fill="none"
            stroke="url(#vein)"
            strokeWidth="0.8"
            strokeDasharray="6 14"
            className="animate-dash"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        );
      })}
    </svg>
    <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background" />
  </div>
);
