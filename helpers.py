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


import plotly.graph_objects as go

def plot_forecast(df, forecast):

    fig = go.Figure()

    # =====================================
    # 1. HISTORICAL DATA
    # =====================================
    fig.add_trace(go.Scatter(
        x=df["ds"],
        y=df["y"],
        mode="lines",
        name="Historical Price",
        line=dict(width=2)
    ))

    # =====================================
    # 2. FORECAST LINE
    # =====================================
    fig.add_trace(go.Scatter(
        x=forecast["ds"],
        y=forecast["yhat"],
        mode="lines",
        name="Forecast",
        line=dict(width=3, dash="dash")
    ))

    # =====================================
    # 3. UNCERTAINTY BAND
    # =====================================
    fig.add_trace(go.Scatter(
        x=forecast["ds"],
        y=forecast["yhat_upper"],
        mode="lines",
        line=dict(width=0),
        showlegend=False
    ))

    fig.add_trace(go.Scatter(
        x=forecast["ds"],
        y=forecast["yhat_lower"],
        mode="lines",
        fill="tonexty",
        fillcolor="rgba(0, 200, 255, 0.2)",
        line=dict(width=0),
        name="Confidence Interval"
    ))

    # =====================================
    # 4. LAYOUT (PROFESSIONAL TOUCH)
    # =====================================
    fig.update_layout(
        title="📊 Bitcoin Price Forecast",
        xaxis_title="Date",
        yaxis_title="Price",
        template="plotly_dark",
        hovermode="x unified",
        height=600
    )

    fig.update_xaxes(rangeslider_visible=True)

    return fig
