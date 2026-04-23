import plotly.graph_objects as go
import plotly.io as pio
import matplotlib.pyplot as plt

def visualize_bitcoin_plotly(df, title="Bitcoin Price Over Time"):
    """
    Interactive Plotly visualization for time series data.
    """

    df = df.sort_values("ds")

    fig = go.Figure()

    # Main line chart
    fig.add_trace(
        go.Scatter(
            x=df["ds"],
            y=df["y"],
            mode="lines",
            name="Price",
            line=dict(width=2),
            hovertemplate=
                "<b>Time:</b> %{x}<br>" +
                "<b>Price:</b> %{y:.2f}<extra></extra>"
        )
    )

    # Layout styling (important for UX)
    fig.update_layout(
        title=title,
        xaxis_title="Time",
        yaxis_title="Price",
        hovermode="x unified", 
        template="plotly_dark",
        height=600
    )

    # Improve axis readability
    fig.update_xaxes(rangeslider_visible=True)

    return fig



def plot_forecast(df, forecast):

    fig = go.Figure()

    # =========================
    # 🕯 Candlestick-style (simulated OHLC)
    # =========================
    if all(col in df.columns for col in ["open", "high", "low", "close"]):

        fig.add_trace(go.Candlestick(
            x=df["ds"],
            open=df["open"],
            high=df["high"],
            low=df["low"],
            close=df["close"],
            name="Price",
            increasing_line_color="#22c55e",
            decreasing_line_color="#ef4444"
        ))

    else:
        # fallback line (still smooth)
        fig.add_trace(go.Scatter(
            x=df["ds"],
            y=df["y"],
            mode="lines",
            name="Actual Price",
            line=dict(color="#60a5fa", width=2)
        ))

    # =========================
    # 📈 Forecast Line (Gradient effect feel)
    # =========================
    fig.add_trace(go.Scatter(
        x=forecast["ds"],
        y=forecast["yhat"],
        mode="lines",
        name="Forecast",
        line=dict(color="#22c55e", width=3),
        hovertemplate="Forecast: %{y:,.2f}<extra></extra>"
    ))

    # =========================
    # 🎯 Confidence Ribbon (Upper)
    # =========================
    fig.add_trace(go.Scatter(
        x=forecast["ds"],
        y=forecast["yhat_upper"],
        mode="lines",
        line=dict(width=0),
        showlegend=False
    ))

    # =========================
    # 🎯 Confidence Ribbon (Lower + Fill)
    # =========================
    fig.add_trace(go.Scatter(
        x=forecast["ds"],
        y=forecast["yhat_lower"],
        mode="lines",
        fill="tonexty",
        fillcolor="rgba(34,197,94,0.15)",  # green glow ribbon
        line=dict(width=0),
        name="Confidence Interval",
        hoverinfo="skip"
    ))

    # =========================
    # 🎛 Layout upgrades (IMPORTANT)
    # =========================
    fig.update_layout(
        template="plotly_dark",

        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",

        title=dict(
            text="Bitcoin Forecast (AI Model)",
            x=0.5,
            xanchor="center"
        ),

        hovermode="x unified",

        autosize=True,
        height=600,   # ✅ SAME AS BACKTEST

        margin=dict(
            l=10,
            r=10,
            t=60,
            b=40
        ),

        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="center",
            x=0.5
        ),

        xaxis=dict(
            rangeselector=dict(
                buttons=list([
                    dict(count=7, label="1W", step="day", stepmode="backward"),
                    dict(count=1, label="1M", step="month", stepmode="backward"),
                    dict(count=6, label="6M", step="month", stepmode="backward"),
                    dict(step="all")
                ])
            ),
            rangeslider=dict(visible=True),
            type="date",
            showgrid=True,
            gridcolor="rgba(255,255,255,0.05)"
        ),

        yaxis=dict(
            showgrid=True,
            gridcolor="rgba(255,255,255,0.05)"
        )
    )


    return fig
