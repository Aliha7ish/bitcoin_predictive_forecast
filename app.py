import streamlit as st
import pandas as pd
import plotly.graph_objects as go

from models.ForecastEngine import ForecastEngine
from utils import load_bitcoin_data, preprocess_data, resample_data
from helpers import plot_forecast

st.set_page_config(
    page_title="Bitcoin Forecasting",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =========================
# CSS (React-like UI)
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
    }

    .metric-value {
        font-size: 26px;
        font-weight: bold;
        color: #22c55e;
    }

    .metric-label {
        font-size: 12px;
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
    }
                
    .stDownloadButton > button:hover {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white !important;
    }

    </style>
    """, unsafe_allow_html=True)

load_css()

# =========================
# HEADER (React Style)
# =========================
st.markdown("""
<div class="glass">
    <h1 style="font-size:38px;">📈 Bitcoin Forecasting Dashboard</h1>
    <p style="opacity:0.7;">
    Upload data → choose model → generate AI forecasts with evaluation metrics.
    </p>
</div>
""", unsafe_allow_html=True)

# =========================
# SIDEBAR
# =========================
st.sidebar.header("⚙️ Configuration")

uploaded_file = st.sidebar.file_uploader("Upload Dataset", type=["csv", "xlsx"])

# =========================
# EMPTY STATE (React-style)
# =========================
if uploaded_file is None:
    st.markdown("""
    <div class="glass" style="text-align:center;padding:40px;">
        <h2>📂 Upload your Bitcoin dataset</h2>
        <p style="opacity:0.7;">Start by uploading CSV or Excel file</p>
    </div>
    """, unsafe_allow_html=True)
    st.stop()

# =========================
# LOAD PREVIEW
# =========================
df_preview = pd.read_csv(uploaded_file) if uploaded_file.name.endswith(".csv") else pd.read_excel(uploaded_file)

price_col = st.sidebar.selectbox("Price Column", df_preview.columns)
model_type = st.sidebar.selectbox("Model", ["naive", "sarima", "prophet", "xgb", "hybrid"])
horizon = st.sidebar.slider("Forecast Horizon", 7, 180, 30)

st.sidebar.markdown("---")
st.sidebar.subheader("Evaluation")

run_backtest = st.sidebar.checkbox("Run Backtest", value=True)
test_size = st.sidebar.slider("Test Size", 7, min(180, len(df_preview)//3), 30)
ci = st.sidebar.slider("Confidence Interval (%)", 80, 99, 95) / 100

run_btn = st.sidebar.button("🚀 Run Forecast")

# =========================
# MAIN DATA PREVIEW
# =========================
st.markdown('<div class="glass">', unsafe_allow_html=True)
st.subheader("📊 Data Preview")
st.dataframe(df_preview.head(), use_container_width=True)
st.markdown('</div>', unsafe_allow_html=True)

# =========================
# PROCESS DATA
# =========================
try:
    df = load_bitcoin_data(uploaded_file, price_col)
    df = preprocess_data(df)
    df = resample_data(df)
    st.success("✅ Data processed successfully")
except Exception as e:
    st.error(f"Data error: {e}")
    st.stop()

# =========================
# VISUALIZE DATA
# =========================
st.markdown("### 📊 Data Overview")

fig = go.Figure()

fig.add_trace(go.Scatter(
    x=df["ds"],
    y=df["y"],
    mode="lines",
    name="Price",
    line=dict(color="#60a5fa", width=2)
))

fig.update_layout(
    template="plotly_dark",
    height=450,
    margin=dict(l=10, r=10, t=30, b=10),
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    xaxis=dict(title="Date"),
    yaxis=dict(title="Price")
)

st.plotly_chart(fig, use_container_width=True)

st.markdown("### 📌 Dataset Summary")

col1, col2, col3 = st.columns(3)

col1.metric("Start Date", str(df["ds"].min().date()))
col2.metric("End Date", str(df["ds"].max().date()))
col3.metric("Rows", len(df))


# =========================
# RUN MODEL
# =========================
if run_btn:

    with st.spinner("🚀 Running models..."):

        try:
            engine = ForecastEngine(df)

            tab1, tab2 = st.tabs(["📊 Backtest", "📈 Forecast"])

            # =========================
            # BACKTEST
            # =========================
            if run_backtest:
                with tab1:
                    train, test, test_forecast, metrics = engine.backtest(
                        model_type=model_type,
                        test_size=test_size
                    )

                    st.markdown("### 📊 Model Metrics")

                    col1, col2, col3, col4 = st.columns(4)

                    col1.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-label">MAE</div>
                        <div class="metric-value">{metrics['MAE']:.2f}</div>
                    </div>
                    """, unsafe_allow_html=True)

                    col2.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-label">RMSE</div>
                        <div class="metric-value">{metrics['RMSE']:.2f}</div>
                    </div>
                    """, unsafe_allow_html=True)

                    col3.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-label">MAPE</div>
                        <div class="metric-value">{metrics['MAPE']:.2f}%</div>
                    </div>
                    """, unsafe_allow_html=True)

                    col4.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-label">R²</div>
                        <div class="metric-value">{metrics['R2 Score']:.3f}</div>
                    </div>
                    """, unsafe_allow_html=True)

                    fig = engine.plot_backtest(train, test, test_forecast)
                    st.plotly_chart(fig, use_container_width=True)

            # =========================
            # FORECAST
            # =========================
            with tab2:
                forecast = engine.forecast(
                    model_type=model_type,
                    horizon=horizon,
                    ci=ci
                )

                st.markdown("### 📈 Forecast Chart")
                fig = plot_forecast(df, forecast)
                st.plotly_chart(fig, use_container_width=True)

                # =========================
                # CONFIDENCE CARDS (React style)
                # =========================
                st.markdown("### 🎯 Forecast Summary")

                last = forecast.iloc[-1]

                c1, c2, c3 = st.columns(3)

                c1.markdown(f"""
                <div class="glass">
                    <div class="metric-label">Lower Bound</div>
                    <div class="metric-value">${last['yhat_lower']:,.0f}</div>
                </div>
                """, unsafe_allow_html=True)

                c2.markdown(f"""
                <div class="glass">
                    <div class="metric-label">Forecast</div>
                    <div class="metric-value">${last['yhat']:,.0f}</div>
                </div>
                """, unsafe_allow_html=True)

                c3.markdown(f"""
                <div class="glass">
                    <div class="metric-label">Upper Bound</div>
                    <div class="metric-value">${last['yhat_upper']:,.0f}</div>
                </div>
                """, unsafe_allow_html=True)

                st.markdown("### 📄 Forecast Data")
                st.dataframe(forecast, use_container_width=True)

                st.download_button(
                    "⬇️ Download Forecast",
                    forecast.to_csv(index=False),
                    "forecast.csv"
                )

        except Exception as e:
            st.error(f"Model error: {e}")
