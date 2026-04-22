import pandas as pd
import numpy as np
from .BaseForecastModel import BaseForecastModel

class NaiveModel(BaseForecastModel):

    def forecast(self, horizon, ci=0.95):
        last_value = self.df["y"].iloc[-1]

        future_dates = pd.date_range(
            start=self.df["ds"].iloc[-1],
            periods=horizon + 1,
            freq="D"
        )[1:]

        std = self.df["y"].std()
        z = 1.96 if ci == 0.95 else 1.64

        forecast = pd.DataFrame({
            "ds": future_dates,
            "yhat": [last_value] * horizon
        })

        forecast["yhat_lower"] = forecast["yhat"] - z * std
        forecast["yhat_upper"] = forecast["yhat"] + z * std

        return forecast