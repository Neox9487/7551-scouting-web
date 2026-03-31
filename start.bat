@echo off
title Service Starter

echo [0/2] Checking environment...
if not exist "%~dp0client\node_modules" goto :MISSING_SETUP
if not exist "%~dp0server\node_modules" goto :MISSING_SETUP
if not exist "%~dp0client\build" if not exist "%~dp0client\dist" goto :MISSING_SETUP

echo [1/2] Starting Backend Server...
cd /d "%~dp0server"
start /b "Backend" node index.js
if %ERRORLEVEL% neq 0 goto :START_FAILED

timeout /t 3 >nul

echo [2/2] Starting ngrok Tunnel...
echo INFO: Press Ctrl+C to stop both ngrok and Server.

ngrok http 3001
if %ERRORLEVEL% neq 0 goto :NGROK_FAILED

exit /b

:MISSING_SETUP
echo.
echo ERROR: Environment not ready!
echo Missing node_modules or frontend build files.
echo Please run "setup.bat" first to install dependencies.
pause
exit /b

:START_FAILED
echo.
echo ERROR: Failed to start the Node.js server.
echo Please check if "index.js" exists or if port 3001 is occupied.
pause
exit /b

:NGROK_FAILED
echo.
echo ERROR: ngrok failed to launch.
echo Make sure ngrok is installed and configured in your PATH.
pause
exit /b