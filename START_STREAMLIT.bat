@echo off
REM Start Streamlit App
echo Starting Streamlit App...
echo.
echo Make sure the FastAPI backend is running at http://localhost:8000
echo.
echo Streamlit URL: http://localhost:8501
echo.
streamlit run app.py
