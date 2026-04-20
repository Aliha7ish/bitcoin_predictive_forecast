import matplotlib.pyplot as plt
from statsmodels.tsa.seasonal import seasonal_decompose
import pandas as pd
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    mean_absolute_percentage_error
)

from sklearn.ensemble import RandomForestRegressor
from pygam import LinearGAM, s
from xgboost import XGBRegressor
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
import numpy as np


def create_lag_feature(
    lag_num: int,
    data: pd.DataFrame,
    col_name: str
) -> pd.DataFrame:
    """
    Add a lag feature to a DataFrame.
    
    Parameters:
    - lag_num: number of periods to lag
    - data: input DataFrame
    - col_name: name of the column to create lag from
    
    Returns:
    - DataFrame with new lag column added
    """
    df_ = data.copy()
    df_[f'lag_{lag_num}'] = df_[col_name].shift(lag_num)
    return df_

def create_rolling_feature(
    data: pd.DataFrame,
    col_name: str,
    window: int,
    func: str = "mean",
    new_col_name: str = None
) -> pd.DataFrame:
    """
    Add a rolling feature to a DataFrame.

    Parameters:
    - data: pandas DataFrame
    - col_name: column to compute rolling statistic on
    - window: rolling window size
    - func: aggregation function ("mean", "sum", "std", etc.)
    - new_col_name: optional, name of the new column; if None, auto-generated

    Returns:
    - DataFrame with the new rolling column added
    """
    df_ = data.copy()
    
    if new_col_name is None:
        new_col_name = f"{col_name}_roll{window}_{func}"
    
    rolling_obj = df_[col_name].rolling(window=window)
    
    if func == "mean":
        df_[new_col_name] = rolling_obj.mean()
    elif func == "sum":
        df_[new_col_name] = rolling_obj.sum()
    elif func == "std":
        df_[new_col_name] = rolling_obj.std()
    elif func == "max":
        df_[new_col_name] = rolling_obj.max()
    elif func == "min":
        df_[new_col_name] = rolling_obj.min()
    else:
        raise ValueError(f"Unsupported rolling function: {func}")
    
    return df_



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


def time_series_grid_search(X, y, model_type="rf", param_grid=None, n_splits=5, scoring="neg_mean_squared_error"):
    """
    Performs a time-series-aware grid search with TimeSeriesSplit.
    
    Parameters:
    - X: features
    - y: target
    - model_type: "rf" for RandomForest, "xgb" for XGBoost
    - param_grid: dictionary of hyperparameters
    - n_splits: number of splits for TimeSeriesSplit
    - scoring: scoring metric (default: neg MSE)
    
    Returns:
    - best_model: trained model with best parameters
    - best_params: best hyperparameters
    - cv_results: full grid search results
    """
    
    # Select model
    if model_type == "rf":
        model = RandomForestRegressor(random_state=42)
    elif model_type == "xgb":
        model = XGBRegressor(objective="reg:squarederror", random_state=42)
    else:
        raise ValueError("model_type must be 'rf' or 'xgb'")
    
    # TimeSeries Split
    tscv = TimeSeriesSplit(n_splits=n_splits)
    
    # GridSearch
    grid = GridSearchCV(
        estimator=model,
        param_grid=param_grid,
        scoring=scoring,
        cv=tscv,
        n_jobs=-1,
        verbose=2
    )
    
    grid.fit(X, y)
    
    print(f"Best params for {model_type}: {grid.best_params_}")
    print(f"Best {scoring}: {grid.best_score_}")
    
    return grid.best_estimator_, grid.best_params_, grid.cv_results_


def compare_models(models: dict, X_train, y_train, X_test, y_test):
    """
    Compare multiple regression models on train and test data.
    
    Parameters:
    - models: dict, e.g. {"Random Forest": rf_model, "XGBoost": xgb_model}
    - X_train, y_train, X_test, y_test: data splits
    
    Returns:
    - comparison_df: DataFrame with train/test metrics for each model
    - predictions: dict with predictions on test set
    """
    results = []
    predictions = {}
    
    for name, model in models.items():
        # Train predictions
        y_train_pred = model.predict(X_train)
        # Test predictions
        y_test_pred = model.predict(X_test)
        predictions[name] = y_test_pred
        
        # Compute metrics
        metrics = {
            "Model": name,
            "Train MAE": mean_absolute_error(y_train, y_train_pred),
            "Train RMSE": np.sqrt(mean_squared_error(y_train, y_train_pred)),
            "Train R2": r2_score(y_train, y_train_pred),
            "Test MAE": mean_absolute_error(y_test, y_test_pred),
            "Test RMSE": np.sqrt(mean_squared_error(y_test, y_test_pred)),
            "Test R2": r2_score(y_test, y_test_pred),
        }
        results.append(metrics)
    
    comparison_df = pd.DataFrame(results).set_index("Model")
    return comparison_df, predictions


