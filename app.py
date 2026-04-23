import streamlit as st
import pandas as pd
import plotly.graph_objects as go

from models.ForecastEngine import ForecastEngine
from utils import load_bitcoin_data, preprocess_data, resample_data, detect_price_candidates
from helpers import plot_forecast


# =========================
# PAGE CONFIG
# =========================
st.set_page_config(
    page_title="Bitcoin Forecasting",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =========================
# CSS
# =========================
def load_css():
    st.markdown("""
    <style>
    .stApp {
        background: linear-gradient(135deg, #0f172a, #020617);
        color: white;
    }

    .glass {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 15px;
    }

    .metric-card {
        background: rgba(255,255,255,0.05);
        padding: 15px;
        border-radius: 14px;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 20px;
    }

    .metric-value {
        font-size: 26px;
        font-weight: bold;
        color: #22c55e;
    }

    .metric-label {
        font-size: 14px;
        opacity: 0.7;
    }

    .stButton>button {
        border-radius: 12px;
        background: linear-gradient(135deg, #22c55e, #4ade80);
        color: black;
        font-weight: bold;
    }

    .stDownloadButton > button {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white !important;
        border-radius: 10px;
    }

    </style>
    """, unsafe_allow_html=True)

load_css()


# =========================
# HEADER
# =========================
st.markdown("""
<div class="glass">
    <h1 style="font-size:38px;">📈 Bitcoin Forecasting Dashboard</h1>
    <p style="opacity:0.7;">
    Upload data → choose model → visualize → forecast → evaluate
    </p>
</div>
""", unsafe_allow_html=True)


# =========================
# SIDEBAR
# =========================
st.sidebar.header("⚙️ Configuration")

uploaded_file = st.sidebar.file_uploader("Upload Dataset", type=["csv", "xlsx"])

if uploaded_file is None:
    st.info("📂 Upload a dataset to start")
    st.stop()


# =========================
# LOAD DATA
# =========================
df_preview = pd.read_csv(uploaded_file) if uploaded_file.name.endswith(".csv") else pd.read_excel(uploaded_file)

price_candidates = detect_price_candidates(df_preview)

price_col = st.sidebar.selectbox(
    "📈 Price Column (Auto-ranked)",
    price_candidates
)

model_type = st.sidebar.selectbox(
    "Model",
    ["naive", "sarima", "prophet", "xgb", "hybrid"]
)

horizon = st.sidebar.slider("Forecast Horizon", 7, 180, 30)


# =========================
# INDICATORS
# =========================
st.sidebar.subheader("📊 Indicators")

use_sma = st.sidebar.toggle("SMA (Simple Moving Average)")
use_ema = st.sidebar.toggle("EMA (Exponential Moving Average)")
window = st.sidebar.slider("Window", 5, 100, 20)


# =========================
# EVALUATION
# =========================
st.sidebar.subheader("Evaluation")

run_backtest = st.sidebar.checkbox("Run Backtest", value=True)
test_size = st.sidebar.slider("Test Size", 7, min(180, len(df_preview)//3), 30)
ci = st.sidebar.slider("Confidence Interval (%)", 80, 99, 95) / 100

run_btn = st.sidebar.button("🚀 Run Forecast")


# =========================
# PROCESSING
# =========================
df = load_bitcoin_data(uploaded_file, price_col)
df = preprocess_data(df)
df = resample_data(df)

engine = ForecastEngine(df)

engine.add_indicators(
    use_sma=use_sma,
    use_ema=use_ema,
    window=window
)

df = engine.df


# =========================
# DATA PREVIEW
# =========================
st.markdown("### 📊 Data Preview")
st.dataframe(df.head(), use_container_width=True)


# =========================
# CHART
# =========================
st.markdown("### 📈 Price Chart")

fig = go.Figure()

fig.add_trace(go.Scatter(
    x=df["ds"],
    y=df["y"],
    mode="lines",
    name="Price",
    line=dict(color="#60a5fa", width=2)
))

if use_sma and "SMA" in df:
    fig.add_trace(go.Scatter(
        x=df["ds"],
        y=df["SMA"],
        mode="lines",
        name="SMA"
    ))

if use_ema and "EMA" in df:
    fig.add_trace(go.Scatter(
        x=df["ds"],
        y=df["EMA"],
        mode="lines",
        name="EMA"
    ))

fig.update_layout(
    template="plotly_dark",
    height=450,
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)"
)

st.plotly_chart(fig, use_container_width=True)


# =========================
# SUMMARY
# =========================
c1, c2, c3 = st.columns(3)
c1.metric("Start", str(df["ds"].min().date()))
c2.metric("End", str(df["ds"].max().date()))
c3.metric("Rows", len(df))


# =========================
# PIPELINE
# =========================
forecast = None

if run_btn:

    with st.spinner("🚀 Running forecasting pipeline..."):

        tab1, tab2 = st.tabs(["📊 Backtest", "📈 Forecast"])

        # ================= BACKTEST =================
        if run_backtest:
            with tab1:
                train, test, test_forecast, metrics = engine.backtest(
                    model_type=model_type,
                    test_size=test_size
                )

                st.markdown("### 📊 Metrics")

                cols = st.columns(4)
                for i, k in enumerate(["MAE", "RMSE", "MAPE", "R2 Score"]):
                    if k in ["MAE", "RMSE"]:
                        cols[i].metric(k, f"${metrics[k]:.3f}")
                    elif k == "MAPE":
                        cols[i].metric(k, f"{metrics[k]:.3f}%")
                    else:
                        cols[i].metric(k, f"{metrics[k]:.3f}")

                st.plotly_chart(
                    engine.plot_backtest(train, test, test_forecast),
                    use_container_width=True
                )

        # ================= FORECAST =================
        with tab2:
            forecast = engine.forecast(
                model_type=model_type,
                horizon=horizon,
                ci=ci
            )

            st.markdown("### 📈 Forecast")

            st.plotly_chart(
                plot_forecast(df, forecast),
                use_container_width=True
            )

            last = forecast.iloc[-1]

            # =========================
            # GREEN FORECAST METRICS
            # =========================
            c1, c2, c3 = st.columns(3)

            c1.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Lower Bound</div>
                <div class="metric-value">${last['yhat_lower']:,.0f}</div>
            </div>
            """, unsafe_allow_html=True)

            c2.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Forecast</div>
                <div class="metric-value">${last['yhat']:,.0f}</div>
            </div>
            """, unsafe_allow_html=True)

            c3.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Upper Bound</div>
                <div class="metric-value">${last['yhat_upper']:,.0f}</div>
            </div>
            """, unsafe_allow_html=True)

            st.dataframe(forecast)


# =========================
# DOWNLOAD
# =========================
if forecast is not None:
    st.download_button(
        "⬇️ Download Forecast",
        forecast.to_csv(index=False).encode("utf-8"),
        file_name="forecast.csv",
        mime="text/csv"
    )
