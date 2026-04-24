import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { PageShell } from "@/components/site/PageShell";
import { SubtleVeins } from "@/components/site/SubtleVeins";
import { Reveal } from "@/components/site/Reveal";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useForecast } from "@/hooks/useForecast";
import { checkHealth } from "@/services/forecastApi";

import {
  Activity,
  ArrowDown,
  ArrowUp,
  FileSpreadsheet,
  Layers,
  Sparkles,
  TrendingUp,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { ForecastPoint } from "@/services/forecastApi";

/* -------------------------------------------------------------------------- */
/*                     COMPONENT STATE MANAGEMENT                             */
/* -------------------------------------------------------------------------- */
const detectColumns = (header: string[]) => {
  const dateCandidates = ["date", "time", "timestamp", "ds"];

  const dateCol =
    header.find(h =>
      dateCandidates.some(d => h.toLowerCase().includes(d))
    ) || header[0];

  const priceCandidates = ["close", "price", "adj close", "btc", "value"];

  const priceCol =
    header.find(h =>
      priceCandidates.some(p => h.toLowerCase().includes(p))
    ) || header[1];

  return { dateCol, priceCol };
};



const resampleData = (
  data: { date: string; historical: number }[],
  freq: "D" | "W" | "M"
) => {
  const map = new Map<string, number[]>();

  const getKey = (date: Date) => {
    if (freq === "D") return date.toISOString().split("T")[0];

    if (freq === "W") {
      const d = new Date(date);
      const firstDay = new Date(d);
      firstDay.setDate(d.getDate() - d.getDay());
      return firstDay.toISOString().split("T")[0];
    }

    if (freq === "M") {
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    }

    return date.toISOString();
  };

  for (const point of data) {
    const d = new Date(Date.parse(point.date));
    if (isNaN(d.getTime())) continue;

    const key = getKey(d);

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(point.historical);
  }

  return Array.from(map.entries()).map(([key, values]) => ({
    date: key,
    historical: Math.round(
      values.reduce((a, b) => a + b, 0) / values.length
    ),
  }));
};



const Predict = () => {
  // File and data state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [priceColumns, setPriceColumns] = useState<string[]>([]);
  const [selectedPriceCol, setSelectedPriceCol] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Forecast parameters
  const [model, setModel] = useState<"naive" | "sarima" | "prophet" | "xgb" | "hybrid">("hybrid");
  const [horizon, setHorizon] = useState(30);
  const [confidence, setConfidence] = useState(0.95);
  const [resampleFreq, setResampleFreq] = useState<"D" | "W" | "M">("D");
  const [runBacktest, setRunBacktest] = useState(true);
  const [testSize, setTestSize] = useState(30);
  const [apiHealthyLocal, setApiHealthyLocal] = useState(true);
  const [selectedDateCol, setSelectedDateCol] = useState<string>("");
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fullData, setFullData] = useState<string[][]>([]);




  // API and state management
  const {
    forecast,
    metrics,
    message,
    isLoading,
    isError,
    error,
    apiHealthy,
    executeForecast,
    clearResults,
  } = useForecast();

  // Check API health on mount
  useEffect(() => {
    const run = async () => {
      const ok = await checkHealth();
      setApiHealthyLocal(ok);
      console.log("API Health:", ok);
    };
    run();
  }, []);



  /* ---------- FILE HANDLING ---------- */

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error("CSV needs a header row and at least one data row.");
        }

        // Parse header
        const splitLine = (l: string) =>
          l.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));

        const header = splitLine(lines[0]);
        const allRows = lines.slice(1).map(splitLine); // ALL rows
        const rows = allRows.slice(0, 5); // first 5 rows for preview

        setColumns(header);
        setPreviewData(rows);
        setFullData(allRows);

        // show ALL columns
        setPriceColumns(header);

        // auto detect
        const { dateCol, priceCol } = detectColumns(header);
        setSelectedPriceCol(priceCol);
        setSelectedDateCol(dateCol);


        setUploadedFile(file);
        setFileName(file.name);
        clearResults();

        toast({
          title: "✅ File loaded",
          description: `${lines.length - 1} rows detected. Columns: ${header.join(", ")}`,
        });
      } catch (e: any) {
        toast({
          title: "❌ Couldn't read CSV",
          description: e?.message ?? "Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  }, [clearResults]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.includes("text")) handleFile(f);
  };

  const reset = () => {
    setUploadedFile(null);
    setFileName(null);
    setPriceColumns([]);
    setSelectedPriceCol("");
    setPreviewData([]);
    setFullData([]);
    setColumns([]);
    clearResults();
    if (inputRef.current) inputRef.current.value = "";
  };

  /* ---------- FORECAST EXECUTION ---------- */

  const handleRunForecast = async () => {
    if (!uploadedFile || !selectedPriceCol) {
      toast({
        title: "⚠️ Missing inputs",
        description: "Please upload a file and select a price column.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDateCol) {
      toast({
        title: "⚠️ Missing date column",
        description: "Could not detect date column in dataset.",
        variant: "destructive",
      });
      return;
    }

    // Validate price column is in columns list
    if (!columns.includes(selectedPriceCol)) {
      toast({
        title: "❌ Invalid price column",
        description: `Column "${selectedPriceCol}" not found in dataset.`,
        variant: "destructive",
      });
      return;
    }

    console.log("🚀 Running forecast with:", {
      file: uploadedFile.name,
      price_col: selectedPriceCol,
      date_col: selectedDateCol,
      model,
      horizon,
      confidence,
      testSize,
    });

    try {
      const result = await executeForecast({
        file: uploadedFile,
        price_col: selectedPriceCol,
        date_col: selectedDateCol,
        model,
        horizon,
        ci: confidence,
        resample_freq: resampleFreq,
        run_backtest: runBacktest,
        test_size: testSize,
      });

      console.log("✅ Forecast result:", result);

      if (!result || !result.forecast || result.forecast.length === 0) {
        toast({
          title: "❌ No forecast data",
          description: result?.message || "API returned empty forecast",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("❌ Forecast error:", err);
      toast({
        title: "❌ Forecast failed",
        description: error?.message || "Please check your data and try again.",
        variant: "destructive",
      });
    }
  };

  /* ---------- DERIVED VALUES ---------- */

  const safeNum = (v: any) =>
    typeof v === "number" && !isNaN(v) ? v : 0;

  const forecastData = useMemo(() => {
    if (!forecast || forecast.length === 0) return null;

    // ===== STEP 1: Parse Historical Data from CSV =====
    const historicalArray: Array<{
      date: string;
      historical: number;
    }> = [];

    
    
    if (fullData.length > 0 && selectedDateCol && selectedPriceCol && columns.length > 0) {
      const dateColIdx = columns.indexOf(selectedDateCol);
      const priceColIdx = columns.indexOf(selectedPriceCol);

      if (dateColIdx >= 0 && priceColIdx >= 0) {
        fullData.forEach((row) => {
          if (row[dateColIdx] && row[priceColIdx]) {
            try {
              const price = parseFloat(row[priceColIdx].replace(/[$,]/g, ""));
              if (!isNaN(price)) {
                historicalArray.push({
                  date: row[dateColIdx].trim(),
                  historical: Math.round(price),
                });
              }
            } catch {
              // Skip rows that can't be parsed
            }
          }
        });
      }
    }

    const resampledHistorical = resampleData(historicalArray, resampleFreq);
    
    // ===== STEP 2: Build Forecast Array from API Response =====
    const forecastArray = forecast.map((point: ForecastPoint) => ({
      date: point.ds,
      forecast: Math.round(safeNum(point.yhat)),
      lower: Math.round(safeNum(point.yhat_lower)),
      upper: Math.round(safeNum(point.yhat_upper)),
    }));

    // ===== STEP 3: Merge Historical + Forecast into Continuous Timeline =====
    // Identify the forecast start date (first forecast point)
    const forecastStartDate = forecastArray.length > 0 ? forecastArray[0].date : null;

    // Filter historical data to exclude dates >= forecast start (avoid overlap)
    const historyBeforeForecast = forecastStartDate
      ? resampledHistorical.filter((h) => new Date(h.date) < new Date(forecastStartDate))
      : resampledHistorical;

    // Combine: historical data + forecast data
    const mergedData = [...historyBeforeForecast, ...forecastArray];

    // Sort by date (in case not in order)
    mergedData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Log for debugging
    console.log("📊 Merged Data Summary:", {
      historicalPoints: historyBeforeForecast.length,
      forecastPoints: forecastArray.length,
      totalPoints: mergedData.length,
      dateRange: mergedData.length > 0 
        ? `${mergedData[0].date} → ${mergedData[mergedData.length - 1].date}`
        : "No data",
      forecastStartDate,
    });

    return mergedData;
  }, [forecast, fullData, selectedDateCol, selectedPriceCol, columns]);

  // Find the last forecast point and first value for comparison
  const lastForecastPoint = forecastData ? [...forecastData].reverse().find((d: any) => d.forecast !== undefined) : null;
  const lastForecast = (lastForecastPoint as any)?.forecast ?? 0;
  
  const firstValue = (forecastData?.[0] as any)?.historical ?? (forecastData?.[0] as any)?.forecast ?? 0;
  const change = lastForecast - firstValue;
  const pct = firstValue ? (change / firstValue) * 100 : 0;

  // Get confidence bounds from the last forecast point
  const lastConfidenceLower = (lastForecastPoint as any)?.lower ?? 0;
  const lastConfidenceUpper = (lastForecastPoint as any)?.upper ?? 0;

  /* ---------- RENDER ---------- */

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <SubtleVeins />
        <div className="container relative pb-10 pt-6">
          <Reveal>
            <div className="flex flex-col gap-2">
              <span className="chip w-fit">
                <span className="pulse-dot" />
                <span className="font-mono uppercase tracking-widest">predict · real data</span>
              </span>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl md:text-5xl text-gradient">
                    Bitcoin Price Forecasting
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    Upload your BTC data, select a model, and get AI-powered forecasts with
                    confidence intervals.
                  </p>
                </div>

                {/* API Status Indicator */}
                <div className="flex items-center gap-2">
                  {apiHealthyLocal ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">API Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">API Unavailable</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container pb-20 predict_section">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* ---------- SIDEBAR ---------- */}
          <Reveal>
            <aside className="glass sticky top-28 rounded-2xl p-4">
              {/* Upload */}
              <div className="px-1 pb-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Dataset
                </h3>
                {fileName ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-surface-2/40 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <div className="truncate text-xs text-foreground">{fileName}</div>
                      </div>
                    </div>
                    <button
                      onClick={reset}
                      className="rounded-md p-1 text-muted-foreground transition hover:bg-surface-3 hover:text-foreground"
                      aria-label="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-6 text-center transition ${
                      dragOver
                        ? "border-primary/60 bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-surface-2/40"
                    }`}
                  >
                    <Upload className="h-5 w-5 text-primary" />
                    <div className="text-xs text-foreground">Drop CSV here</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      or click to browse
                    </div>
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="divider-mint my-2" />

              {/* Price Column Selection + Date Column Info */}
              {priceColumns.length > 0 && (
                <>
                  <div className="px-1 py-3">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground pb-2">
                      Detected Date Column
                    </h3>
                    <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2 text-sm text-primary font-mono">
                      {selectedDateCol || "❌ Not detected"}
                    </div>
                    {!selectedDateCol && (
                      <p className="mt-1 text-[10px] text-destructive">
                        ⚠️ Could not auto-detect date column. Please ensure your CSV has a date column.
                      </p>
                    )}
                  </div>
                  <div className="divider-mint my-2" />

                  <div className="px-1 py-3">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground pb-2">
                      Price Column
                    </h3>
                    <select
                      value={selectedPriceCol}
                      onChange={(e) => {
                        setSelectedPriceCol(e.target.value);
                        console.log("Selected price column:", e.target.value);
                      }}
                      className="w-full rounded-lg border border-border bg-surface-2/40 px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">-- Select a column --</option>
                      {priceColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    {selectedPriceCol && (
                      <p className="mt-1 text-[10px] text-primary">
                        Selected: {selectedPriceCol}
                      </p>
                    )}
                  </div>
                  <div className="divider-mint my-2" />
                </>
              )}

              {/* Model Selection */}
              <div className="px-1 py-3">
                <div className="flex items-center justify-between pb-2">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Model
                  </h3>
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1.5">
                  {["hybrid", "prophet", "sarima", "xgb", "naive"].map((m) => {
                    const active = m === model;
                    return (
                      <button
                        key={m}
                        onClick={() => setModel(m as any)}
                        className={`group relative w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
                          active
                            ? "border-primary/40 bg-primary/5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                            : "border-transparent hover:border-border hover:bg-surface-2/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-display text-sm capitalize ${
                              active ? "text-foreground" : "text-foreground/85"
                            }`}
                          >
                            {m}
                          </span>
                          {active && <span className="pulse-dot" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="divider-mint my-2" />

              {/* Horizon */}
              <div className="px-1 py-3">
                <div className="flex items-center justify-between pb-3">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Horizon
                  </Label>
                  <span className="font-mono text-xs text-primary">{horizon}d</span>
                </div>
                <Slider
                  value={[horizon]}
                  min={7}
                  max={180}
                  step={1}
                  onValueChange={(v) => setHorizon(v[0])}
                />
                <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>7d</span>
                  <span>180d</span>
                </div>
              </div>

              {/* Confidence */}
              <div className="px-1 py-3">
                <div className="flex items-center justify-between pb-3">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Confidence
                  </Label>
                  <span className="font-mono text-xs text-primary">
                    {(confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[Math.round(confidence * 100)]}
                  min={80}
                  max={99}
                  step={1}
                  onValueChange={(v) => setConfidence(v[0] / 100)}
                />
                <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>80%</span>
                  <span>99%</span>
                </div>
              </div>

              <div className="divider-mint my-2" />

              {/* Test Size (for backtest) */}
              <div className="px-1 py-3">
                <div className="flex items-center justify-between pb-3">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Test Size (Backtest)
                  </Label>
                  <span className="font-mono text-xs text-primary">{testSize}d</span>
                </div>
                <Slider
                  value={[testSize]}
                  min={7}
                  max={90}
                  step={1}
                  onValueChange={(v) => setTestSize(v[0])}
                />
                <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>7d</span>
                  <span>90d</span>
                </div>
              </div>

              <div className="divider-mint my-2" />

              {/* Run Button */}
              <Button
                onClick={handleRunForecast}
                disabled={!uploadedFile || !selectedPriceCol || isLoading || !apiHealthyLocal}
                className="w-full mt-4"
              >
                {isLoading ? "Forecasting..." : "Run Forecast"}
              </Button>
            </aside>
          </Reveal>

          {/* Data Preview Table */}
          {previewData.length > 0 && !isLoading && !forecastData && (
            <Reveal delay={0.02}>
              <div className="glass rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-lg text-foreground">Data Preview</h3>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{previewData.length} rows shown (first 5)</span>
                </div>

                <div className="overflow-auto max-h-[300px] border border-border rounded-lg bg-surface-2/20">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-surface-2/60 backdrop-blur-sm">
                      <tr>
                        {columns.map((col) => (
                          <th
                            key={col}
                            className="text-left p-3 border-b border-border font-semibold text-muted-foreground"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-surface-2/40 transition">
                          {row.map((cell, j) => (
                            <td key={j} className="p-3 text-foreground font-mono">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.05}>
            {isLoading && (
              <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[400px]">
                <div className="animate-spin">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-display text-lg text-foreground">Generating forecast...</p>
                  <p className="text-sm text-muted-foreground">This may take a moment</p>
                </div>
              </div>
            )}

            {isError && (
              <div className="glass rounded-2xl p-6 border-2 border-destructive bg-destructive/5">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-foreground font-semibold">
                      ❌ Forecast Error
                    </h3>
                    <p className="text-sm text-destructive/90 mt-2 font-mono leading-relaxed whitespace-pre-wrap">
                      {error?.message || "Unknown error occurred"}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearResults();
                        }}
                      >
                        Try Again
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={reset}
                      >
                        Upload New File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {forecastData && !isLoading && (
              <div className="flex flex-col gap-6">
                <div className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {model} · {horizon}d · {(confidence * 100).toFixed(0)}% CI
                      </span>
                    </div>
                  </div>
                  <ForecastChart data={forecastData} />
                </div>

                {/* Metrics */}
                {metrics && (
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { label: "MAE", value: metrics.MAE.toFixed(2), icon: Activity },
                      { label: "RMSE", value: metrics.RMSE.toFixed(2), icon: Sparkles },
                      { label: "MAPE", value: `${metrics.MAPE.toFixed(2)}%`, icon: TrendingUp },
                      { label: "R²", value: metrics.R2_Score.toFixed(3), icon: Layers },
                    ].map((m) => (
                      <div key={m.label} className="glass rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {m.label}
                          </span>
                          <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="mt-3 font-display text-3xl text-gradient">{m.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Confidence Values */}
                <div className="grid gap-4 md:grid-cols-3">
                  <ConfidenceCard
                    label={`Lower (${(confidence * 100).toFixed(0)}%)`}
                    value={lastConfidenceLower}
                    tone="muted"
                  />
                  <ConfidenceCard
                    label={`Forecast (${horizon}d)`}
                    value={lastForecast}
                    tone="primary"
                  />
                  <ConfidenceCard
                    label={`Upper (${(confidence * 100).toFixed(0)}%)`}
                    value={lastConfidenceUpper}
                    tone="muted"
                  />
                </div>
              </div>
            )}

            {!forecastData && !isLoading && !isError && (
              <EmptyState onPick={() => inputRef.current?.click()} />
            )}
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
};

/* ----------- SUBCOMPONENTS ----------- */
const ConfidenceCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "muted";
}) => (
  <div className="glass rounded-2xl p-5">
    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      {label}
    </div>

    <div
      className={`mt-2 font-display text-3xl ${
        tone === "primary"
          ? "text-primary"
          : "text-foreground/80"
      }`}
    >
      ${value.toLocaleString()}
    </div>
  </div>
);

const EmptyState = ({ onPick }: { onPick: () => void }) => (
  <div className="glass relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center">
    <div className="pointer-events-none absolute inset-0 grid-veins opacity-30" />

    <div className="relative">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/5 text-primary">
        <Upload className="h-6 w-6" />
      </div>

      <h3 className="mt-5 font-display text-2xl text-gradient">
        Upload a Bitcoin CSV to begin
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        We accept exports from Yahoo Finance, CoinGecko, Binance and most exchanges.
      </p>

      <Button onClick={onPick} className="mt-6">
        <Upload className="mr-2 h-4 w-4" /> Choose CSV file
      </Button>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Required columns: date · OHLC
      </div>
    </div>
  </div>
);


// ✅ ONLY ONE EXPORT AT THE VERY END
export default Predict;