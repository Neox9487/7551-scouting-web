@echo off
setlocal enabledelayedexpansion
title FRC Scouting System Launcher
set PORT=3001

node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] ERROR: Node.js is not installed.
    echo Please install it from https://nodejs.org/
    pause
    exit
)
echo [OK] Node.js is installed.

call npm -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] ERROR: NPM is not installed. 
    echo Usually, this comes with Node.js. Check your installation.
    pause
    exit
)
echo [OK] NPM is installed.

ngrok -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    set NGROK_AVAILABLE=FALSE
    echo [!] WARNING: Ngrok is not installed. Global Mode will not work.
) else (
    set NGROK_AVAILABLE=TRUE
    echo [OK] Ngrok is installed.
)

:DB_CONFIG
set /p DB_USER="Enter MySQL Username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASSWORD="Enter MySQL Password (leave blank if none): "

:MENU
cls
echo  1. Start Local Mode    (Localhost only)
echo  2. Start Global Mode   (With ngrok tunnel)
echo  3. Run Setup Only      (Install Dependencies/Build)
echo  4. Exit
set /p choice="Please enter your choice (1-4): "

if "%choice%"=="1" goto :SET_LOCAL
if "%choice%"=="2" goto :SET_NGROK
if "%choice%"=="3" goto :CHECK_ENV
if "%choice%"=="4" exit

exit

:SET_LOCAL
set MODE=LOCAL
goto :CHECK_ENV

:SET_NGROK
set MODE=NGROK
goto :CHECK_ENV

:CHECK_ENV
cls
echo [1/2] Validating Frontend...
cd /d "%~dp0client"
if not exist "node_modules" (
    echo Installing client-side packages...
    call npm install
)
echo Building frontend distribution...
call npm run build

echo.
echo [2/2] Validating Backend...
cd /d "%~dp0server"
echo Installing server-side packages...
call npm install

if "%choice%"=="3" (
    echo.
    echo Setup Complete!
    pause
    goto :MENU
)
goto :RUN_SERVER

:RUN_SERVER
cls
echo SYSTEM RUNNING IN [%MODE%] MODE
cd /d "%~dp0server"

set DB_USER=%DB_USER%
set DB_PASSWORD=%DB_PASSWORD%
set DB_HOST=localhost

if "%MODE%"=="LOCAL" (
    echo Server URL: http://localhost:%PORT%
    echo Press Ctrl+C twice to stop the server.
    echo.
    node index.js
) else (
    echo Starting Backend in background...
    start /b "FRC_Backend" node index.js
    timeout /t 3 >nul
    echo Launching ngrok tunnel...
    echo.
    ngrok http %PORT%
)

if %ERRORLEVEL% equ 1 (
    echo.
    echo ERROR 1: DATABASE CONNECTION FAILED
    echo Possible causes:
    echo 1. Incorrect MySQL username or password.
    echo 2. MySQL service is not running (check XAMPP/Services).
    echo.
    pause
)

if %ERRORLEVEL% equ 2 (
    echo.
    echo ERROR 2: SERVER STARTUP FAILED
    echo Possible causes:
    echo 1. Port %PORT% is already being used by another app.
    echo 2. Missing dependencies (Run 'npm install' in server folder).
    echo.
    pause
)

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: An unexpected error occurred (Code: %ERRORLEVEL%).
    echo Please check the console log above for details.
    pause
)