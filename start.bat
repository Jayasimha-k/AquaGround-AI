@echo off
cd /d "%~dp0"
echo =============================================================================
echo               AquaGround AI — National Command Center Launcher
echo =============================================================================
echo.
echo [1/2] Launching dev server and binding telemetry nodes...
echo [2/2] Launching spatiotemporal browser viewport...
echo.
npm run dev -- --open
