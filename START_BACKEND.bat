@echo off
REM Start FastAPI Backend Server
echo Starting Bitcoin Forecasting API Backend...
echo.
echo Port: 8000
echo API Docs: http://localhost:8000/docs
echo Health Check: http://localhost:8000/health
echo.
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
