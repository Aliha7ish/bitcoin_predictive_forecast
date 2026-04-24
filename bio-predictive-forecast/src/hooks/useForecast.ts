/**
 * Custom React Hook for Forecast Management
 * Handles state, loading, and error management
 */

import { useState, useCallback } from "react";
import {
  ForecastResponse,
  ForecastRequest,
  EvaluationMetrics,
  ForecastPoint,
  runForecast,
  getAvailableModels,
  getConfig,
  checkHealth,
} from "@/services/forecastApi";

export interface UseForecastState {
  forecast: ForecastPoint[] | null;
  metrics: EvaluationMetrics | null;
  message: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  apiHealthy: boolean;
  availableModels: any | null;
  config: any | null;
}

const initialState: UseForecastState = {
  forecast: null,
  metrics: null,
  message: "",
  isLoading: false,
  isError: false,
  error: null,
  apiHealthy: false,
  availableModels: null,
  config: null,
};

/**
 * Hook for managing forecast operations
 */
export function useForecast() {
  const [state, setState] = useState<UseForecastState>(initialState);

  // =====================================
  // CHECK API HEALTH
  // =====================================
  const checkApiHealth = useCallback(async () => {
    try {
      const healthy = await checkHealth();
      setState((prev) => ({ ...prev, apiHealthy: healthy }));
      return healthy;
    } catch (error) {
      setState((prev) => ({ ...prev, apiHealthy: false }));
      return false;
    }
  }, []);

  // =====================================
  // FETCH AVAILABLE MODELS
  // =====================================
  const fetchModels = useCallback(async () => {
    try {
      const models = await getAvailableModels();
      setState((prev) => ({ ...prev, availableModels: models }));
      return models;
    } catch (error) {
      console.error("Failed to fetch models:", error);
      return null;
    }
  }, []);

  // =====================================
  // FETCH API CONFIG
  // =====================================
  const fetchConfig = useCallback(async () => {
    try {
      const config = await getConfig();
      setState((prev) => ({ ...prev, config }));
      return config;
    } catch (error) {
      console.error("Failed to fetch config:", error);
      return null;
    }
  }, []);

  // =====================================
  // RUN FORECAST
  // =====================================
  const executeForecast = useCallback(
    async (request: ForecastRequest & { date_col: string }): Promise<ForecastResponse | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
        error: null,
        message: "Preparing forecast request...",
      }));

      try {
        const response = await runForecast(request);

        setState((prev) => ({
          ...prev,
          forecast: response.forecast,
          metrics: response.metrics || null,
          message: response.message,
          isLoading: false,
          isError: false,
          error: null,
        }));

        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
          error: err,
          message: `Error: ${err.message}`,
          forecast: null,
          metrics: null,
        }));

        return null;
      }
    },
    []
  );

  // =====================================
  // RESET STATE
  // =====================================
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // =====================================
  // CLEAR RESULTS
  // =====================================
  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      forecast: null,
      metrics: null,
      message: "",
    }));
  }, []);

  return {
    ...state,
    checkApiHealth,
    fetchModels,
    fetchConfig,
    executeForecast,
    reset,
    clearResults,
  };
}
