@echo off
cd /d "%~dp0\backend"
echo =============================================================================
echo               AquaGround AI — FastAPI Backend Service Launcher
echo =============================================================================
echo.

if not exist venv (
    echo [1/3] Creating python virtual environment...
    python -m venv venv
)

echo [2/3] Activating virtual environment and verifying dependencies...
call venv\Scripts\activate
pip install -r requirements.txt --quiet

echo [3/3] Launching FastAPI service on port 8000...
echo.
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
