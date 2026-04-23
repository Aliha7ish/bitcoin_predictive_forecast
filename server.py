"""
FastAPI Backend Server for Bitcoin Forecasting
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import io
import traceback

from models.ForecastEngine import ForecastEngine
from utils import load_bitcoin_data, preprocess_data, resample_data

# =====================================
# INITIALIZE FASTAPI APP
# =====================================
app = FastAPI(
    title="Bitcoin Forecasting API",
    description="Production-ready forecasting engine for Bitcoin price prediction",
    version="1.0.0"
)

# =====================================
# CORS CONFIGURATION
# =====================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# MODELS (Request/Response Schema)
# =====================================

class ForecastPoint(BaseModel):
    """Single forecast data point"""
    ds: str
    yhat: float
    yhat_lower: float
    yhat_upper: float


class EvaluationMetrics(BaseModel):
    """Evaluation metrics for backtest"""
    MAE: float
    RMSE: float
    MAPE: float
    R2_Score: float


class ForecastResponse(BaseModel):
    """Response containing forecast results"""
    forecast: List[ForecastPoint]
    metrics: Optional[EvaluationMetrics] = None
    message: str


# =====================================
# ENDPOINTS
# =====================================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Bitcoin Forecasting API",
        "version": "1.0.0"
    }


@app.post("/forecast", response_model=ForecastResponse)
async def forecast_endpoint(
    file: UploadFile = File(...),
    price_col: str = Form(...),
    model: str = Form("hybrid"),
    horizon: int = Form(30),
    ci: float = Form(0.95),
    resample_freq: str = Form("D"),
    run_backtest: bool = Form(False),
    test_size: int = Form(30),
):
    """
    🚀 Main Forecast Endpoint
    
    Parameters:
        - file: CSV or Excel file with time series data
        - price_col: Name of price column (e.g., "Close")
        - model: Model type (naive, sarima, prophet, xgb, hybrid)
        - horizon: Number of periods to forecast (7-180)
        - ci: Confidence interval (0.80-0.99)
        - resample_freq: Resampling frequency (D, W, M)
        - run_backtest: Whether to run backtest evaluation
        - test_size: Test set size in days
    
    Returns:
        ForecastResponse with forecast data and optional metrics
    """
    try:
        # =====================================
        # 1. LOAD AND VALIDATE DATA
        # =====================================
        contents = await file.read()
        file_obj = io.BytesIO(contents)
        file_obj.name = file.filename
        
        print(f"📁 Loading file: {file.filename}")
        print(f"📊 Selected price column: {price_col}")
        
        # Use the load_bitcoin_data function to validate
        # This will auto-detect date column and validate price column
        try:
            df = load_bitcoin_data(file_obj, price_col)
        except ValueError as e:
            # Return validation error to user
            error_msg = str(e)
            print(f"❌ Validation Error: {error_msg}")
            raise HTTPException(
                status_code=400,
                detail=f"❌ Data Validation Error: {error_msg}"
            )
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Data Loading Error: {error_msg}")
            raise HTTPException(
                status_code=400,
                detail=f"❌ Error loading file: {error_msg}"
            )
        
        # Preprocess data
        df = preprocess_data(df)
        
        print(f"✅ Data loaded and validated: {len(df)} rows")
        print(f"📈 Date range: {df['ds'].min()} to {df['ds'].max()}")
        
        # Resample if needed
        df = resample_data(df, freq=resample_freq)
        
        print(f"✅ After resampling ({resample_freq}): {len(df)} rows")
        
        # =====================================
        # 2. INITIALIZE ENGINE
        # =====================================
        engine = ForecastEngine(df)
        
        # =====================================
        # 3. VALIDATE MODEL
        # =====================================
        if model not in ["naive", "sarima", "prophet", "xgb", "hybrid"]:
            return ForecastResponse(
                forecast=[],
                message=f"❌ Unsupported model: {model}. Use: naive, sarima, prophet, xgb, hybrid"
            )
        
        # =====================================
        # 4. RUN BACKTEST (OPTIONAL)
        # =====================================
        metrics_dict = None
        
        if run_backtest:
            try:
                print(f"⚙️ Running backtest with {model}...")
                train, test, test_forecast, metrics_dict = engine.backtest(
                    model_type=model,
                    test_size=test_size
                )
                print(f"📊 Backtest metrics: MAE={metrics_dict.get('MAE', 0):.4f}")
            except Exception as e:
                print(f"⚠️ Backtest failed: {str(e)}")
                # Continue with forecast even if backtest fails
        
        # =====================================
        # 5. RUN FORECAST
        # =====================================
        print(f"🔮 Forecasting {horizon} periods with {model}...")
        forecast_df = engine.forecast(
            model_type=model,
            horizon=horizon,
            ci=ci
        )
        
        # =====================================
        # 6. FORMAT RESPONSE
        # =====================================
        forecast_list = []
        # Compute std safely from the whole column
        yhat_std = forecast_df["yhat"].std() if "yhat" in forecast_df.columns else 0

        for _, row in forecast_df.iterrows():
            forecast_list.append(
                ForecastPoint(
                    ds=row["ds"].strftime("%Y-%m-%d") if hasattr(row["ds"], "strftime") else str(row["ds"]),
                    yhat=float(row["yhat"]),

                    yhat_lower=float(
                        row["yhat_lower"]
                        if "yhat_lower" in forecast_df.columns
                        else row["yhat"] - 1.96 * yhat_std
                    ),

                    yhat_upper=float(
                        row["yhat_upper"]
                        if "yhat_upper" in forecast_df.columns
                        else row["yhat"] + 1.96 * yhat_std
                    )
                )
            )

        
        # Build metrics response if available
        metrics_response = None
        if metrics_dict:
            metrics_response = EvaluationMetrics(
                MAE=float(metrics_dict.get("MAE", 0)),
                RMSE=float(metrics_dict.get("RMSE", 0)),
                MAPE=float(metrics_dict.get("MAPE", 0)),
                R2_Score=float(metrics_dict.get("R2 Score", 0))
            )
        
        return ForecastResponse(
            forecast=forecast_list,
            metrics=metrics_response,
            message=f"✅ Forecast complete! Generated {len(forecast_list)} predictions using {model}"
        )
    
    except Exception as e:
        error_msg = f"❌ {str(e)}"
        print(f"{error_msg}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )


@app.get("/models")
def get_available_models():
    """Get list of available forecast models"""
    return {
        "available_models": [
            {
                "name": "naive",
                "description": "Naive forecasting (last value propagation)",
                "best_for": "Baseline comparisons"
            },
            {
                "name": "sarima",
                "description": "Seasonal ARIMA model",
                "best_for": "Seasonal data with trend"
            },
            {
                "name": "prophet",
                "description": "Facebook Prophet",
                "best_for": "Strong seasonal patterns"
            },
            {
                "name": "xgb",
                "description": "XGBoost regression",
                "best_for": "Complex non-linear patterns"
            },
            {
                "name": "hybrid",
                "description": "Ensemble combining multiple models",
                "best_for": "Best overall accuracy"
            }
        ]
    }


@app.get("/config")
def get_config():
    """Get API configuration and constraints"""
    return {
        "horizon_range": [7, 180],
        "ci_range": [0.80, 0.99],
        "resample_frequencies": ["D", "W", "M"],
        "models": ["naive", "sarima", "prophet", "xgb", "hybrid"],
        "max_file_size_mb": 50,
        "supported_formats": ["csv", "xlsx", "xls"]
    }


# =====================================
# STARTUP/SHUTDOWN EVENTS
# =====================================

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    print("🚀 Bitcoin Forecasting API starting...")
    print("✅ API ready at http://localhost:8000")
    print("📚 Documentation at http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Bitcoin Forecasting API shutting down...")


# =====================================
# RUN INSTRUCTIONS
# =====================================
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Bitcoin Forecasting API Server...")
    print("📊 Server will run at http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
