import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.io as pio
import matplotlib.pyplot as plt
from sklearn.metrics import r2_score
from MLModel import MLModel
from NaiveModel import NaiveModel
from ProphetModel import ProphetModel
from SarimaModel import SarimaModel


class ForecastEngine:

    def __init__(self, df):
        self.df = df.copy().sort_values("ds")

        # -----------------------------
        # MODEL REGISTRY
        # -----------------------------
        self.models = {
            "naive": NaiveModel,
            "sarima": SarimaModel,
            "prophet": ProphetModel,
            "xgb": lambda df: MLModel(df, "xgb"),
            "svm": lambda df: MLModel(df, "svm"),
            "hybrid": lambda df: MLModel(df, "hybrid"),
        }

    # =====================================
    # 1. TECHNICAL INDICATORS (SHARED)
    # =====================================
    def add_indicators(self, use_sma=False, use_ema=False, window=20):

        if use_sma:
            self.df["SMA"] = self.df["y"].rolling(window).mean()

        if use_ema:
            self.df["EMA"] = self.df["y"].ewm(span=window, adjust=False).mean()

    # =====================================
    # 2. GET MODEL
    # =====================================
    def get_model(self, model_type, df=None):

        df = df if df is not None else self.df

        if model_type not in self.models:
            raise ValueError(f"Unsupported model: {model_type}")

        model_class = self.models[model_type]

        return model_class(df)
    

    def _get_freq(self):
        freq = pd.infer_freq(self.df["ds"])
        return freq if freq is not None else "D"


    # =====================================
    # 3. FORECAST (MAIN ENTRY)
    # =====================================
    def forecast(self, model_type="naive", horizon=30, ci=0.95, df=None):

        model = self.get_model(model_type, df=df)

        freq = self._get_freq()


        print(f"Using model: {model_type}")
        print(f"Horizon: {horizon} steps")

        forecast_df = model.forecast(horizon=horizon, ci=ci, freq="D")

        return forecast_df

    # =====================================
    # 4. EVALUATION (UNIVERSAL)
    # =====================================
    def evaluate(self, y_true, y_pred):
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)

        min_len = min(len(y_true), len(y_pred))

        y_true = y_true[:min_len]
        y_pred = y_pred[:min_len]

        mae = np.mean(np.abs(y_true - y_pred))
        rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))

        # safer MAPE
        mape = np.mean(
            np.abs((y_true - y_pred) / np.maximum(np.abs(y_true), 1e-8))
        ) * 100

        r2 = r2_score(y_true, y_pred)

        return {"MAE": mae, "RMSE": rmse, "MAPE": mape, "R2 Score": r2}


    # =====================================
    # 5. VISUALIZATION (SHARED)
    # =====================================
    def plot_backtest(self, train, test, test_forecast, future_forecast=None):
        fig = go.Figure()

        # =====================================
        # TRAIN
        # =====================================
        fig.add_trace(go.Scatter(
            x=train["ds"],
            y=train["y"],
            mode="lines",
            name="Train",
            line=dict(color="blue")
        ))

        # =====================================
        # TEST (ACTUAL)
        # =====================================
        fig.add_trace(go.Scatter(
            x=test["ds"],
            y=test["y"],
            mode="lines",
            name="Test (Actual)",
            line=dict(color="orange")
        ))

        # =====================================
        # TEST PREDICTION
        # =====================================
        fig.add_trace(go.Scatter(
            x=test_forecast["ds"],
            y=test_forecast["yhat"],
            mode="lines",
            name="Test Prediction",
            line=dict(dash="dash", color="red")
        ))

        # =====================================
        # FUTURE FORECAST (OPTIONAL)
        # =====================================
        if future_forecast is not None:
            fig.add_trace(go.Scatter(
                x=future_forecast["ds"],
                y=future_forecast["yhat"],
                mode="lines",
                name="Future Forecast",
                line=dict(dash="dot", color="green")
            ))

        # =====================================
        # SPLIT LINES (IMPORTANT VISUAL CUE)
        # =====================================
        train_end = train["ds"].iloc[-1]
        test_end = test["ds"].iloc[-1]

        fig.add_shape(
            type="line",
            x0=train_end,
            x1=train_end,
            y0=0,
            y1=1,
            xref="x",
            yref="paper",
            line=dict(color="white", width=2, dash="dash")
        )


        fig.add_shape(
            type="line",
            x0=test_end,
            x1=test_end,
            y0=0,
            y1=1,
            xref="x",
            yref="paper",
            line=dict(color="red", width=2, dash="dash")
        )


        # =====================================
        # LAYOUT
        # =====================================
        fig.update_layout(
            title="Train / Test / Forecast Split Visualization",
            hovermode="x unified",
            template="plotly_dark",
            height=650
        )

        fig.update_xaxes(rangeslider_visible=True)

        fig.show()


    # =====================================
    # 6. BACKTEST (NEW 🔥)
    # =====================================
    def backtest(self, model_type="naive", test_size=30, ci=0.95):
        # -----------------------------
        # SPLIT
        # -----------------------------
        train = self.df.iloc[:-test_size].copy()
        test = self.df.iloc[-test_size:].copy()

        # -----------------------------
        # TRAIN MODEL
        # -----------------------------
        model = self.get_model(model_type, df=train)

        test_forecast = model.forecast(horizon=test_size, ci=ci)

        # -----------------------------
        # ALIGN TEST PREDICTIONS
        # -----------------------------
        test_merged = test.merge(test_forecast, on="ds", how="inner")

        metrics = self.evaluate(test_merged["y"], test_merged["yhat"])

        print("Backtest Results:")
        print(metrics)

        return train, test, test_forecast, metrics


    # =====================================
    # 7. AVAILABLE MODELS
    # =====================================
    def available_models(self):
        return list(self.models.keys())
    

    def model_info(self):
        return {
            "naive": "Baseline model (fast, simple)",
            "sarima": "Statistical model (good for seasonality)",
            "prophet": "Trend + seasonality (robust)",
            "xgb": "Machine learning model",
            "svm": "Kernel-based ML model",
            "hybrid": "Stacked ML (best accuracy, slower)"
        }