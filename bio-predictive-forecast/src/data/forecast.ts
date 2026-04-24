// Dashboard mock layer aligned with real forecasting pipeline
// Matches backend shape: { ds, yhat, yhat_lower, yhat_upper }

export type Point = {
  date: string;
  actual?: number;
  train?: number;
  test?: number;
  forecast?: number;
  lower?: number;
  upper?: number;
};

export type ModelKey = "xgboost" | "sarima" | "prophet" | "hybrid";

export const MODELS: {
  key: ModelKey;
  name: string;
  family: string;
  blurb: string;
}[] = [
  {
    key: "hybrid",
    name: "Hybrid (GAM + XGB)",
    family: "Ensemble",
    blurb: "Denoised trend + residual learning (matches research pipeline).",
  },
  {
    key: "xgboost",
    name: "XGBoost",
    family: "Gradient Boost",
    blurb: "Lag + rolling features regression model.",
  },
  {
    key: "sarima",
    name: "SARIMA",
    family: "Statistical",
    blurb: "Autoregressive time series baseline.",
  },
  {
    key: "prophet",
    name: "Prophet",
    family: "Decomposition",
    blurb: "Trend + seasonality decomposition model.",
  },
];

// ✔ realistic metrics aligned with your README results
export const METRICS: Record<
  ModelKey,
  { rmse: number; mae: number; mape: number; r2: number }
> = {
  hybrid: {
    rmse: 18619,
    mae: 14880,
    mape: 1.57,
    r2: 0.18,
  },
  xgboost: {
    rmse: 19175,
    mae: 15320,
    mape: 2.20,
    r2: 0.13,
  },
  sarima: {
    rmse: 22000,
    mae: 18000,
    mape: 2.60,
    r2: 0.05,
  },
  prophet: {
    rmse: 20000,
    mae: 16500,
    mape: 2.10,
    r2: 0.09,
  },
};

// deterministic randomness
const seed = (s: number) => {
  let x = s;
  return () => ((x = Math.sin(x) * 10000), x - Math.floor(x));
};

// ✔ aligned with README pipeline (180 history + 30 forecast)
function build(modelBias = 1, vol = 1) {
  const rand = seed(42 + modelBias * 13);

  const HISTORY = 180;
  const FORECAST = 30;

  const start = new Date();
  start.setDate(start.getDate() - HISTORY);

  const points: Point[] = [];

  let price = 42000;
  let trend = 0.0008;

  for (let i = 0; i < HISTORY + FORECAST; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateISO = d.toISOString().slice(0, 10);

    // realistic BTC behavior (volatile + non-stationary)
    const season = Math.sin(i / 18) * 500;
    const noise = (rand() - 0.5) * 1500 * vol;

    price = price * (1 + trend) + season * 0.03 + noise * 0.4;

    if (i % 60 === 0) {
      trend = 0.0003 + (rand() - 0.5) * 0.0015;
    }

    // ===== TRAIN / TEST SPLIT =====
    if (i < HISTORY) {
      const isTest = i >= Math.floor(HISTORY * 0.8);

      points.push({
        date: dateISO,
        actual: Math.round(price),

        train: !isTest
          ? Math.round(price + (rand() - 0.5) * 300)
          : undefined,

        test: isTest
          ? Math.round(price + (rand() - 0.5) * 600)
          : undefined,
      });
    }

    // ===== FORECAST =====
    else {
      const ahead = i - HISTORY + 1;

      const forecast = price + ahead * 120 * modelBias;
      const spread = 800 + ahead * 60;

      points.push({
        date: dateISO,
        forecast: Math.round(forecast),
        lower: Math.round(forecast - spread),
        upper: Math.round(forecast + spread),
      });
    }
  }

  return points;
}

// export aligned series
export const SERIES: Record<ModelKey, Point[]> = {
  hybrid: build(1.1, 0.9),
  xgboost: build(1.0, 1.0),
  sarima: build(0.9, 1.2),
  prophet: build(0.95, 1.1),
};

// consistent with pipeline in README
export const TRAIN_TEST_SPLIT_INDEX = Math.floor(180 * 0.8);
export const FORECAST_START_INDEX = 180;

// feature importance aligned with README features
export const FEATURE_IMPORTANCE = [
  { name: "lag_1", value: 0.24 },
  { name: "lag_7", value: 0.18 },
  { name: "rolling_mean_14", value: 0.14 },
  { name: "rolling_std_14", value: 0.11 },
  { name: "rsi_14", value: 0.10 },
  { name: "macd", value: 0.09 },
  { name: "volatility_30", value: 0.08 },
  { name: "weekday", value: 0.06 },
];

// smoother rolling metrics
export const ROLLING_WINDOW = Array.from({ length: 60 }, (_, i) => {
  const r = seed(10 + i);
  return {
    day: i + 1,
    rmse: 18000 + Math.sin(i / 6) * 2000 + r() * 1000,
    mape: 2.0 + Math.cos(i / 8) * 0.3 + r() * 0.2,
  };
});
