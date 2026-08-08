@echo off
cd /d "%~dp0"
echo =============================================================================
echo               AquaGround AI — National Command Center Launcher
echo =============================================================================
echo.
echo [1/2] Starting Python FastAPI Backend Server (Port 8000)...
start "AquaGround AI Backend Service" cmd /k "start_backend.bat"

echo [2/2] Starting Frontend Viewport (Port 5173)...
npm run dev -- --open


