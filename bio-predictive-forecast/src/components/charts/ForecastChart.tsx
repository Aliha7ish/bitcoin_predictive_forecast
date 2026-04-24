import { useState, useRef } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Brush,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, TrendingUp } from "lucide-react";

interface ForecastPoint {
  date: string;
  forecast?: number;
  lower?: number;
  upper?: number;
  historical?: number;
}

interface Point {
  date: string;
  actual?: number;
  train?: number;
  test?: number;
  forecast?: number;
  lower?: number;
  upper?: number;
  historical?: number;
}

const fmt = (n: number) => `$${(n / 1000).toFixed(1)}k`;
const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    });
  } catch {
    return d;
  }
};

/**
 * Enhanced Forecast Chart with Professional Time-Series Visualization
 * Displays historical data, forecasts, and confidence intervals
 * with interactive zoom, smoothing, and range selector
 * 
 * Features:
 * - Historical data (solid line, subtle color)
 * - Forecast data (bright green, glowing)
 * - Confidence interval band (soft background)
 * - Forecast start reference line
 * - Interactive zoom and brush controls
 * - Smoothing toggle for curve interpolation
 */
export const ForecastChart = ({ data }: { data: (Point | ForecastPoint)[] }) => {
  const [smoothing, setSmoothing] = useState(false);
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-[420px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">No data to display</div>
      </div>
    );
  }

  console.log("📊 ForecastChart rendering with data:", {
    points: data.length,
    samplePoint: data[0],
    hasForecasts: data.some((d: any) => d.forecast !== undefined),
    hasConfidence: data.some((d: any) => d.upper !== undefined),
    hasHistorical: data.some((d: any) => d.historical !== undefined),
  });

  // Filter data based on zoom domain
  const displayData = data;


  // Determine if this is legacy format (with train/test) or new format (just forecast data)
  const isLegacyFormat = data.some((d: any) => d.actual !== undefined || d.train !== undefined);

  // Find key dates for reference lines from display data
  const splitDate = displayData.find((d: any) => d.test !== undefined)?.date;
  const forecastDate = displayData.find((d: any) => d.forecast !== undefined)?.date;

  // Calculate min/max for domain with padding
  const allValues = displayData
    .flatMap((d: any) => [
      d.forecast,
      d.lower,
      d.upper,
      d.actual,
      d.train,
      d.test,
      d.historical,
    ].filter((v) => typeof v === "number" && !isNaN(v)))
    .filter((v) => typeof v === "number");

    const minValue = allValues.length > 0 ? allValues.reduce((a, b) => Math.min(a, b), Infinity) : 0;
    const maxValue = allValues.length > 0 ? allValues.reduce((a, b) => Math.max(a, b), -Infinity) : 1;
    
    const padding = (maxValue - minValue) * 0.15;
    const domain = [Math.max(minValue - padding, 0), maxValue + padding];

  // Handle zoom

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Chart Title & Description */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-400 to-green-500" />
          <h3 className="font-mono text-sm font-semibold text-foreground">
            Time-Series Forecast Visualization
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {displayData.length} data points
        </span>
      </div>

      {/* Interactive Controls Toolbar */}
      <div className="flex items-center gap-2 px-1">

        <div className="w-px h-6 bg-border" />

        <button
          onClick={() => setSmoothing(!smoothing)}
          className={`text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
            smoothing
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-surface-2/40 text-muted-foreground border border-border hover:bg-surface-2/60"
          }`}
          title="Toggle smooth curve interpolation"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {smoothing ? "Smoothing On" : "Smoothing Off"}
        </button>
      </div>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%" ref={chartRef}>
          <ComposedChart
            data={displayData}
            margin={{ top: 20, right: 24, left: 0, bottom: 60 }}
          >
          <defs>
            {/* Confidence Interval Gradient - Band between lower and upper */}
            <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity={0.05} />
            </linearGradient>

            {/* Actual Line Gradient */}
            <linearGradient id="actualLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="hsl(var(--chart-actual))" stopOpacity={0.85} />
              <stop offset="100%" stopColor="hsl(var(--chart-actual))" stopOpacity={1} />
            </linearGradient>

            {/* Forecast Line Gradient with Glow */}
            <linearGradient id="forecastLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity={1} />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            stroke="hsl(var(--chart-grid))"
            strokeDasharray="2 6"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />

          <YAxis
            tickFormatter={fmt}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
            domain={domain}
          />

          <Tooltip
            cursor={{
              stroke: "hsl(var(--primary) / 0.4)",
              strokeDasharray: "3 3",
            }}
            contentStyle={{
              background: "hsl(var(--surface-2) / 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              fontSize: 11,
              color: "hsl(var(--foreground))",
              boxShadow: "0 10px 32px rgba(0,0,0,0.3)",
              padding: "12px",
            }}
            labelStyle={{
              color: "hsl(var(--muted-foreground))",
              fontFamily: "JetBrains Mono",
              fontSize: 10,
              marginBottom: 6,
              fontWeight: 600,
            }}
            labelFormatter={(l) => `📅 ${fmtDate(l as string)}`}
            formatter={(v: any, k: string) => {
              if (typeof v !== "number" || isNaN(v)) return null;
              
              const formatted = `$${v.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;

              // Add descriptive labels
              const labelMap: Record<string, string> = {
                historical: "📊 Historical",
                forecast: "🎯 Forecast",
                lower: "📉 Lower CI",
                upper: "📈 Upper CI",
                train: "📈 Train",
                test: "🔍 Test",
                actual: "📌 Actual",
              };

              const label = labelMap[k] || k.charAt(0).toUpperCase() + k.slice(1);
              return [formatted, label];
            }}
          />

          {/* ===== CONFIDENCE INTERVAL BAND ===== */}
          {/* Shaded area between lower and upper forecast bounds */}
          <Area
            type={smoothing ? "natural" : "monotone"}
            dataKey="upper"
            stroke="none"
            fill="url(#bandFill)"
            isAnimationActive
            name="Upper CI"
          />
          <Area
            type={smoothing ? "natural" : "monotone"}
            dataKey="lower"
            stroke="none"
            fill="hsl(var(--background))"
            isAnimationActive
            name="Lower CI"
          />

          {/* ===== HISTORICAL DATA LINE ===== */}
          {/* Solid line showing actual historical prices for context */}
          {data.some((d: any) => d.historical !== undefined) && (
            <Line
              type={smoothing ? "natural" : "monotone"}
              dataKey="historical"
              stroke="hsl(var(--chart-train) / 0.7)"
              strokeWidth={1.6}
              dot={false}
              isAnimationActive
              name="Historical Price"
              legendType="line"
            />
          )}

          {/* ===== LEGACY FORMAT SUPPORT (TRAIN/TEST) ===== */}
          {isLegacyFormat && (
            <>
              {/* Training segment: solid line */}
              <Line
                type={smoothing ? "natural" : "monotone"}
                dataKey="train"
                stroke="hsl(var(--chart-train))"
                strokeWidth={1.6}
                dot={false}
                isAnimationActive
                name="Train Data"
                legendType="line"
              />
              {/* Test segment: dashed line */}
              <Line
                type={smoothing ? "natural" : "monotone"}
                dataKey="test"
                stroke="hsl(var(--chart-test))"
                strokeWidth={1.6}
                dot={false}
                strokeDasharray="3 4"
                isAnimationActive
                name="Test Data"
                legendType="line"
              />
              {/* Actual values overlay */}
              <Line
                type={smoothing ? "natural" : "monotone"}
                dataKey="actual"
                stroke="url(#actualLine)"
                strokeWidth={1.4}
                dot={false}
                isAnimationActive
                name="Actual Values"
                legendType="line"
              />
            </>
          )}

          {/* ===== FORECAST LINE ===== */}
          {/* Primary forecast: bright green, glowing effect */}
          <Line
            type={smoothing ? "natural" : "monotone"}
            dataKey="forecast"
            stroke="url(#forecastLine)"
            strokeWidth={2.4}
            dot={false}
            isAnimationActive
            name="Forecast"
            legendType="line"
            style={{
              filter: "drop-shadow(0 0 8px rgb(34, 197, 94 / 0.6))",
            }}
          />

          {/* ===== REFERENCE LINES ===== */}
          {/* Test/train split marker (for backtest mode) */}
          {splitDate && (
            <ReferenceLine
              x={splitDate}
              stroke="hsl(var(--chart-test) / 0.6)"
              strokeDasharray="2 4"
              strokeWidth={1.5}
              label={{
                value: "TEST SPLIT",
                position: "top",
                fill: "hsl(var(--chart-test))",
                fontSize: 9,
                fontFamily: "JetBrains Mono",
                fontWeight: 600,
              }}
            />
          )}

          {/* Forecast start marker: where historical ends and forecast begins */}
          {forecastDate && (
            <ReferenceLine
              x={forecastDate}
              stroke="hsl(var(--primary) / 0.7)"
              strokeDasharray="2 3"
              strokeWidth={1.8}
              label={{
                value: "FORECAST START →",
                position: "top",
                fill: "hsl(var(--primary))",
                fontSize: 10,
                fontFamily: "JetBrains Mono",
                fontWeight: 700,
                offset: 8,
              }}
            />
          )}

          {/* Range Selector Brush */}
          <Brush
            dataKey="date"
            height={30}
            stroke="hsl(var(--border))"
            fill="hsl(var(--surface-2) / 0.2)"
            travellerWidth={8}
            tickFormatter={fmtDate}
          />

          {/* Legend: Shows all data series */}
          <Legend
            wrapperStyle={{
              paddingTop: "16px",
              fontSize: "12px",
            }}
            iconType="line"
            verticalAlign="bottom"
            height={32}
          />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
