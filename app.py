import streamlit as st
import pandas as pd

from models.ForecastEngine import ForecastEngine
from utils import load_bitcoin_data, preprocess_data, resample_data
from helpers import plot_forecast

st.set_page_config(page_title="Bitcoin Forecasting", layout="wide")

st.title("📈 Bitcoin Forecasting App")

# =====================================
# 1. FILE UPLOAD
# =====================================
uploaded_file = st.file_uploader(
    "Upload Bitcoin dataset (CSV or Excel)",
    type=["csv", "xlsx"]
)

if uploaded_file is not None:

    # show raw preview
    df_preview = pd.read_csv(uploaded_file) if uploaded_file.name.endswith(".csv") else pd.read_excel(uploaded_file)

    st.subheader("📊 Raw Data Preview")
    st.write(df_preview.head())

    # =====================================
    # 2. SELECT PRICE COLUMN ONLY
    # =====================================
    price_col = st.selectbox(
        "Select Price Column (e.g., Close)",
        df_preview.columns
    )

    # =====================================
    # 3. LOAD + CLEAN DATA (USING YOUR UTILS)
    # =====================================
    try:
        df = load_bitcoin_data(uploaded_file, price_col)

        df = preprocess_data(df)

        st.success("Data loaded and validated ✅")

        st.write(df.head())

    except Exception as e:
        st.error(f"Data error: {e}")
        st.stop()

    # =====================================
    # 4. RESAMPLING (OPTIONAL BUT IMPORTANT)
    # =====================================
    freq = st.selectbox("Resample Frequency", ["D", "W", "M"])

    try:
        df = resample_data(df, freq=freq)
    except Exception as e:
        st.warning(f"Resampling issue: {e}")

    # =====================================
    # 5. MODEL SELECTION
    # =====================================
    model_type = st.selectbox(
        "Select Model",
        ["naive", "sarima", "prophet", "xgb", "hybrid"]
    )

    # =====================================
    # 6. HORIZON
    # =====================================
    horizon = st.slider("Forecast Horizon", 7, 180, 30)

    # =====================================
    # Test HORIZON
    # =====================================
    st.subheader("⚙️ Evaluation Settings")

    run_backtest = st.checkbox("Run Backtest (Recommended)", value=True)

    test_size = st.slider(
        "Test Size (days)",
        min_value=7,
        max_value=min(180, len(df)//3),
        value=30
    )

    # =====================================
    # Confidence Interval
    # =====================================
    ci = st.slider(
        "Confidence Interval (%)",
        min_value=80,
        max_value=99,
        value=95
    ) / 100



    # =====================================
    # 7. RUN FORECAST
    # =====================================
    if st.button("🚀 Run Forecast"):

        with st.spinner("Training model..."):

            try:
                engine = ForecastEngine(df)

                # =====================================
                # 🔥 1. BACKTEST (EVALUATION)
                # =====================================
                if run_backtest:

                    train, test, test_forecast, metrics = engine.backtest(
                        model_type=model_type,
                        test_size=test_size
                    )

                    st.subheader("📊 Backtest Results")

                    # Metrics
                    st.write(metrics)

                    # Plot (IMPORTANT FIX: use plotly in streamlit)
                    fig = engine.plot_backtest(train, test, test_forecast)
                    st.plotly_chart(fig, use_container_width=True)

                # =====================================
                # 🔥 2. FUTURE FORECAST
                # =====================================
                forecast = engine.forecast(
                    model_type=model_type,
                    horizon=horizon,
                    ci=ci
                )

                st.subheader("📈 Future Forecast")

                plot_df = df.set_index("ds")[["y"]].rename(columns={"y": "Actual"})
                forecast_plot = forecast.set_index("ds")[["yhat"]].rename(columns={"yhat": "Forecast"})

                combined = pd.concat([plot_df, forecast_plot])

                st.subheader("📊 Advanced Forecast Visualization")

                fig = plot_forecast(df, forecast)
                st.plotly_chart(fig, use_container_width=True)


                st.dataframe(forecast)

                st.download_button(
                    "Download Forecast",
                    forecast.to_csv(index=False),
                    "forecast.csv"
                )

            except Exception as e:
                st.error(f"Model error: {e}")
