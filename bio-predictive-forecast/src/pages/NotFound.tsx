import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PageShell } from "@/components/site/PageShell";
import { SubtleVeins } from "@/components/site/SubtleVeins";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <SubtleVeins />
        <div className="container relative grid min-h-[70vh] place-items-center text-center">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">error · 404</span>
            <h1 className="mt-4 font-display text-7xl text-gradient md:text-9xl">Off-trail</h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              The path <span className="font-mono text-foreground">{location.pathname}</span> doesn’t exist in the lab. Let’s get you back to known terrain.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-8">
              <Link to="/">Return home</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default NotFound;
