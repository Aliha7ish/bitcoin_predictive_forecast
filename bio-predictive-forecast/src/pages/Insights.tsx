import { PageShell } from "@/components/site/PageShell";
import { SubtleVeins } from "@/components/site/SubtleVeins";
import { Reveal } from "@/components/site/Reveal";
import { FEATURE_IMPORTANCE, ROLLING_WINDOW } from "@/data/forecast";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltip = {
  contentStyle: {
    background: "hsl(var(--surface-2) / 0.92)",
    backdropFilter: "blur(12px)",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12, fontSize: 12, color: "hsl(var(--foreground))",
  },
  labelStyle: { color: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono", fontSize: 10 },
};

const Insights = () => {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <SubtleVeins />
        <div className="container relative pb-10 pt-6">
          <Reveal>
            <span className="chip w-fit"><span className="pulse-dot" /><span className="font-mono uppercase tracking-widest">explainability</span></span>
            <h1 className="mt-4 font-display text-4xl md:text-5xl text-gradient">Inside the ensemble.</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Every forecast is an argument. These are the features, lags, and rolling windows the model uses to make it.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container space-y-6">
        {/* Feature importance */}
        <Reveal>
          <div className="glass rounded-2xl p-6">
            <Header eyebrow="01 · attribution" title="Feature importance" desc="Normalised gain across the hybrid stack." />
            <div className="mt-6 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 20, right: 16, top: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="barFill" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="hsl(var(--accent))"  stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="2 6" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} width={140} />
                  <Tooltip {...tooltip} formatter={(v: any) => [(v as number).toFixed(3), "importance"]} />
                  <Bar dataKey="value" fill="url(#barFill)" radius={[0, 8, 8, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lag visualization */}
          <Reveal>
            <div className="glass rounded-2xl p-6">
              <Header eyebrow="02 · memory" title="Lag features" desc="How much the past matters at each horizon." />
              <div className="mt-6 grid grid-cols-7 gap-2">
                {[1,2,3,5,7,14,21,28,30,45,60,90,120,180].map((lag, i) => {
                  const intensity = Math.max(0.08, 1 / Math.log(lag + 1.6));
                  return (
                    <div key={lag} className="group relative aspect-square rounded-md transition hover:scale-105"
                         style={{ background: `hsl(var(--primary) / ${intensity})`, boxShadow: `inset 0 0 0 1px hsl(var(--border))` }}>
                      <span className="absolute inset-0 grid place-items-center font-mono text-[10px] text-primary-foreground mix-blend-difference">
                        {lag}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 font-mono text-[11px] text-muted-foreground">cell intensity = inverse-log lag weight · darker squares carry more signal</p>
            </div>
          </Reveal>

          {/* Rolling window */}
          <Reveal delay={0.05}>
            <div className="glass rounded-2xl p-6">
              <Header eyebrow="03 · stability" title="Rolling window" desc="60-day walk-forward error trajectory." />
              <div className="mt-6 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ROLLING_WINDOW} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="2 6" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
                    <Tooltip {...tooltip} />
                    <Line type="monotone" dataKey="rmse" stroke="hsl(var(--chart-forecast))" strokeWidth={2} dot={false}
                          style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Explainability cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Regime detector", body: "Volatility-clustered HMM segments the series into bull, bear and chop states; model weights adapt accordingly." },
            { title: "Residual learner", body: "A lightweight XGBoost residual head corrects the SARIMA baseline on non-linear deviations." },
            { title: "Confidence calibration", body: "Quantile regression bootstrap produces honest 80% / 95% bands per horizon step." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <div className="rounded-2xl glass p-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">0{i + 4}</span>
                <h3 className="mt-2 font-display text-2xl">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

const Header = ({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) => (
  <div className="flex flex-col gap-1">
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
    <h2 className="font-display text-3xl text-foreground">{title}</h2>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </div>
);

export default Insights;
