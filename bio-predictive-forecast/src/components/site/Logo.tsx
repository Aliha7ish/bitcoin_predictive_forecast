import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
    <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-mint shadow-glow">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20c4-1 7-5 8-10 1 5 4 9 8 10" />
        <path d="M11 10V3" />
      </svg>
    </span>
    <span className="flex flex-col leading-none">
      <span className="font-display text-lg tracking-tight text-foreground">Verdant</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">forecast lab</span>
    </span>
  </Link>
);
