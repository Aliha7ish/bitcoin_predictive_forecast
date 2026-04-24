import { useMemo, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { SubtleVeins } from "@/components/site/SubtleVeins";
import { Reveal } from "@/components/site/Reveal";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { MODELS, METRICS, ModelKey, SERIES } from "@/data/forecast";
import { Activity, ArrowDown, ArrowUp, Layers, Sparkles, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [model, setModel] = useState<ModelKey>("hybrid");
  const data = SERIES[model];

  const last = useMemo(() => data.filter((d) => d.actual !== undefined).slice(-1)[0]?.actual ?? 0, [data]);
  const horizonEnd = useMemo(() => data.slice(-1)[0]?.forecast ?? 0, [data]);
  const change = horizonEnd - last;
  const pct = (change / last) * 100;
  const met = METRICS[model];

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <SubtleVeins />
        <div className="container relative pb-12 pt-6">
          <Reveal>
            <div className="flex flex-col gap-2">
              <span className="chip w-fit">
                <span className="pulse-dot" /> <span className="font-mono uppercase tracking-widest">live · BTC/USD</span>
              </span>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl md:text-5xl text-gradient">Forecast workspace</h1>
                  <p className="mt-1 text-sm text-muted-foreground">30-day horizon · 95% confidence interval · last refreshed just now</p>
                </div>
                <div className="flex items-end gap-6">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">spot</div>
                    <div className="mt-1 font-display text-3xl text-foreground">${last.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">predicted +30d</div>
                    <div className={`mt-1 flex items-center gap-1 font-display text-3xl ${change >= 0 ? "text-primary" : "text-destructive"}`}>
                      {change >= 0 ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                      ${horizonEnd.toLocaleString()}
                      <span className="ml-2 font-mono text-sm">{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Model selector */}
          <Reveal>
            <aside className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between px-2 pb-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Models</h3>
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                {MODELS.map((m) => {
                  const active = m.key === model;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setModel(m.key)}
                      className={`group relative w-full rounded-xl border px-3 py-3 text-left transition-all ${
                        active
                          ? "border-primary/40 bg-primary/5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                          : "border-transparent hover:border-border hover:bg-surface-2/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-display text-base ${active ? "text-foreground" : "text-foreground/85"}`}>{m.name}</span>
                        {active && <span className="pulse-dot" />}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span>{m.family}</span>
                        <span>·</span>
                        <span className="text-primary/80">RMSE {METRICS[m.key].rmse.toFixed(0)}</span>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{m.blurb}</p>
                    </button>
                  );
                })}
              </div>
            </aside>
          </Reveal>

          {/* Chart panel */}
          <Reveal delay={0.05}>
            <div className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">price · forecast · CI</span>
                </div>
                <Legend />
              </div>
              <ForecastChart data={data} />
            </div>
          </Reveal>
        </div>

        {/* Metrics grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "RMSE",  value: met.rmse.toFixed(2), hint: "root mean squared error",      icon: Activity },
            { label: "MAE",   value: met.mae.toFixed(2),  hint: "mean absolute error",          icon: Sparkles },
            { label: "MAPE",  value: `${met.mape.toFixed(2)}%`, hint: "mean absolute % error",  icon: TrendingUp },
            { label: "R²",    value: met.r2.toFixed(3),   hint: "coefficient of determination", icon: Layers },
          ].map((m, i) => (
            <Reveal key={m.label} delay={i * 0.04}>
              <div className="group relative overflow-hidden rounded-2xl glass p-5 transition hover:border-primary/40">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</span>
                  <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="mt-3 font-display text-4xl text-gradient">{m.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Confidence panel */}
        <Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ConfidenceCard label="Lower band (30d)"  value={data.slice(-1)[0]?.lower ?? 0}    tone="muted" />
            <ConfidenceCard label="Forecast (30d)"    value={data.slice(-1)[0]?.forecast ?? 0} tone="primary" />
            <ConfidenceCard label="Upper band (30d)"  value={data.slice(-1)[0]?.upper ?? 0}    tone="muted" />
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
};

const Legend = () => (
  <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
    <LegendDot color="hsl(var(--chart-actual))" label="actual" />
    <LegendDot color="hsl(var(--chart-train))" label="train" />
    <LegendDot color="hsl(var(--chart-test))" label="test" dashed />
    <LegendDot color="hsl(var(--chart-forecast))" label="forecast" glow />
    <span className="hidden md:inline">▒ 95% CI</span>
  </div>
);

const LegendDot = ({ color, label, dashed, glow }: { color: string; label: string; dashed?: boolean; glow?: boolean }) => (
  <span className="inline-flex items-center gap-1.5">
    <span
      className="h-[2px] w-5"
      style={{ background: color, borderTop: dashed ? `1.5px dashed ${color}` : undefined, boxShadow: glow ? `0 0 8px ${color}` : undefined, backgroundColor: dashed ? "transparent" : color }}
    />
    {label}
  </span>
);

const ConfidenceCard = ({ label, value, tone }: { label: string; value: number; tone: "primary" | "muted" }) => (
  <div className="rounded-2xl glass p-5">
    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className={`mt-2 font-display text-3xl ${tone === "primary" ? "text-primary" : "text-foreground/80"}`}>${value.toLocaleString()}</div>
  </div>
);

export default Dashboard;
