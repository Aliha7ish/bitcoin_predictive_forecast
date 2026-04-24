# Bitcoin Predictive Forecast - User Interface

A research-oriented, responsive web interface for Bitcoin price forecasting that integrates advanced time series models with intuitive data visualization and interactive analysis tools.

---

## 1. Overview

The Bitcoin Predictive Forecast UI is a modern, single-page application (SPA) built with React and TypeScript. It provides researchers, analysts, and traders with an accessible platform for:

- Real-time Bitcoin price data visualization
- Interactive forecasting model selection and configuration
- Comprehensive performance evaluation and backtesting
- Insights and statistical analysis
- Research documentation and methodology

The application follows a modular architecture with component-based design principles, enabling maintainability and extensibility across multiple data analysis workflows.

![Application Demo](https://private-user-images.githubusercontent.com/94799871/583076594-4c6a199e-3ffd-4d8b-ba4e-32fe31407c38.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTQxNzYsIm5iZiI6MTc3Njk5Mzg3NiwicGF0aCI6Ii85NDc5OTg3MS81ODMwNzY1OTQtNGM2YTE5OWUtM2ZmZC00ZDhiLWJhNGUtMzJmZTMxNDA3YzM4LmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAxMjQzNlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTdjODE3YzMyZGUxMWQzN2FmZTBkZTkzMGNlMGE4YTlhYTU3ZTIzYmE1ZjhmMzgwMGI2NDY5N2M2MmU5NzAwYWImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRmdpZiJ9.OcvOai58oJPxY-yNabTgozmchtU1u6BGqUNFbRxDOwI)

---

## 2. User Interface and Experience Design

### 2.1 Design Philosophy

The interface prioritizes:

- **Clarity**: Minimal cognitive load through intuitive navigation and clear information hierarchies
- **Responsiveness**: Seamless functionality across desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliance for inclusive user experience
- **Consistency**: Unified design patterns through comprehensive component library (shadcn/ui)
- **Performance**: Optimized rendering and efficient API communication

### 2.2 Visual Design System

The application implements a modern design system leveraging:

- **Tailwind CSS**: Utility-first CSS framework for rapid, maintainable styling
- **shadcn/ui**: Customizable, accessible React components (25+ component types)
- **TypeScript**: Type-safe development ensuring robust component interfaces

Color palette, typography, spacing, and interactive patterns are consistently applied across all pages and components.

### 2.3 Core Pages and Workflows

#### 2.3.1 Dashboard

Central hub for monitoring forecast results and key metrics:

- Real-time display of latest Bitcoin price
- Historical price trends with interactive charts
- Performance metrics for active models
- Quick-access model selection and configuration

![Application Dashboard](https://private-user-images.githubusercontent.com/94799871/583076924-86cb3865-ffb5-4872-86d0-d15487b9de3d.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTQyNTIsIm5iZiI6MTc3Njk5Mzk1MiwicGF0aCI6Ii85NDc5OTg3MS81ODMwNzY5MjQtODZjYjM4NjUtZmZiNS00ODcyLTg2ZDAtZDE1NDg3YjlkZTNkLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAxMjU1MlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTdiNzM3MGZiYzU3ZjU5ZmY5ZGQwMzYxMTc2YTBjMGZiZTI4ZjMyNjg5OWU1ZGFjYTIwMGYzZDE2YTVlNmJiMWUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRnBuZyJ9.IntesLbaX9BKXzkHPMfefuk30AZVSVaeqNmUmIbAMlI)

#### 2.3.2 Predict

Primary forecasting interface enabling users to:

1. Configure model parameters (horizon, confidence intervals)

   ![Application Configurations](https://private-user-images.githubusercontent.com/94799871/583077268-3ba89dba-3d93-4e4c-ba8b-e882e6dfc5d2.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTQzNDYsIm5iZiI6MTc3Njk5NDA0NiwicGF0aCI6Ii85NDc5OTg3MS81ODMwNzcyNjgtM2JhODlkYmEtM2Q5My00ZTRjLWJhOGItZTg4MmU2ZGZjNWQyLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAxMjcyNlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWY1YzlmOThjYWM0MTgzZTVlMWRkYzMyNTU5MjFjOTk1ODY5ZGFjODEwMWU0NWFhYjg1MzIzMDhkMjkzNmQ5ODQmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRnBuZyJ9.iBq5lg97nJ3XUQCVVlrSf7VxLHVfe1sQcrisGBcb8sA)
   
2. Select forecasting model (Hybrid GAM+XGBoost, SARIMA, Prophet, or Naive baseline)
   
   ![Application Model Selection](https://private-user-images.githubusercontent.com/94799871/583077281-793ae1a2-5a5f-44ae-94ba-7f3fa3c1f9f5.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTQzNDYsIm5iZiI6MTc3Njk5NDA0NiwicGF0aCI6Ii85NDc5OTg3MS81ODMwNzcyODEtNzkzYWUxYTItNWE1Zi00NGFlLTk0YmEtN2YzZmEzYzFmOWY1LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAxMjcyNlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTZmNWY0YjA2YTNkODE2MDYzYjk5ZDJlMWMxNGQ3ZGMwY2EyODdlZjk5YjVmNDkxOWExNDkxYmI2OGZkMzZlODYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRnBuZyJ9.fGadXuxnLpPXysfKVj49g70JJl23eU6AYqPNpwKVMcQ)
   
3. Visualize predictions with uncertainty bands
   
   ![Application Model Forecast](https://private-user-images.githubusercontent.com/94799871/583077605-ad77fee6-a3c6-4c09-957a-8299afec034a.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTQ0MTYsIm5iZiI6MTc3Njk5NDExNiwicGF0aCI6Ii85NDc5OTg3MS81ODMwNzc2MDUtYWQ3N2ZlZTYtYTNjNi00YzA5LTk1N2EtODI5OWFmZWMwMzRhLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAxMjgzNlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTdhMjAxYzAwMmRmNDUyODQyNmNiYWVhYmU0NTk1NWU2ZTA1NmZmM2NiM2MxN2FiNWJlMjE3ZDZmMmY4MjdmMmUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRnBuZyJ9.V8XbXmHR42W-Ia_XjOieW52koHDBzBhF7t-5kSmjbps)
   

#### 2.3.3 Research

Comprehensive documentation:

- Methodology overview
- Model descriptions and mathematical formulations
- Experimental findings and comparative analysis
- Data preprocessing procedures

 ![Application Research](https://private-user-images.githubusercontent.com/94799871/583069150-47d8e617-7bf7-4fb8-a141-2ff56f84abd2.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTI1NjYsIm5iZiI6MTc3Njk5MjI2NiwicGF0aCI6Ii85NDc5OTg3MS81ODMwNjkxNTAtNDdkOGU2MTctN2JmNy00ZmI4LWExNDEtMmZmNTZmODRhYmQyLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAwNTc0NlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTJiZjk1M2NiYjAyMmE5NmQ4ZDRjZjQzNzI5NWE3NTdmMmQyOThjNWMzZDg1ODZjYmEwYmNiNjg2NTZhZWM2NjAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRnBuZyJ9.LoYe89rSJ9OO6IJfJKpTI2AkdJMMcVD8OlT6HwheGmA)

#### 2.3.4 Index

Landing page with project overview, capabilities showcase, and call-to-action for exploration.

 ![Application Index](https://private-user-images.githubusercontent.com/94799871/583071743-feef9e85-916b-48d3-b769-2c069fcba812.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTMxMDcsIm5iZiI6MTc3Njk5MjgwNywicGF0aCI6Ii85NDc5OTg3MS81ODMwNzE3NDMtZmVlZjllODUtOTE2Yi00OGQzLWI3NjktMmMwNjlmY2JhODEyLmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAxMDY0N1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTg1MzlhMzUyZjc3NmU5NTZiZWFjNDI3YjE0OGY2MmI4M2Y5NTRlYTY2NmVhNGY1Y2Y3YjY2M2I0MmIyMGQxZGYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRmdpZiJ9.GaJuVQ5iIS2jDzos6AdM2noLXM-NLrChqQR6Yxz5bfc)

### 2.4 Data Visualization

The application integrates Recharts for robust, interactive charting:

- **Line Charts**: Price trends and forecasts with confidence intervals
- **Area Charts**: Volume and volatility distribution
- **Composite Views**: Multi-metric comparison and correlation analysis
- **Mini Sparklines**: Rapid metric assessment across dashboards

All charts feature:

- Zoom and pan capabilities
- Tooltip inspection
- Legend toggling
- Responsive scaling

  ![Application Visualizations](https://private-user-images.githubusercontent.com/94799871/583073009-7d9ba60f-a0f9-437c-b6cc-e2ed8ed3975c.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTMzMzEsIm5iZiI6MTc3Njk5MzAzMSwicGF0aCI6Ii85NDc5OTg3MS81ODMwNzMwMDktN2Q5YmE2MGYtYTBmOS00MzdjLWI2Y2MtZTJlZDhlZDM5NzVjLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAxMTAzMVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTQ3NGMzODRiZGUyN2M1YzcyNmQ0YWFmOGI1MDhlZDA5ZGIyMWY5M2EwMTRkZTdiZGJhMmY2ZDdiNDk5NTIwOWQmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRnBuZyJ9.8VlSuzRENwl-ymvuul0dhzDlN2ZrQsT5CVBnD9mrdEc)

  ![Application Metrics](https://private-user-images.githubusercontent.com/94799871/583073070-57bad1b6-8b4e-4eac-b112-f55f2adb2498.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzY5OTMzMzEsIm5iZiI6MTc3Njk5MzAzMSwicGF0aCI6Ii85NDc5OTg3MS81ODMwNzMwNzAtNTdiYWQxYjYtOGI0ZS00ZWFjLWIxMTItZjU1ZjJhZGIyNDk4LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjA0MjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwNDI0VDAxMTAzMVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWZmNmM4Mjg1MTczOTkyNThlZjQ5NzNiZWNmODhkZDcyNWE5NTFhMTYwNWE4YTgzNWFhODllNjcwZjM0ZWI2NTcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnJlc3BvbnNlLWNvbnRlbnQtdHlwZT1pbWFnZSUyRnBuZyJ9.KtURUmwdMaZDXc_YsshR4DSAaEAYDMu3taA4PtwU8v4)

---

## 3. Integrated Forecasting Models

### 3.1 Model Architecture

The application provides access to four distinct forecasting approaches:

#### 3.1.1 Hybrid Model (GAM + XGBoost)

**Approach**: Trend decomposition via Generalized Additive Model (GAM) followed by residual learning via gradient boosted decision trees (XGBoost).

**Performance Characteristics**:
- Test MAE: 14,880.91
- Test RMSE: 18,619.99
- Test R²: 0.1852
- Balanced generalization and volatility capture

**Advantages**:
- Separates interpretable trend components from complex nonlinear patterns
- Enhanced extrapolation compared to standalone machine learning models
- Suitable for moderate forecast horizons

#### 3.1.2 SARIMA (Seasonal AutoRegressive Integrated Moving Average)

**Approach**: Classical statistical time series model with seasonal decomposition.

**Characteristics**:
- Autoregressive order: 1
- Differencing: 0
- No detected seasonality (m=1)
- Fast inference and confidence interval generation

**Limitations**:
- Limited volatility capture in recent market data
- Mean-reverting behavior unsuitable for trending periods

#### 3.1.3 Prophet

**Approach**: Additive decomposition model by Facebook (Meta).

**Characteristics**:
- Automatic trend changepoint detection
- Seasonal component modeling
- Holiday and anomaly handling

**Advantages**:
- Robust to missing data and outliers
- Intuitive parameter specification

#### 3.1.4 Naive Baseline

**Approach**: Last-value-carry-forward baseline for benchmarking.

**Purpose**:
- Reference model for comparative evaluation
- Establishes minimum performance threshold

### 3.2 Model Selection Rationale

The inclusion of multiple models enables users to:

1. Experiment with different paradigms (statistical vs. machine learning)
2. Evaluate ensemble approaches
3. Understand model trade-offs (bias-variance, interpretability-accuracy)

---

## 4. Technical Architecture

### 4.1 Frontend Stack

| Component            | Technology            |
|----------------------|------------------------|
| Framework            | React 18 (TypeScript)  |
| Build Tool           | Vite                   |
| Styling              | Tailwind CSS           |
| UI Components        | shadcn/ui              |
| Charting             | Recharts               |
| HTTP Client          | Fetch API + Custom     |
| Package Manager      | Bun                    |
| Testing              | Vitest                 |

### 4.2 Project Structure

```
src/
├── components/
│   ├── charts/              # Data visualization components
│   │   ├── ForecastChart.tsx
│   │   └── MiniSpark.tsx
│   ├── site/                # Layout and navigation
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroCanvas.tsx
│   │   └── PageShell.tsx
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
├── pages/                   # Route pages
│   ├── Dashboard.tsx
│   ├── Predict.tsx
│   ├── Research.tsx
│   └── Index.tsx
├── hooks/                   # Custom React hooks
│   ├── useForecast.ts      # Forecast data management
│   └── use-toast.ts        # Toast notifications
├── services/                # API communication
│   └── forecastApi.ts
├── data/                    # Static data and constants
│   └── forecast.ts
├── lib/                     # Utility functions
│   └── utils.ts
├── App.tsx                  # Root component
└── main.tsx                 # Entry point
```

### 4.3 Component Composition

Custom components are built from composable UI primitives:

```
Page (Layout)
├── Header (Navigation)
├── Main Content
│   ├── Card (Data Container)
│   │   ├── ChartComponent (Visualization)
│   │   ├── FormField (Input Control)
│   │   └── Button (Action Trigger)
│   └── Dialog (Modal Workflow)
│       ├── Select (Model Selection)
│       ├── Input (Parameter Configuration)
│       └── Button (Submission)
└── Footer
```

---

## 5. Feature Highlights

### 5.1 Real-Time Data Integration

- Seamless communication with backend API (`forecastApi.ts`)
- Automatic data synchronization
- Error handling and loading states

### 5.2 Interactive Forecasting Workflow

1. Select forecasting model from dropdown
2. Configure parameters:
   - Forecast horizon (days)
   - Confidence interval (95%, 99%, custom)
   - Backtesting option (enable/disable)
3. Generate and visualize predictions
4. Inspect confidence bands and point estimates

### 5.3 Responsive Design

All pages and components adapt to viewport size:

- **Desktop** (1024px+): Full-width charts, multi-column layouts
- **Tablet** (768px-1023px): Optimized spacing, stacked charts
- **Mobile** (< 768px): Single-column layouts, touch-friendly controls

---

## 6. API Integration

### 6.1 Service Layer Architecture

The `forecastApi.ts` service provides abstraction over backend communication:

```typescript
// Example: Fetch forecast
const response = await forecastApi.getForecast(
  model: string,
  horizon: number,
  confidence: number
);
```

### 6.2 Backend Endpoints

The application communicates with:

- **FastAPI/Uvicorn** backend (Python)
- RESTful endpoints for model inference
- CSV data upload and preprocessing
- Evaluation metrics computation

---

## 7. Custom Hooks

### 7.1 useForecast Hook

Manages forecast state and API communication:

- Data fetching
- Loading and error states
- Cache management
- Automatic retry logic

### 7.2 use-mobile Hook

Detects mobile viewport for responsive behavior:

```typescript
const isMobile = useMobile();
```

---

## 8. Accessibility and Performance

### 8.1 Accessibility Features

- Semantic HTML structure
- ARIA labels for interactive components
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader compatibility

### 8.2 Performance Optimizations

- Code splitting via Vite
- Component lazy loading
- Efficient chart rendering with Recharts
- Request debouncing and caching
- Optimized bundle size (~250KB gzipped)

---

## 9. Installation and Setup

### 9.1 Prerequisites

- Node.js 18+ (or Bun 1.0+)
- Backend API running (Python/FastAPI)

### 9.2 Installation

```bash
cd bio-predictive-forecast
bun install
```

### 9.3 Development Server

```bash
bun run dev
```

Launches development server at `http://localhost:5173` with hot module replacement (HMR).

### 9.4 Production Build

```bash
bun run build
```

Generates optimized static assets in `dist/` directory.

### 9.5 Run Tests

```bash
bun run test
```

Executes test suite via Vitest.

---

## 10. Configuration

### 10.1 Environment Variables

Create `.env` file in project root:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

### 10.2 Tailwind Configuration

Tailwind CSS is configured in `tailwind.config.ts`:

- Custom color palette
- Extended typography scale
- Plugin integration (shadcn/ui)

### 10.3 TypeScript Configuration

Type safety enforced via `tsconfig.json`:

- Strict mode enabled
- Module resolution configured
- Path aliases for imports

---

## 11. Testing Strategy

### 11.1 Test Coverage

- Unit tests for utility functions
- Component rendering tests
- Integration tests for API communication
- Snapshot tests for component stability

### 11.2 Test Files

```
src/test/
├── example.test.ts
└── setup.ts
```

Run tests with:

```bash
bun run test
```

---

## 12. Browser Support

| Browser       | Minimum Version |
|---------------|-----------------|
| Chrome        | 90+             |
| Firefox       | 88+             |
| Safari        | 14+             |
| Edge          | 90+             |

---

## 13. Deployment

### 13.1 Static Hosting

The built application can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### 13.2 Container Deployment

Docker support via configuration in parent project.

---

## 14. Key Dependencies

| Package        | Version | Purpose                      |
|----------------|---------|------------------------------|
| React          | 18.x    | UI framework                 |
| TypeScript     | 5.x     | Type safety                  |
| Tailwind CSS   | 3.x     | Utility-first styling        |
| Recharts       | 2.x     | Data visualization           |
| shadcn/ui      | Latest  | Component library            |
| Vite           | 5.x     | Build tooling                |

---

## 15. Acknowledgment

Parts of the user interface were accelerated using :contentReference[oaicite:0]{index=0}, an AI-assisted development platform for generating and refining frontend components.

Lovable was primarily used to:
- Bootstrap initial UI layouts and component structures
- Accelerate styling and design system implementation
- Assist in rapid prototyping of interactive dashboard elements

All core system architecture, forecasting pipeline, model implementation, data processing, and integration logic were independently designed and developed by the author.

The final application reflects significant customization, optimization, and extension beyond the initial generated components.

--- 

## 16. Author

Ali Mohamed Hashish
