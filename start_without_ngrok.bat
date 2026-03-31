@echo off
title Service Starter (Local Mode)

echo [0/1] Checking environment...
if not exist "%~dp0client\node_modules" goto :MISSING_SETUP
if not exist "%~dp0server\node_modules" goto :MISSING_SETUP
if not exist "%~dp0client\dist" if not exist "%~dp0client\build" goto :MISSING_SETUP

echo [1/1] Starting Backend Server...
cd /d "%~dp0server"

echo Server is running on http://localhost:3001
echo Press Ctrl+C to stop the server.
node index.js

if %ERRORLEVEL% neq 0 goto :START_FAILED
pause
exit /b

:MISSING_SETUP
echo.
echo ERROR: Environment not ready!
echo Missing node_modules or frontend build files.
echo Please run "setup.bat" first.
pause
exit /b

:START_FAILED
echo.
echo ERROR: Failed to start the Node.js server.
echo Please check if "index.js" exists or if port 3001 is occupied.
pause
exit /b