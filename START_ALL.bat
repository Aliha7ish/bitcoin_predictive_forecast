@echo off
REM Bitcoin Forecasting Platform - Quick Start Script
REM This script launches all three components: Backend, React, and Streamlit

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   Bitcoin Forecasting Platform - Quick Start                   ║
echo ║   Starting all services...                                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Get the directory of this script
set SCRIPT_DIR=%~dp0

echo [1/3] Starting FastAPI Backend Server...
echo      Command: python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
start cmd /k python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000

echo.
timeout /t 3

echo [2/3] Starting React Frontend...
echo      Directory: bio-predictive-forecast
echo      Command: npm run dev

REM Check if node_modules exists, if not run npm install
if not exist "%SCRIPT_DIR%bio-predictive-forecast\node_modules" (
    echo Installing npm dependencies first...
    cd "%SCRIPT_DIR%bio-predictive-forecast"
    call npm install
    cd "%SCRIPT_DIR%"
)

start cmd /k "cd bio-predictive-forecast && npm run dev"

echo.
timeout /t 2

echo [3/3] Starting Streamlit App...
echo      Command: streamlit run app.py
start cmd /k streamlit run app.py

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   Services Starting!                                           ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║   Backend API:        http://localhost:8000                    ║
echo ║   API Docs:           http://localhost:8000/docs               ║
echo ║   React Frontend:     http://localhost:5173                    ║
echo ║   Streamlit:          http://localhost:8501                    ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║   NOTE: It may take a few seconds for services to start        ║
echo ║   Close any window to stop that service                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
pause