def plot_model_metrics(
    comparison_df,
    set_type="both",           # "train", "test", "both" for side-by-side bars
    stacked=False,             # True → stacked train/test bars per model
    metrics=None, 
    figsize=(10,6)
):
    """
    Plot a bar chart comparing models' metrics with optional stacked view.

    Parameters:
    - comparison_df: DataFrame with models as index and metrics as columns
    - set_type: "train", "test", or "both" (ignored if stacked=True)
    - stacked: bool → if True, stack train and test metrics in a single bar per metric
    - metrics: list of metric names (default: ["MAE","RMSE","R2"])
    - figsize: figure size
    """
    df = comparison_df.copy()
    
    if metrics is None:
        metrics = ["MAE","RMSE","R2"]

    if stacked:
        # Stacked bar chart: train on bottom, test on top
        n_models = len(df)
        x = np.arange(n_models)
        bar_width = 0.5
        
        fig, ax = plt.subplots(figsize=figsize)
        
        for i, metric in enumerate(metrics):
            train_col = f"Train {metric}"
            test_col = f"Test {metric}"
            
            train_vals = df[train_col]
            test_vals = df[test_col]
            
            ax.bar(x + i*bar_width, train_vals, width=bar_width, label=f"Train {metric}")
            ax.bar(x + i*bar_width, test_vals, width=bar_width, bottom=train_vals, label=f"Test {metric}")
        
        ax.set_xticks(x + bar_width*(len(metrics)-1)/2)
        ax.set_xticklabels(df.index)
        ax.set_ylabel("Metric Value")
        ax.set_title("Train vs Test Metrics Comparison (Stacked)")
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax.grid(alpha=0.3, axis='y')
        plt.tight_layout()
        plt.show()
        return
    
    # --- Standard side-by-side bars ---
    # Determine which columns to plot
    if metrics is None:
        metrics = ["MAE","RMSE","R2"]
    
    if set_type == "train":
        cols = [f"Train {m}" for m in metrics if f"Train {m}" in df.columns]
        title = "Train Metrics Comparison"
    elif set_type == "test":
        cols = [f"Test {m}" for m in metrics if f"Test {m}" in df.columns]
        title = "Test Metrics Comparison"
    elif set_type == "both":
        train_cols = [f"Train {m}" for m in metrics if f"Train {m}" in df.columns]
        test_cols = [f"Test {m}" for m in metrics if f"Test {m}" in df.columns]
        cols = train_cols + test_cols
        title = "Train vs Test Metrics Comparison"
    else:
        raise ValueError("set_type must be 'train', 'test', or 'both'")
    
    n_models = len(df)
    n_bars = len(cols)
    bar_width = 0.15
    x = np.arange(n_models)
    
    fig, ax = plt.subplots(figsize=figsize)
    
    for i, col in enumerate(cols):
        ax.bar(x + i*bar_width, df[col], width=bar_width, label=col)
    
    ax.set_xticks(x + bar_width*(n_bars-1)/2)
    ax.set_xticklabels(df.index)
    ax.set_ylabel("Metric Value")
    ax.set_title(title)
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    ax.grid(alpha=0.3, axis='y')
    plt.tight_layout()
    plt.show()


def plot_trend_comparison(trend_train, trend_model_pred, model_name="GAM", title=None):
    """
    Plot the decomposed trend vs predicted trend from a trend model.

    Parameters:
    - trend_train: pd.Series, trend extracted from decomposition
    - trend_model_pred: np.ndarray, predicted trend from model
    - model_name: str, label for the predicted trend
    - title: str, optional plot title
    """
    fig, ax = plt.subplots(figsize=(14, 5))

    # Decomposed trend
    ax.plot(trend_train.index, trend_train, label="Decomposed Trend", alpha=0.7)

    # Predicted trend
    ax.plot(trend_train.index, trend_model_pred, linestyle="--", linewidth=2, label=f"{model_name} Trend")

    # Styling
    ax.set_title(title or f"Decomposed Trend vs {model_name} Trend")
    ax.set_xlabel("Date")
    ax.set_ylabel("Close Price")
    ax.legend()
    ax.grid(alpha=0.3)

    plt.show()



