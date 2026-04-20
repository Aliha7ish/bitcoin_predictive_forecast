from abc import ABC, abstractmethod

class BaseForecastModel(ABC):

    def __init__(self, df):
        self.df = df.copy()
        self.df = self.df.sort_values("ds")

    @abstractmethod
    def forecast(self, horizon, ci=0.95):
        pass


