from xgboost import XGBRegressor
import pandas as pd
import numpy as np
from BaseForecastModel import BaseForecastModel
from pygam import LinearGAM, s


# Hybrid model GAM + XGB
class MLModel(BaseForecastModel):

    def __init__(self, df, model_type="hybrid"):
        super().__init__(df)
        self.model_type = model_type

    # =====================================
    # SAFE FEATURES
    # =====================================
    def _create_ml_features(self, df=None):

        df = self.df.copy() if df is None else df.copy()

        # =====================================
        # TIME FEATURES
        # =====================================
        df["dow"] = df["ds"].dt.dayofweek
        df["month"] = df["ds"].dt.month
        df["doy"] = df["ds"].dt.dayofyear
        df["is_weekend"] = df["dow"].isin([5, 6]).astype(int)

        # =====================================
        # CYCLICAL ENCODING
        # =====================================
        df["dow_sin"] = np.sin(2 * np.pi * df["dow"] / 7)
        df["dow_cos"] = np.cos(2 * np.pi * df["dow"] / 7)

        df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
        df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

        # =====================================
        # LAG FEATURES
        # =====================================
        for lag in [1, 3, 7]:
            df[f"lag_{lag}"] = df["y"].shift(lag)

        # =====================================
        # ROLLING FEATURES (SHIFTED TO AVOID LEAKAGE)
        # =====================================
        for w in [7, 14, 30]:
            df[f"roll_mean_{w}"] = df["y"].shift(1).rolling(w).mean()
            df[f"roll_std_{w}"] = df["y"].shift(1).rolling(w).std()

        # =====================================
        # CLEAN
        # =====================================
        return df.dropna()


    # =====================================
    # XGB MODEL
    # =====================================
    def _get_xgb(self):
        return XGBRegressor(
            n_estimators=800,
            max_depth=6,
            learning_rate=0.05,
        )

    # =====================================
    # HYBRID TRAINING (GAM + XGB)
    # =====================================
    def _train_hybrid(self, X_train, y_train):

        # -----------------------------
        # TREND MODEL (GAM)
        # -----------------------------
        t_train = np.arange(len(y_train)).reshape(-1, 1)

        gam = LinearGAM(s(0)).gridsearch(t_train, y_train)

        trend_train = pd.Series(gam.predict(t_train), index=y_train.index)

        # -----------------------------
        # RESIDUALS
        # -----------------------------
        residuals = y_train - trend_train

        # XGB training
        xgb = self._get_xgb()
        xgb.fit(X_train, residuals)

        return gam, xgb

    # =====================================
    # FORECAST
    # =====================================
    def forecast(self, horizon=30, ci=0.95, freq="D"):
        # =====================================
        # 1. SPLIT
        # =====================================
        df = self._create_ml_features()

        split_idx = len(df)

        X = df.drop(columns=["y", "ds"])
        y = df["y"]

        # TRAIN ONLY
        X_train = X.copy()
        y_train = y.copy()

        # =====================================
        # 2. TRAIN HYBRID
        # =====================================
        gam, xgb = self._train_hybrid(X_train, y_train)

        # =====================================
        # 3. FUTURE TIME INDEX
        # =====================================
        future_dates = pd.date_range(
            self.df["ds"].iloc[-1],
            periods=horizon + 1,
            freq=freq
        )[1:]

        t_future = np.arange(len(y_train), len(y_train) + horizon).reshape(-1, 1)

        # =====================================
        # 4. GAM TREND
        # =====================================
        trend_future = gam.predict(t_future)

        # =====================================
        # 5. FUTURE FEATURES (SAFE)
        # =====================================
        future_df = pd.DataFrame({"ds": future_dates})

        full_df = pd.concat([self.df, future_df], ignore_index=True)
        full_df = self._create_ml_features(full_df)

        X_future = full_df.tail(horizon).drop(columns=["y", "ds"])

        # =====================================
        # 6. RESIDUAL PREDICTION
        # =====================================
        residual_future = xgb.predict(X_future)

        # =====================================
        # 7. FINAL OUTPUT
        # =====================================
        yhat = trend_future + residual_future

        std = np.std(y_train)

        return pd.DataFrame({
            "ds": future_dates,
            "yhat": yhat,
            "yhat_lower": yhat - 1.96 * std,
            "yhat_upper": yhat + 1.96 * std
        })