import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.io as pio
import matplotlib.pyplot as plt
from sklearn.metrics import r2_score

from .MLModel import MLModel
from .NaiveModel import NaiveModel
from .ProphetModel import ProphetModel
from .SarimaModel import SarimaModel


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

        forecast_df = model.forecast(horizon=horizon, ci=ci)

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

        # =========================
        # Candlestick (if available)
        # =========================
        if all(col in train.columns for col in ["open", "high", "low", "close"]):

            fig.add_trace(go.Candlestick(
                x=train["ds"],
                open=train["open"],
                high=train["high"],
                low=train["low"],
                close=train["close"],
                name="Train Price",
                increasing_line_color="#22c55e",
                decreasing_line_color="#ef4444"
            ))

            fig.add_trace(go.Candlestick(
                x=test["ds"],
                open=test["open"],
                high=test["high"],
                low=test["low"],
                close=test["close"],
                name="Test Price",
                increasing_line_color="#f59e0b",
                decreasing_line_color="#ef4444"
            ))

        else:
            # =========================
            # 📊 Train / Test lines (fallback)
            # =========================
            fig.add_trace(go.Scatter(
                x=train["ds"],
                y=train["y"],
                mode="lines",
                name="Train",
                line=dict(color="#60a5fa", width=2)
            ))

            fig.add_trace(go.Scatter(
                x=test["ds"],
                y=test["y"],
                mode="lines",
                name="Test (Actual)",
                line=dict(color="#f59e0b", width=2)
            ))

        # =========================
        # Test Prediction
        # =========================
        fig.add_trace(go.Scatter(
            x=test_forecast["ds"],
            y=test_forecast["yhat"],
            mode="lines",
            name="Test Prediction",
            line=dict(color="#ef4444", width=3, dash="dash")
        ))

        # =========================
        # Confidence Ribbon (Test Forecast)
        # =========================
        fig.add_trace(go.Scatter(
            x=test_forecast["ds"],
            y=test_forecast["yhat_upper"],
            line=dict(width=0),
            showlegend=False
        ))

        fig.add_trace(go.Scatter(
            x=test_forecast["ds"],
            y=test_forecast["yhat_lower"],
            fill="tonexty",
            fillcolor="rgba(239,68,68,0.12)",  # red confidence zone
            line=dict(width=0),
            name="Test Confidence",
            hoverinfo="skip"
        ))

        # =========================
        # Future Forecast
        # =========================
        if future_forecast is not None:
            fig.add_trace(go.Scatter(
                x=future_forecast["ds"],
                y=future_forecast["yhat"],
                mode="lines",
                name="Future Forecast",
                line=dict(color="#22c55e", width=3)
            ))

        # =========================
        # Train/Test Split Marker
        # =========================
        split_date = train["ds"].iloc[-1]

        fig.add_vline(
            x=split_date,
            line_width=3,
            line_dash="dash",
            line_color="yellow"
        )

        # =========================
        # Layout
        # =========================
        fig.update_layout(
            template="plotly_dark",

            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",

            title=dict(
                text="Backtest: Train vs Test vs Prediction",
                x=0.5,
                xanchor="center"
            ),

            hovermode="x unified",

            autosize=True,
            height=600,

            margin=dict(
                l=10,
                r=10,
                t=60,
                b=40
            ),

            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5
            ),

            xaxis=dict(
                rangeselector=dict(
                    buttons=list([
                        dict(count=7, label="1W", step="day", stepmode="backward"),
                        dict(count=1, label="1M", step="month", stepmode="backward"),
                        dict(count=6, label="6M", step="month", stepmode="backward"),
                        dict(step="all")
                    ])
                ),
                rangeslider=dict(visible=True),
                type="date",
                showgrid=True,
                gridcolor="rgba(255,255,255,0.05)"
            ),

            yaxis=dict(
                showgrid=True,
                gridcolor="rgba(255,255,255,0.05)"
            )
        )


        return fig


    # =====================================
    # 6. BACKTEST
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
            "prophet": "Trend + seasonality",
            "xgb": "Machine learning model",
            "GAM": "Detrending ML model",
            "hybrid": "Stacked ML"
        }