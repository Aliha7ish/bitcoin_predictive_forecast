import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.io as pio
import matplotlib.pyplot as plt

pio.renderers.default = "browser"


def detect_price_candidates(df):
    """
    Returns likely price columns ranked by probability
    """

    numeric_cols = df.select_dtypes(include=["number"]).columns

    scores = {}

    for col in numeric_cols:
        series = pd.to_numeric(df[col], errors="coerce")

        valid_ratio = series.notnull().mean()
        nunique = series.nunique()
        skew = abs(series.skew()) if series.notnull().sum() > 5 else 999

        # scoring heuristic
        score = (
            valid_ratio * 0.4 +
            (1 / (1 + skew)) * 0.3 +
            min(nunique / 1000, 1) * 0.3
        )

        scores[col] = score

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    return [col for col, _ in ranked]



def load_bitcoin_data(file_path, price_col=None):
    """
    Load + validate Bitcoin dataset safely (Streamlit-friendly)
    NEVER crashes UI → always falls back gracefully
    """

    if hasattr(file_path, "seek"):
        file_path.seek(0)

    # -------------------------
    # LOAD FILE
    # -------------------------
    if hasattr(file_path, "name"):
        name = file_path.name.lower()

        if name.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif name.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")
    else:
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

    df.columns = [c.strip().lower() for c in df.columns]

    # -------------------------
    # DATE DETECTION (SAFE)
    # -------------------------
    date_col = None

    for col in df.columns:
        if any(k in col for k in ["date", "time", "timestamp"]):
            parsed = pd.to_datetime(df[col], errors="coerce")
            if parsed.notnull().mean() > 0.7:
                date_col = col
                df[col] = parsed
                break

    if date_col is None:
        best = None
        best_score = -1

        for col in df.columns:
            parsed = pd.to_datetime(df[col], errors="coerce")
            score = parsed.notnull().mean() + parsed.nunique() / len(df)

            if score > best_score:
                best_score = score
                best = col

        date_col = best
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")

    # -------------------------
    # PRICE COLUMN HANDLING
    # -------------------------
    candidates = detect_price_candidates(df)

    # If user selection invalid → fallback instead of crash
    if price_col is None or price_col.lower() not in df.columns:
        price_col = candidates[0]  # auto fallback

    price_col = price_col.lower()

    # Ensure numeric safely
    series = pd.to_numeric(df[price_col], errors="coerce")

    valid_ratio = series.notnull().mean()

    if valid_ratio < 0.6:
        # fallback instead of raising error
        price_col = candidates[0]
        series = pd.to_numeric(df[price_col], errors="coerce")

    # final safety cleanup
    df = df[[date_col, price_col]].dropna()

    df = df.rename(columns={date_col: "ds", price_col: "y"})
    # ensure correct shape
    df = df.loc[:, ~df.columns.duplicated()].copy()

    # force scalar column selection safety
    if isinstance(df["y"], pd.DataFrame):
        df["y"] = df["y"].iloc[:, 0]

    df["y"] = pd.Series(df["y"]).astype(str)
    df["y"] = pd.to_numeric(df["y"], errors="coerce")

    df = df.dropna()

    df = df.sort_values("ds").reset_index(drop=True)

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
