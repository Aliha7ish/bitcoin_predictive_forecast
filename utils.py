import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.io as pio
import matplotlib.pyplot as plt

pio.renderers.default = "browser"


def load_bitcoin_data(file_path, price_col):
    """
    Load Bitcoin data and automatically detect date column.

    Parameters:
        file_path (str): CSV or Excel file
        price_col (str): column name selected by user (e.g., 'Close')

    Returns:
        df: cleaned dataframe with ['ds', 'y']
    """

    if hasattr(file_path, "seek"):
        file_path.seek(0)

    # -----------------------------
    # 1. Load file
    # -----------------------------
    # Handle both file path and uploaded file
    if hasattr(file_path, "name"):  # Streamlit uploaded file
        filename = file_path.name.lower()

        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")

    else:  # normal file path
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif file_path.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")


    original_columns = df.columns
    df.columns = [col.strip().lower() for col in df.columns]

    # -----------------------------
    # 2. Detect DATE column
    # -----------------------------
    date_keywords = ["date", "time", "timestamp", "datetime"]

    date_col = None

    # Step A: name-based detection
    for col in df.columns:
        if any(k in col for k in date_keywords):
            try:
                parsed = pd.to_datetime(df[col], errors="coerce")
                if parsed.notnull().mean() > 0.7:
                    date_col = col
                    df[col] = parsed
                    break
            except:
                continue

    # Step B: fallback data-based detection
    if date_col is None:
        scores = {}

        for col in df.columns:
            parsed = pd.to_datetime(df[col], errors="coerce")

            valid_ratio = parsed.notnull().mean()
            uniqueness = parsed.nunique() / len(parsed)

            score = valid_ratio * 0.7 + uniqueness * 0.3
            scores[col] = score

        date_col = max(scores, key=scores.get)
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")

    # -----------------------------
    # 3. Validate user price column
    # -----------------------------
    price_col = price_col.lower()

    if price_col not in df.columns:
        raise ValueError(f"{price_col} not found. Available columns: {list(original_columns)}")

    # Convert to numeric safely
    df[price_col] = pd.to_numeric(df[price_col], errors="coerce")

    series = df[price_col]

    if not isinstance(series, pd.Series):
        raise ValueError(f"{price_col} is not a valid column")

    series = pd.to_numeric(series, errors="coerce")

    valid_ratio = series.notnull().mean()

    if valid_ratio < 0.7:
        raise ValueError(
            f"Selected column '{price_col}' is not valid numeric data "
            f"(only {valid_ratio:.2%} valid values)."
        )

    if series.nunique() < 5:
        raise ValueError(
            f"Selected column '{price_col}' does not look like a time-series signal "
            "(too few unique values)."
        )

    # -----------------------------
    # PRICE-LIKE VALIDATION
    # -----------------------------

    skewness = series.skew()
    if abs(skewness) > 8:
        raise ValueError(
            f"Selected column '{price_col}' is too skewed ({skewness:.2f}) "
            "→ likely NOT a price column (possible volume or counts)"
        )

    ratio = series.max() / (series.median() + 1e-9)
    if ratio > 1e5:
        raise ValueError(
            f"Selected column '{price_col}' has abnormal range "
            "→ likely volume-like data, not price"
        )

    spike_ratio = (series.diff().abs() > series.std() * 5).mean()
    if spike_ratio > 0.2:
        raise ValueError(
            f"Selected column '{price_col}' is too noisy/spiky "
            "→ unlikely to be a valid price series"
        )

    # -----------------------------
    # 4. Clean dataframe
    # -----------------------------
    df = df[[date_col, price_col]].dropna()

    print(f"Detected date column: {date_col}")

    df = df.rename(columns={
        date_col: "ds",
        price_col: "y"
    })

    df = df.sort_values("ds")

    return df


def preprocess_data(df):
    """
    Clean and prepare time series data
    """

    # Ensure datetime
    df["ds"] = pd.to_datetime(df["ds"], errors="coerce")

    # Drop invalid dates
    df = df.dropna(subset=["ds", "y"])

    # Sort
    df = df.sort_values("ds")

    # Remove duplicates (keep first)
    df = df.drop_duplicates(subset="ds")

    # Reset index
    df = df.reset_index(drop=True)

    return df


def resample_data(df, freq="D", target_col="y"):
    """
    Flexible resampling:
    - Supports single-column series (current use case)
    - Supports OHLC datasets if available in future
    """

    df = df.set_index("ds")

    # -----------------------------
    # CASE 1: OHLC exists
    # -----------------------------
    ohlc_cols = ["open", "high", "low", "close"]

    if all(col in df.columns for col in ohlc_cols):

        df = df.resample(freq).agg({
            "open": "first",
            "high": "max",
            "low": "min",
            "close": "last"
        })

        # if user selected one column, reduce to it
        if target_col.lower() in df.columns:
            df = df[[target_col.lower()]]
        else:
            raise ValueError(f"{target_col} not found in OHLC data")

    # -----------------------------
    # CASE 2: single column
    # -----------------------------
    else:
        df = df.resample(freq).mean()

        # clean missing values
        df[target_col] = df[target_col].ffill()

    df = df.reset_index()

    return df
