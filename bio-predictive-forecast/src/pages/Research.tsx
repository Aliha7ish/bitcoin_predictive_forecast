import { PageShell } from "@/components/site/PageShell";
import { SubtleVeins } from "@/components/site/SubtleVeins";
import { Reveal } from "@/components/site/Reveal";
import { Github } from "lucide-react";


const Research = () => {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <SubtleVeins />
        <div className="container relative pb-10 pt-6">
          <Reveal>
            <span className="chip w-fit"><span className="pulse-dot" /><span className="font-mono uppercase tracking-widest">paper · v0.4 · 2025</span></span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05]">
              <span className="text-gradient">Hybrid forecasting of </span>
              <span className="text-gradient-mint italic">cryptoassets</span>
              <span className="text-gradient"> through bio-inspired stacking.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Verdant Research Lab · technical methodology, full transparency, no black boxes.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com/Aliha7ish/bitcoin_predictive_forecast.git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-4 py-2 text-sm font-mono text-foreground hover:bg-surface-2/70 transition"
              >
                <Github className="h-4 w-4" />
                View Source Code
              </a>

              <span className="text-xs text-muted-foreground font-mono">
                Open-source · reproducible research
              </span>
            </div>

          </Reveal>
        </div>
      </section>

      <section className="container">
        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          {/* TOC */}
          <Reveal>
            <aside className="sticky top-28 hidden self-start lg:block">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Contents</h3>
              <ol className="mt-4 space-y-3 text-sm">
                {[
                  "Abstract",
                  "Feature engineering",
                  "Hybrid modeling",
                  "Backtesting protocol",
                  "Results",
                  "Limitations",
                ].map((s, i) => (
                  <li key={s} className="flex items-baseline gap-3 text-muted-foreground hover:text-foreground transition">
                    <span className="font-mono text-[10px] text-primary">0{i + 1}</span>
                    <a href={`#sec-${i + 1}`}>{s}</a>
                  </li>
                ))}
              </ol>
            </aside>
          </Reveal>

          {/* Body */}
          <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-normal prose-h2:text-3xl prose-h2:text-gradient prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground">
            <Reveal>
              <Section id="sec-1" eyebrow="01" title="Abstract">
                <p>
                  This work presents a practical framework for forecasting Bitcoin prices using a combination of
                  statistical and machine learning models. The system supports multiple approaches including
                  SARIMA, Prophet, Naive baselines, and a hybrid model combining gradient boosting with trend extraction.
                </p>
                <p>
                  The objective is not only to generate forecasts, but to analyze the behavior of different models
                  under highly volatile, non-stationary financial data and evaluate their ability to generalize.
                </p>
              </Section>

            </Reveal>

            <Reveal>
              <Section id="sec-2" eyebrow="02" title="Feature engineering">
                <p>
                  The dataset is based on OHLC price data. For machine learning models, additional features were
                  introduced to capture temporal structure and local patterns.
                </p>

                <ul>
                  <li>Lag features: lag_1, lag_3, lag_7</li>
                  <li>Rolling statistics: mean and standard deviation (7, 14, 30)</li>
                  <li>Calendar features: day_of_week, month, day_of_year</li>
                  <li>Cyclical encoding: sin/cos transformations for time features</li>
                  <li>Binary indicators: weekend flags</li>
                </ul>

                <Equation>
                  x<sub>t</sub><sup>(roll)</sup> = (1 / w) · Σ<sub>i=1..w</sub> p<sub>t-i</sub>
                </Equation>

                <p>
                  All features are computed using strictly past data to avoid leakage.
                </p>
              </Section>

            </Reveal>

            <Reveal>
              <Section id="sec-3" eyebrow="03" title="Hybrid modeling">
                <p>
                  A hybrid approach was implemented by combining trend extraction with machine learning.
                  A Generalized Additive Model (GAM) is used to capture the underlying trend of the series,
                  while XGBoost is trained on residual patterns and engineered features.
                </p>

                <Equation>
                  y = Trend + Residual
                </Equation>

                <p>
                  This decomposition allows the model to separate long-term structure from short-term fluctuations.
                  Compared to pure tree-based models, this reduces overfitting and improves generalization.
                </p>
              </Section>

            </Reveal>

            <Reveal>
              <Section id="sec-4" eyebrow="04" title="Backtesting protocol">
                <p>
                  Model evaluation is performed using a train-test split with configurable test size.
                  Performance is measured using MAE, RMSE, MAPE, and R².
                </p>

                <ul className="not-prose mt-4 grid gap-2 text-sm text-muted-foreground">
                  {[
                    "No look-ahead bias: models use only past data",
                    "Consistent preprocessing across train and test sets",
                    "Evaluation on unseen future observations",
                    "Visualization of forecast vs actual values",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-3 rounded-xl border border-border bg-surface-2/40 p-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shadow-glow" /> {b}
                    </li>
                  ))}
                </ul>
              </Section>

            </Reveal>

            <Reveal>
              <Section id="sec-5" eyebrow="05" title="Results">
                <p>
                  Experimental results highlight key differences between modeling approaches:
                </p>

                <ul>
                  <li>
                    Tree-based models (Random Forest, XGBoost) show strong performance on training data
                    but fail to generalize, with test errors exceeding 22,000 USD.
                  </li>
                  <li>
                    SARIMA converges to a simple AR(1) process and produces smooth forecasts that fail
                    to capture market volatility.
                  </li>
                  <li>
                    Prophet provides stable trend estimation but struggles with sudden regime changes.
                  </li>
                  <li>
                    The hybrid model improves stability by combining trend extraction with residual learning.
                  </li>
                </ul>

                <p>
                  These results confirm that Bitcoin behaves as a highly volatile, non-stationary process
                  with weak or no consistent seasonality.
                </p>
              </Section>

            </Reveal>

            <Reveal>
              <Section id="sec-6" eyebrow="06" title="Limitations">
                <p>
                  The models assume continuity in historical patterns and cannot capture sudden external shocks
                  such as regulatory changes or market crashes.
                </p>
                <p>
                  Additionally, tree-based models are limited to interpolation and cannot extrapolate beyond
                  observed price ranges, which restricts their forecasting ability in trending markets.
                </p>
              </Section>

            </Reveal>
          </article>
        </div>
      </section>
    </PageShell>
  );
};

const Section = ({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="not-prose mb-14 scroll-mt-32">
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
    <h2 className="mt-3 font-display text-3xl md:text-4xl text-gradient">{title}</h2>
    <div className="prose prose-invert mt-4 max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground">
      {children}
    </div>
  </section>
);

const Equation = ({ children }: { children: React.ReactNode }) => (
  <div className="not-prose my-5 rounded-xl border border-border bg-surface-2/40 p-5 text-center font-mono text-base text-foreground">
    {children}
  </div>
);

export default Research;
