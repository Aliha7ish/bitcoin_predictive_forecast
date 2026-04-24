import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { PageShell } from "@/components/site/PageShell";
import { HeroCanvas } from "@/components/site/HeroCanvas";
import { SubtleVeins } from "@/components/site/SubtleVeins";
import { Reveal } from "@/components/site/Reveal";
import { MiniSpark } from "@/components/charts/MiniSpark";
import { ArrowUpRight, Boxes, GitBranch, LineChart, Sparkles, Layers, Cpu } from "lucide-react";
import { MODELS, METRICS, SERIES } from "@/data/forecast";

const Index = () => {
  return (
    <PageShell>
      {/* ===================== HERO ===================== */}
      <section className="relative isolate overflow-hidden">
        <HeroCanvas />
        <div className="container relative pb-32 pt-20 md:pb-44 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="chip mx-auto">
                <span className="pulse-dot" />
                <span className="font-mono uppercase tracking-widest">Verdant lab · forecast engine v0.4</span>
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-7 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl lg:text-[5.4rem]">
                <span className="text-gradient">Forecast the future of</span>
                <br />
                <span className="text-gradient-mint italic">financial markets</span>
                <span className="text-gradient"> with AI intelligence.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mx-auto mt-7 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
                Hybrid machine-learning models inspired by natural growth patterns —
                XGBoost, SARIMA, Prophet and SVM unified in one research-grade dashboard.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild variant="hero" size="xl">
                  <NavLink to="/dashboard">
                    Launch dashboard <ArrowUpRight className="ml-1 h-4 w-4" />
                  </NavLink>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <NavLink to="/insights">View models</NavLink>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.45}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
                <Stat label="hybrid stack RMSE" value="612.4" />
                <Dot />
                <Stat label="MAPE" value="1.21%" />
                <Dot />
                <Stat label="R²" value="0.984" />
                <Dot />
                <Stat label="backtests" value="1,284" />
              </div>
            </Reveal>
          </div>

          {/* Floating preview card */}
          <Reveal delay={0.55}>
            <div className="relative mx-auto mt-20 max-w-5xl">
              <div className="absolute -inset-x-10 -inset-y-12 -z-10 rounded-[2.5rem] bg-gradient-mint opacity-20 blur-3xl" />
              <div className="glass-strong rounded-2xl p-2 shadow-float animate-float">
                <PreviewCard />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      <section className="relative border-y border-border bg-surface/40">
        <div className="container py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-xs uppercase tracking-[0.25em] text-muted-foreground/70 font-mono">
            <span>BTC · ETH · SOL · ADA</span>
            <span className="hidden md:inline">·</span>
            <span>5 model families</span>
            <span className="hidden md:inline">·</span>
            <span>Walk-forward validation</span>
            <span className="hidden md:inline">·</span>
            <span>Confidence-aware forecasts</span>
            <span className="hidden md:inline">·</span>
            <span>Open methodology</span>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="relative py-28">
        <SubtleVeins />
        <div className="container relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">A living forecast engine</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">
                <span className="text-gradient">Architecture grown,</span> <span className="text-gradient-mint italic">not assembled.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every layer — from feature engineering to ensemble stacking — is calibrated to the rhythm of the underlying market.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              { icon: Layers,   title: "Hybrid stacking",     body: "Base learners feed a meta-model that learns when to trust whom.", spark: [3,5,4,7,6,9,8,12,11,14,13,16] },
              { icon: GitBranch,title: "Walk-forward CV",     body: "Train, test, slide. No look-ahead. Every prediction is honest.", spark: [9,8,10,9,11,10,12,11,13,12,14,13] },
              { icon: Cpu,      title: "Online inference",    body: "Forecasts refresh as new candles arrive — no cold-start latency.", spark: [4,6,5,7,9,8,10,12,11,14,16,18] },
              { icon: Boxes,    title: "Engineered features", body: "Lag, rolling moments, MACD, RSI, regime flags — composed, not bolted on.", spark: [6,7,5,8,7,9,8,10,9,11,10,12] },
              { icon: LineChart,title: "Confidence bands",    body: "Bootstrapped intervals visualise where the model is — and isn't — sure.", spark: [12,10,11,9,10,8,9,7,8,6,7,5] },
              { icon: Sparkles, title: "Explainable",         body: "SHAP-style attribution makes every forecast a transparent argument.", spark: [2,4,3,5,4,6,5,8,7,10,9,12] },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="group relative h-full overflow-hidden rounded-2xl glass p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-edge opacity-0 transition group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-2 text-primary">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">0{i+1}</span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                  <div className="mt-5">
                    <MiniSpark data={f.spark} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== MODELS ===================== */}
      <section className="relative py-24">
        <div className="container">
          <Reveal>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">The model garden</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl text-gradient">Five learners, one ensemble.</h2>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Each model captures a different facet of market behaviour. The hybrid stack listens to all of them.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 overflow-hidden rounded-2xl border border-border glass">
            <div className="grid grid-cols-12 border-b border-border bg-surface-2/40 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <div className="col-span-4">Model</div>
              <div className="col-span-3 hidden md:block">Family</div>
              <div className="col-span-2 text-right">RMSE</div>
              <div className="col-span-2 text-right">MAPE</div>
              <div className="col-span-1 text-right">R²</div>
            </div>
            {MODELS.map((m, i) => {
              const met = METRICS[m.key];
              const isHybrid = m.key === "hybrid";
              return (
                <Reveal key={m.key} delay={i * 0.04}>
                  <div className={`group grid grid-cols-12 items-center px-6 py-5 transition-colors hover:bg-surface-2/40 ${i !== MODELS.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="col-span-4 flex items-center gap-3">
                      <span className={`h-8 w-1 rounded-full ${isHybrid ? "bg-primary shadow-glow" : "bg-border"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xl">{m.name}</span>
                          {isHybrid && <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">primary</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground md:hidden">{m.family}</p>
                      </div>
                    </div>
                    <div className="col-span-3 hidden font-mono text-xs text-muted-foreground md:block">{m.family}</div>
                    <div className="col-span-2 text-right font-mono text-sm">{met.rmse.toFixed(1)}</div>
                    <div className="col-span-2 text-right font-mono text-sm">{met.mape.toFixed(2)}%</div>
                    <div className="col-span-1 text-right font-mono text-sm text-primary">{met.r2.toFixed(3)}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="relative py-28">
        <div className="container">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border glass-strong p-10 md:p-16 noise">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
              <div className="grid-veins absolute inset-0 opacity-30" />
              <div className="relative grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
                <div>
                  <h2 className="font-display text-4xl leading-tight md:text-6xl">
                    <span className="text-gradient">A research lab for </span><span className="text-gradient-mint italic">forecasting</span><span className="text-gradient">, in your browser.</span>
                  </h2>
                  <p className="mt-5 max-w-xl text-muted-foreground">
                    Open the dashboard, switch between models, and watch the ensemble negotiate uncertainty in real time.
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-3 md:items-end">
                  <Button asChild variant="hero" size="xl" className="md:self-end">
                    <NavLink to="/dashboard">Launch dashboard <ArrowUpRight className="ml-1 h-4 w-4" /></NavLink>
                  </Button>
                  <Button asChild variant="outline" size="xl" className="md:self-end">
                    <NavLink to="/research">Read methodology</NavLink>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <span className="inline-flex items-baseline gap-2">
    <span className="font-mono text-sm text-foreground">{value}</span>
    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
  </span>
);

const Dot = () => <span className="h-1 w-1 rounded-full bg-border" />;

const PreviewCard = () => {
  const data = SERIES.hybrid;
  return (
    <div className="overflow-hidden rounded-xl bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-secondary/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">verdant://btc/forecast/hybrid</span>
        </div>
        <span className="hidden font-mono text-[11px] text-muted-foreground sm:block">30-day horizon · 95% CI</span>
      </div>
      <div className="p-2">
        {/* Lazy-load heavy chart only on hero */}
        <PreviewChart data={data} />
      </div>
    </div>
  );
};

import { ForecastChart } from "@/components/charts/ForecastChart";
const PreviewChart = ({ data }: { data: typeof SERIES.hybrid }) => <ForecastChart data={data} />;

export default Index;
