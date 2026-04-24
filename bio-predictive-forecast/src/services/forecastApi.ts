/**
 * Bitcoin Forecasting API Service
 * Handles all API calls to the FastAPI backend
 */

const API_BASE_URL = "http://localhost:8000";

// ====================================
// TYPE DEFINITIONS
// ====================================

export interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

export interface EvaluationMetrics {
  MAE: number;
  RMSE: number;
  MAPE: number;
  R2_Score: number;
}

export interface ForecastResponse {
  forecast: ForecastPoint[];
  metrics?: EvaluationMetrics;
  message: string;
}

export interface ForecastRequest {
  file: File;
  price_col: string;
  date_col: string
  model: "naive" | "sarima" | "prophet" | "xgb" | "hybrid";
  horizon: number;
  ci: number;
  resample_freq: "D" | "W" | "M";
  run_backtest: boolean;
  test_size: number;
}

// ====================================
// API SERVICE
// ====================================

/**
 * Check if API server is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      timeout: 5000,
    } as any);
    return response.ok;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

/**
 * Get available models
 */
export async function getAvailableModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get models:", error);
    throw error;
  }
}

/**
 * Get API configuration
 */
export async function getConfig() {
  try {
    const response = await fetch(`${API_BASE_URL}/config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get config:", error);
    throw error;
  }
}

/**
 * Run forecast
 * Main endpoint that handles file upload and forecast generation
 */
export async function runForecast(
  request: ForecastRequest
): Promise<ForecastResponse> {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append("file", request.file);
    formData.append("price_col", request.price_col);
    formData.append("model", request.model);
    formData.append("horizon", request.horizon.toString());
    formData.append("ci", request.ci.toString());
    formData.append("resample_freq", request.resample_freq);
    formData.append("run_backtest", request.run_backtest.toString());
    formData.append("test_size", request.test_size.toString());
    formData.append("date_col", request.date_col);


    console.log("📤 Sending forecast request...", {
      file: request.file.name,
      price_col: request.price_col,
      model: request.model,
    });

    const response = await fetch(`${API_BASE_URL}/forecast`, {
      method: "POST",
      body: formData,
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      console.error("❌ Forecast error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data: ForecastResponse = await response.json();
    console.log("✅ Forecast response received:", {
      forecastPoints: data.forecast.length,
      hasMetrics: !!data.metrics,
      message: data.message,
    });
    return data;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    console.error("❌ Forecast request failed:", errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Helper: Convert forecast data to format suitable for plotting
 */
export function formatForecastForChart(
  forecast: ForecastPoint[]
): {
  dates: string[];
  values: number[];
  lowerBounds: number[];
  upperBounds: number[];
} {
  return {
    dates: forecast.map((p) => p.ds),
    values: forecast.map((p) => p.yhat),
    lowerBounds: forecast.map((p) => p.yhat_lower),
    upperBounds: forecast.map((p) => p.yhat_upper),
  };
}

/**
 * Helper: Format metrics for display
 */
export function formatMetrics(metrics: EvaluationMetrics) {
  return {
    mae: `$${metrics.MAE.toFixed(2)}`,
    rmse: `$${metrics.RMSE.toFixed(2)}`,
    mape: `${metrics.MAPE.toFixed(2)}%`,
    r2: metrics.R2_Score.toFixed(4),
  };
}
