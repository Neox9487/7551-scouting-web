@echo off
setlocal
title System Starter
set PORT=3001

:MENU
cls
echo ==========================================
echo  1. Start Local Mode  (Localhost only)
echo  2. Start Test Mode   (With ngrok tunnel)
echo  3. Run Setup Only    (Install/Build)
echo  4. Exit
echo ==========================================
set /p choice="Please enter your choice (1-4): "

if "%choice%"=="1" goto :START_LOCAL
if "%choice%"=="2" goto :START_NGROK
if "%choice%"=="3" goto :CHECK_ENV
if "%choice%"=="4" exit
goto :MENU

:CHECK_ENV
echo.
echo [1/2] Validating Frontend...
cd /d "%~dp0client"
if not exist "node_modules" (echo Installing client-side packages... & call npm install)
if not exist "build" if not exist "dist" (echo Building frontend... & call npm run build)

echo.
echo [2/2] Validating Backend...
cd /d "%~dp0server"
if not exist "node_modules" (echo Installing server-side packages... & call npm install)

if "%choice%"=="3" (
    echo.
    echo Setup Complete!
    pause
    goto :MENU
)
goto :RUN_SERVER

:START_LOCAL
set MODE=LOCAL
goto :CHECK_ENV

:START_NGROK
set MODE=NGROK
goto :CHECK_ENV

:RUN_SERVER
cls
echo  System is running in [%MODE%] mode
cd /d "%~dp0server"

if "%MODE%"=="LOCAL" (
    echo Server: http://localhost:%PORT%
    echo Press Ctrl+C to stop.
    node index.js
) else (
    echo Starting Backend in background...
    start /b "Backend" node index.js
    timeout /t 3 >nul
    echo Launching ngrok tunnel...
    ngrok http %PORT%
)

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Something went wrong! 
    echo Check if port %PORT% is already in use.
    pause
)
goto :MENU