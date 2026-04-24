import { useEffect, useRef } from "react";

/**
 * Neural / vein flow background.
 * Particles drift along Perlin-ish curves, connecting to nearest neighbours
 * with mint filaments — bio-inspired data flow.
 */
export const HeroCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0, dpr = 1;

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: P[] = [];

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((w * h) / 14000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
      }));
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // soft aurora wash
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, "hsla(154, 100%, 50%, 0.10)");
      grad.addColorStop(1, "hsla(154, 100%, 50%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // update
      for (const p of particles) {
        const n = Math.sin((p.x + t * 0.02) * 0.004) + Math.cos((p.y + t * 0.015) * 0.004);
        p.vx += n * 0.0025;
        p.vy += Math.cos(n) * 0.0025;
        p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
        p.vy = Math.max(-0.6, Math.min(0.6, p.vy));
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
      }

      // connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) {
            const o = 1 - Math.sqrt(d2) / 130;
            ctx.strokeStyle = `hsla(154, 100%, 60%, ${o * 0.35})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const p of particles) {
        ctx.fillStyle = "hsla(150, 80%, 80%, 0.85)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    setup();
    raf = requestAnimationFrame(tick);
    const onResize = () => setup();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-70" />
      {/* gradient veil edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_30%,hsl(var(--background))_85%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
};
