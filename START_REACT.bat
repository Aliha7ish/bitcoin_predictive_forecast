@echo off
REM Start React Frontend
cd bio-predictive-forecast

if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)

echo Starting React Frontend...
echo.
echo URL: http://localhost:5173
echo.
call npm run dev
