import matplotlib.pyplot as plt
import pandas as pd
from statsmodels.tsa.stattools import adfuller, kpss

import numpy as np
from pmdarima import auto_arima

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def plot_time_series_split(
    X_train,
    y_train,
    X_test,
    y_test,
    y_pred=None,
    y_train_pred=None,
    zoom=False,
    zoom_pct=0.2,
    zoom_range=None,
    title="Train/Test Split (Time Series)",
    figsize=(14, 5)
):
    fig, ax = plt.subplots(figsize=figsize)

    # Plot actual data
    ax.plot(X_train.index, y_train, label="Train Actual")
    ax.plot(X_test.index, y_test, label="Test Actual")

    # Plot train predictions
    if y_train_pred is not None:
        ax.plot(
            X_train.index,
            y_train_pred,
            linestyle="--",
            label="Train Predictions"
        )

    # Plot test predictions
    if y_pred is not None:
        ax.plot(
            X_test.index,
            y_pred,
            linestyle="--",
            label="Test Predictions"
        )

    # Split line
    split_date = X_test.index[0]
    ax.axvline(x=split_date, linestyle="--", label="Train/Test Split")

    # Zoom logic
    if zoom:
        if zoom_range is not None:
            start, end = zoom_range
            start = pd.to_datetime(start)
            end = pd.to_datetime(end)

            if start >= end:
                raise ValueError("zoom_range start must be before end")

            ax.set_xlim(start, end)
        else:
            full_index = X_train.index.append(X_test.index)

            if not (0 < zoom_pct <= 1):
                raise ValueError("zoom_pct must be between 0 and 1")

            n = len(full_index)
            zoom_start_idx = int(n * (1 - zoom_pct))
            zoom_start_date = full_index[zoom_start_idx]

            ax.set_xlim(zoom_start_date, full_index[-1])

    # Labels & styling
    ax.set_title(title)
    ax.set_xlabel("Date")
    ax.set_ylabel("Close Price")
    ax.legend()
    ax.grid(alpha=0.3)

    plt.show()


def adf_test(y):
    result = adfuller(y)
    p_value = result[1]
    
    print(f"ADF Statistic: {result[0]}\n")
    print(f"ADF p-value: {p_value}\n")

    print("Critical Value:")
    for k, v in result[4].items():
        print(f"{k}: {v}")

    print()
    if p_value < 0.05:
        print("The series is stationary.")
    else:
        print("The series is non-stationary")

    return p_value < 0.05, p_value


def train_autoarima(train_series, m=7, seasonal=True):
    model = auto_arima(
        train_series,
        seasonal=seasonal,
        m=m,
        stepwise=True,
        trace=False,
        error_action='ignore',
        suppress_warnings=True,
        max_p=5,
        max_q=5,
        max_P=2,
        max_Q=2
    )

    return model




def forecast_autoarima(model, h):
    y_pred, conf_int = model.predict(n_periods=h, return_conf_int=True)
    return y_pred, conf_int



def evaluate_forecast(y_true, y_pred):
    epsilon = 1e-8
    y_true_safe = np.where(y_true == 0, epsilon, y_true)

    return {
        "MAE": mean_absolute_error(y_true, y_pred),
        "RMSE": np.sqrt(mean_squared_error(y_true, y_pred)),
        "R2": r2_score(y_true, y_pred),
        "MAPE": np.mean(np.abs((y_true - y_pred) / y_true_safe))
    }



def reconstruct_price_from_diff_log(y_pred_diff, last_log_price):
    log_forecast = np.cumsum(y_pred_diff) + last_log_price
    return np.exp(log_forecast)



def plot_forecast(train, test, forecast, conf_int=None, title="Forecast"):
    plt.figure(figsize=(12, 6))

    # Train data
    plt.plot(train.iloc[-200:], label="Train")

    # Test data
    plt.plot(test.iloc[-200:], label="Test", color="green")

    # Forecast line
    plt.plot(test.index, forecast, label="Forecast", linestyle="--", color="orange")

    # Confidence interval
    if conf_int is not None:
        plt.fill_between(
            test.index,
            conf_int[:, 0],
            conf_int[:, 1],
            alpha=0.3,
            label="Confidence Interval"
        )

    plt.title(title)
    plt.legend()
    plt.show()


def run_autoarima_pipeline(train, test, target_col, season_length):

    if target_col not in train.columns:
        raise ValueError(f"{target_col} not found in train dataframe")

    train_series = train[target_col].dropna()
    test_series = test[target_col].dropna()

    # Train
    model = train_autoarima(train_series, m=season_length)

    print("Order:", model.order)
    print("Seasonal Order:", model.seasonal_order)

    # Forecast (FIXED)
    y_pred, conf_int = model.predict(
            n_periods=len(test_series),
            return_conf_int=True
        )


    # Metrics
    metrics = evaluate_forecast(test_series.values, y_pred)

    return {
        "model": model,
        "forecast": y_pred,
        "conf_int": conf_int,
        "metrics": metrics,
        "order": model.order,
        "seasonal_order": model.seasonal_order
    }




def compare_seasonality(train, test, target_col, season_lengths):
    results = []

    for m in season_lengths:
        try:
            result = run_autoarima_pipeline(train, test, target_col, m)

            results.append({
                "season_length": m,
                "MAE": result["metrics"]["MAE"],
                "RMSE": result["metrics"]["RMSE"],
                "MAPE": result["metrics"]["MAPE"],
                "order": result["order"],
                "seasonal_order": result["seasonal_order"]
            })

            print(f"✅ Done m={m}")

        except Exception as e:
            print(f"❌ Failed m={m}: {e}")

    if len(results) == 0:
        raise ValueError("All models failed. Check your data or target column.")

    return pd.DataFrame(results).sort_values(by="MAE")

