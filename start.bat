@echo off
cd /d "%~dp0"
echo =============================================================================
echo               AquaGround AI — National Command Center Launcher
echo =============================================================================
echo.
echo [1/2] Launching Python FastAPI Backend Server on Port 8000...
start "AquaGround AI Backend Service" cmd /k "%~dp0start_backend.bat"

echo [2/2] Launching React Dashboard Viewport on Port 5173...
echo.
call npm run dev -- --open
