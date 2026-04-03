@echo off

:CHECK_PERMISSIONS
echo [INFO] Checking administrative privileges...
net session >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [SUCCESS] Running with administrative privileges.
) else (
    echo [INFO] Insufficient privileges. Requesting Administrator access...
    ::idk what is this
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

setlocal enabledelayedexpansion
title System Control Panel
set PORT=3001

:CHECK_NODE
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed.
    pause
    exit
)

:MENU
cls
echo  1. Start Local Mode     (Localhost)
echo  2. Start Global Mode    (Ngrok)
echo  3. Run System Setup     (Install/Build)
echo  4. Update Match Data    (Fetch from TBA)
echo  5. Exit
set /p choice="Please enter your choice (1-5): "

if "%choice%"=="1" goto :SET_LOCAL
if "%choice%"=="2" goto :CHECK_NGROK
if "%choice%"=="3" goto :CHECK_DEPENDENCIES
if "%choice%"=="4" goto :FETCH_MATCHES
if "%choice%"=="5" exit
goto :MENU

:FETCH_MATCHES
cls
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    goto :MENU
)

echo [INFO] Checking/Installing Python dependencies...
python -m pip install --upgrade pip >nul
python -m pip install requests >nul

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    goto :MENU
)

set /p TARGET_EVENT="Enter TBA Event Key (e.g., 2026tuis): "
if "%TARGET_EVENT%"=="" (
    echo Event Key cannot be empty.
    pause
    goto :MENU
)

set /p TARGET_KEY="Enter TBA Auth Key: "
if "%TARGET_KEY%"=="" (
    echo Auth Key cannot be empty.
    pause
    goto :MENU
)

echo.
echo [INFO] Connecting to The Blue Alliance...
cd /d "%~dp0server"
python matches_fetcher.py %TARGET_EVENT% %TARGET_KEY%

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] matches.json has been updated for %TARGET_EVENT%.
) else (
    echo.
    echo [ERROR] Failed to fetch data. 
    echo Check your Key: %TARGET_KEY:~0,5%... (Hidden)
    echo Check your Event: %TARGET_EVENT%
)
pause
goto :MENU

:SET_LOCAL
set MODE=LOCAL
goto :DB_CONFIG

:CHECK_NGROK
echo Checking for ngrok...
ngrok -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Ngrok not found.
    pause
    goto :MENU
)
set MODE=NGROK
goto :DB_CONFIG

:DB_CONFIG
echo.
set /p DB_USER="Enter MySQL Username (default: root): "
if "%DB_USER%"=="" set DB_USER=root
set /p DB_PASSWORD="Enter MySQL Password: "
goto :CHECK_DEPENDENCIES

:CHECK_DEPENDENCIES
cls
echo [1/2] Validating Frontend...
cd /d "%~dp0client"
if not exist "node_modules" call npm install
call npm run build

echo [2/2] Validating Backend...
cd /d "%~dp0server"
if not exist "node_modules" call npm install

if "%choice%"=="3" (
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
    echo [INFO] URL: http://localhost:%PORT%
    node index.js
) else (
    start /b "FRC_Backend" node index.js
    timeout /t 3 >nul
    ngrok http %PORT%
)
goto :MENU