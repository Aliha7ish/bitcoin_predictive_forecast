import { Logo } from "./Logo";
import { NavLink } from "@/components/NavLink";

export const Footer = () => (
  <footer className="relative mt-24 border-t border-border">
    <div className="container py-14">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A research-grade lab for hybrid time-series forecasting — inspired by patterns of natural growth.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <span className="pulse-dot" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">models live · v0.4.2</span>
          </div>
        </div>
        <FooterCol title="Product" links={[["Dashboard","/dashboard"],["Models","/dashboard"]]} />
        <FooterCol title="Research" links={[["Methodology","/research"],["Backtesting","/research"],["Changelog","/research"]]} />
        <FooterCol title="Lab"      links={[["About","/research"],["Contact","/research"],["Press","/research"]]} />
      </div>
      <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} Verdant Forecast Lab — all forecasts are research artefacts, not financial advice.</p>
        <p className="font-mono">lat 47.37° · lon 8.54°</p>
      </div>
    </div>
  </footer>
);

const FooterCol = ({ title, links }: { title: string; links: [string, string][] }) => (
  <div>
    <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h4>
    <ul className="mt-4 space-y-2.5">
      {links.map(([label, to]) => (
        <li key={label}>
          <NavLink to={to} className="text-sm text-foreground/80 hover:text-foreground">{label}</NavLink>
        </li>
      ))}
    </ul>
  </div>
);