def evaluate_hybrid_model(trend_model, X_train, y_train, X_test, y_test, detrend=True):
    """
    Train a hybrid trend + XGB model and return predictions + metrics.
    
    Returns:
    - y_train_pred, y_test_pred
    - metrics: dict of MAE, RMSE, R2, MAPE
    """

    # Time indices for trend modeling
    t_train = np.arange(len(y_train)).reshape(-1, 1)
    t_test = np.arange(len(y_train), len(y_train) + len(X_test)).reshape(-1, 1)

    if detrend:
        trend_model.fit(t_train, y_train)
        trend_train = pd.Series(trend_model.predict(t_train), index=y_train.index)
        trend_test = pd.Series(trend_model.predict(t_test), index=y_test.index)

        # Detrend
        y_train_detrended = y_train - trend_train
        valid_idx = y_train_detrended.dropna().index

        xgb = XGBRegressor(learning_rate=0.05, max_depth=5, n_estimators=300)
        xgb.fit(X_train.loc[valid_idx], y_train_detrended.loc[valid_idx])

        y_train_pred = pd.Series(index=y_train.index, dtype=float)
        y_train_pred[valid_idx] = trend_train[valid_idx] + xgb.predict(X_train.loc[valid_idx])
        y_test_pred = trend_test + xgb.predict(X_test)
    else:
        xgb = XGBRegressor(learning_rate=0.05, max_depth=5, n_estimators=300)
        xgb.fit(X_train, y_train)
        y_train_pred = pd.Series(xgb.predict(X_train), index=y_train.index)
        y_test_pred = pd.Series(xgb.predict(X_test), index=y_test.index)

    # Metrics index
    train_idx = valid_idx if detrend else y_train.index

    # Avoid division by zero in MAPE
    epsilon = 1e-8
    y_train_safe = y_train.loc[train_idx].replace(0, epsilon)
    y_test_safe = y_test.replace(0, epsilon)

    metrics = {
        "Train MAE": mean_absolute_error(y_train.loc[train_idx], y_train_pred.loc[train_idx]),
        "Test MAE": mean_absolute_error(y_test, y_test_pred),

        "Train RMSE": np.sqrt(mean_squared_error(y_train.loc[train_idx], y_train_pred.loc[train_idx])),
        "Test RMSE": np.sqrt(mean_squared_error(y_test, y_test_pred)),

        "Train R2": r2_score(y_train.loc[train_idx], y_train_pred.loc[train_idx]),
        "Test R2": r2_score(y_test, y_test_pred),

        "Train MAPE": mean_absolute_percentage_error(y_train_safe, y_train_pred.loc[train_idx]),
        "Test MAPE": mean_absolute_percentage_error(y_test_safe, y_test_pred),
    }

    return y_train_pred, y_test_pred, metrics




def fit_trend_model(y_train, model_type="gam", seasonality_model="multiplicative", period=365, **model_kwargs):
    """
    Decompose training series and fit a trend model.

    Parameters:
    - y_train: pd.Series, training target series
    - model_type: str, "gam", "linear", or "svm"
    - period: int, period for seasonal decomposition
    - model_kwargs: extra args for the model (e.g., SVR kernel)

    Returns:
    - trend_train: pd.Series, decomposed trend
    - trend_model_pred: np.ndarray, predicted trend from the model
    - model: fitted trend model
    """
    # Decompose trend
    decomposition = seasonal_decompose(y_train, model=seasonality_model, period=period)
    trend_train = decomposition.trend
    t_train = np.arange(len(trend_train)).reshape(-1, 1)

    # Fit model
    model_type = model_type.lower()
    if model_type == "gam":
        model = LinearGAM(s(0), **model_kwargs).fit(t_train, y_train)
        trend_model_pred = model.predict(t_train)
    elif model_type == "linear":
        model = LinearRegression(**model_kwargs).fit(t_train, y_train)
        trend_model_pred = model.predict(t_train)
    elif model_type == "svm":
        model = SVR(**model_kwargs).fit(t_train, y_train)
        trend_model_pred = model.predict(t_train)
    else:
        raise NotImplementedError(f"Model '{model_type}' is not implemented.")

    return trend_train, trend_model_pred, model