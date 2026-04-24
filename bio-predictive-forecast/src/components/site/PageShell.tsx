import { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export const PageShell = ({ children, withFooter = true }: { children: ReactNode; withFooter?: boolean }) => (
  <div className="relative min-h-screen">
    <Nav />
    <main className="pt-24">{children}</main>
    {withFooter && <Footer />}
  </div>
);
