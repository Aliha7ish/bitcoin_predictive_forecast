import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUpRight } from "lucide-react";

const links = [
  { to: "/dashboard",   label: "Dashboard" },
  { to: "/predict",     label: "Predict" },
  { to: "/research",    label: "Research" },
];

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="container">
        <div className={`mx-auto flex items-center justify-between rounded-2xl border border-border px-4 py-2.5 transition-all duration-500 ${scrolled ? "glass-strong" : "bg-background/30 backdrop-blur-md"}`}>
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeClassName="text-foreground bg-surface-2"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <NavLink to="/research">Docs</NavLink>
            </Button>
            <Button asChild variant="hero" size="sm">
              <NavLink to="/dashboard">
                Launch dashboard <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </NavLink>
            </Button>
          </div>
          <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-lg border border-border md:hidden" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="mt-2 rounded-2xl border border-border glass-strong p-3 md:hidden animate-fade-in">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground" activeClassName="text-foreground bg-surface-2">
                  {l.label}
                </NavLink>
              ))}
              <Button asChild variant="hero" size="sm" className="mt-2">
                <NavLink to="/dashboard" onClick={() => setOpen(false)}>Launch dashboard</NavLink>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
