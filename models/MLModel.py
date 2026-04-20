from sklearn.svm import SVR
from xgboost import XGBRegressor
import pandas as pd
import numpy as np
from BaseForecastModel import BaseForecastModel


class MLModel(BaseForecastModel):

    def __init__(self, df, model_type="hybrid"):
        super().__init__(df)
        self.model_type = model_type

    # =====================================
    # FEATURES (FOR RESIDUAL MODEL ONLY)
    # =====================================
    def _create_ml_features(self, df=None):

        if df is None:
            df = self.df.copy()

        df = df.copy()

        for lag in [1, 3, 7]:
            df[f"lag_{lag}"] = df["y"].shift(lag)

        for w in [7, 14, 30]:
            df[f"roll_mean_{w}"] = df["y"].rolling(w).mean()
            df[f"roll_std_{w}"] = df["y"].rolling(w).std()

        df["dow"] = df["ds"].dt.dayofweek
        df["month"] = df["ds"].dt.month

        df["dow_sin"] = np.sin(2 * np.pi * df["dow"] / 7)
        df["dow_cos"] = np.cos(2 * np.pi * df["dow"] / 7)

        df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
        df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

        return df.dropna()

    # =====================================
    # MODELS
    # =====================================
    def _get_xgb(self):
        return XGBRegressor(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.01,
            subsample=0.8,
            colsample_bytree=0.8
        )

    def _get_svm_trend(self):
        return SVR(kernel="linear", C=100, gamma=0.01)

    # =====================================
    # TRAIN HYBRID (SVR TREND + XGB RESIDUAL)
    # =====================================
    def _train_hybrid(self, X, y):

        # -----------------------------
        # TREND MODEL (SVM)
        # -----------------------------
        t = np.arange(len(y)).reshape(-1, 1)

        trend_model = self._get_svm_trend()
        trend_model.fit(t, y)

        trend_pred = pd.Series(trend_model.predict(t), index=y.index)

        # -----------------------------
        # RESIDUALS
        # -----------------------------
        residuals = y - trend_pred

        valid_idx = residuals.dropna().index

        # -----------------------------
        # XGB ON RESIDUALS
        # -----------------------------
        xgb = self._get_xgb()
        xgb.fit(X.loc[valid_idx], residuals.loc[valid_idx])

        return trend_model, xgb

    # =====================================
    # RECURSIVE FORECAST
    # =====================================
    def _recursive_forecast(self, model, horizon, freq="D"):

        trend_model, xgb = model

        history = self.df.copy()
        predictions = []

        offset = pd.tseries.frequencies.to_offset(freq)

        for i in range(horizon):

            temp = self._create_ml_features(history)

            X_last = temp.drop(columns=["ds", "y"]).iloc[-1:]

            t = np.array([[len(history)]])

            trend = trend_model.predict(t)[0]
            residual = xgb.predict(X_last)[0]

            yhat = trend + residual

            predictions.append(yhat)

            new_row = history.iloc[-1:].copy()
            new_row["y"] = yhat
            new_row["ds"] = new_row["ds"] + offset

            history = pd.concat([history, new_row], ignore_index=True)

        return predictions

    # =====================================
    # MAIN FORECAST
    # =====================================
    def forecast(self, horizon=30, ci=0.95, freq="D"):

        df = self._create_ml_features()

        X = df.drop(columns=["ds", "y"])
        y = df["y"]

        if self.model_type == "hybrid":
            model = self._train_hybrid(X, y)

        elif self.model_type == "xgb":
            model = (None, self._get_xgb().fit(X, y))

        else:
            raise ValueError("Only hybrid or xgb supported in this version")

        predictions = self._recursive_forecast(model, horizon, freq=freq)

        future_dates = pd.date_range(
            start=self.df["ds"].iloc[-1],
            periods=horizon + 1,
            freq=freq
        )[1:]

        std = self.df["y"].std()

        return pd.DataFrame({
            "ds": future_dates,
            "yhat": predictions,
            "yhat_lower": np.array(predictions) - 1.96 * std,
            "yhat_upper": np.array(predictions) + 1.96 * std
        })
