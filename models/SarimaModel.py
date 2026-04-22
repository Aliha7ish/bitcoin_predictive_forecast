import pandas as pd
import numpy as np

# ARIMA / SARIMA Modules
from statsmodels.tsa.stattools import adfuller
from pmdarima import auto_arima
from .BaseForecastModel import BaseForecastModel

class SarimaModel(BaseForecastModel):

    # -----------------------------
    # 1. PREPARATION
    # -----------------------------
    def _prepare(self):
        df = self.df.copy().sort_values("ds").set_index("ds")

        # -------- Frequency --------
        freq = pd.infer_freq(df.index)

        if freq is None:
            median_diff = df.index.to_series().diff().median()

            if median_diff <= pd.Timedelta("1H"):
                freq = "H"
            elif median_diff <= pd.Timedelta("1D"):
                freq = "D"
            else:
                freq = "D"

        df = df.asfreq(freq)

        # -------- Missing --------
        df["y"] = df["y"].ffill()

        # -------- Valid values --------
        df = df[df["y"] > 0]

        # -------- Outliers --------
        df["y"] = self._remove_outliers(df["y"])

        return df, freq

    # -----------------------------
    # 2. STATIONARITY CHECK
    # -----------------------------
    def _check_stationarity(self, series):
        result = adfuller(series.dropna())
        p_value = result[1]

        return p_value < 0.05, p_value

    # -----------------------------
    # 3. MAKE STATIONARY (AUTO d)
    # -----------------------------
    def _make_stationary(self, series, max_diff=2):

        diff_series = series.copy()
        d = 0

        for _ in range(max_diff):
            is_stationary, _ = self._check_stationarity(diff_series)

            if is_stationary:
                break

            diff_series = diff_series.diff().dropna()
            d += 1

        return diff_series, d

    # -----------------------------
    # 4. SEASONALITY
    # -----------------------------
    def _infer_seasonality(self, freq):

        if freq in ["H"]:
            return 24
        elif freq in ["D"]:
            return 7
        elif "min" in str(freq):
            return 60
        else:
            return 1

    # -----------------------------
    # 5. OUTLIERS
    # -----------------------------
    def _remove_outliers(self, series):

        q1 = series.quantile(0.01)
        q99 = series.quantile(0.99)

        return series.clip(q1, q99)

    # -----------------------------
    # 6. FORECAST
    # -----------------------------
    def forecast(self, horizon, ci=0.95, freq="D"):

        df, freq = self._prepare()
        series = df["y"]

        # -------- Log transform --------
        log_series = np.log(series)

        # -------- Stationarity --------
        diff_series, d = self._make_stationary(log_series)

        # -------- Seasonality --------
        m = self._infer_seasonality(freq)

        # -------- Model --------
        model = auto_arima(
            diff_series,
            d=d,
            seasonal=True,
            m=m,
            trace=False,
            error_action="ignore",
            suppress_warnings=True,
            stepwise=True,
            max_p=3,
            max_q=3
        )

        # -------- Forecast --------
        forecast, conf_int = model.predict(
            n_periods=horizon,
            return_conf_int=True,
            alpha=1 - ci
        )

        # -------- Inverse transform --------
        last_log = log_series.iloc[-1]
        forecast_log = last_log + np.cumsum(forecast)

        yhat = np.exp(forecast_log)
        
        lower_log = forecast_log + conf_int[:, 0]
        upper_log = forecast_log + conf_int[:, 1]

        lower = np.exp(lower_log)
        upper = np.exp(upper_log)


        # -------- Dates --------
        future_dates = pd.date_range(
            start=df.index[-1],
            periods=horizon + 1,
            freq=freq
        )[1:]

        return pd.DataFrame({
            "ds": future_dates,
            "yhat": yhat,
            "yhat_lower": lower,
            "yhat_upper": upper
        })
