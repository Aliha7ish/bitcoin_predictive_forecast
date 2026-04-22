# Prophet modules
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
from sklearn.model_selection import ParameterGrid
from .BaseForecastModel import BaseForecastModel


class ProphetModel(BaseForecastModel):

    def forecast(self, horizon, ci=0.95, freq="D"):

        # -----------------------------
        # Prepare data
        # -----------------------------
        df = self.df.copy()[["ds", "y"]].dropna()

        n = len(df)

        # -----------------------------
        # ADAPTIVE CHANGEPOINT FLEXIBILITY
        # -----------------------------
        if n < 200:
            cps = 0.5   # small data → more flexible
        elif n < 1000:
            cps = 0.1
        else:
            cps = 0.05  # large data → smoother

        # -----------------------------
        # ADAPTIVE SEASONALITY
        # -----------------------------
        is_hourly = freq and "H" in freq

        if is_hourly:
            daily_seasonality = True
            weekly_fourier = 10
        else:
            daily_seasonality = False
            weekly_fourier = 5

        # -----------------------------
        # VOLATILITY CHECK
        # -----------------------------
        volatility = df["y"].pct_change().std()

        seasonality_mode = "multiplicative"

        # if volatility > 0.05:
        #     seasonality_mode = "multiplicative"
        # else:
        #     seasonality_mode = "additive"

        print("seasonality mode", seasonality_mode)
        print("changepoint_prior_scale", cps)
        print("daily_seasonality", daily_seasonality)

        # -----------------------------
        # Initialize model
        # -----------------------------
        model = Prophet(
            seasonality_mode=seasonality_mode,
            changepoint_prior_scale=cps,
            interval_width=ci,
            daily_seasonality=daily_seasonality,
            weekly_seasonality=False,
            yearly_seasonality=False
        )


        # -----------------------------
        # ADD CUSTOM SEASONALITIES
        # -----------------------------

        # 1. Weekly crypto cycle (7 days)
        model.add_seasonality(
            name="weekly_crypto",
            period=7,
            fourier_order=5
        )

        # 2. Monthly liquidity cycle (~30 days)
        model.add_seasonality(
            name="monthly_cycle",
            period=30,
            fourier_order=8
        )

        # 3. Optional: 14-day momentum cycle
        model.add_seasonality(
            name="biweekly_cycle",
            period=14,
            fourier_order=5
        )

        # -----------------------------
        # Fit model
        # -----------------------------
        model.fit(df)

        # -----------------------------
        # Forecast future
        # -----------------------------
        future = model.make_future_dataframe(periods=horizon, freq=freq)
        forecast = model.predict(future)

        # -----------------------------
        # Extract only prediction horizon
        # -----------------------------
        forecast_df = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(horizon)

        return forecast_df