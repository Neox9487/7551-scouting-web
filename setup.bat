@echo off
title Server Setup - Test Mode
echo [0/2] Checking tools...

where node || (echo Node missing & pause & exit /b)
where npm || (echo npm missing & pause & exit /b)
where ngrok || (echo ngrok missing & pause & exit /b)

echo Found Node.js, npm, and ngrok. Proceeding...
echo.

echo [1/2] Compiling Frontend Web Application...
cd /d "%~dp0client" || (echo Client folder not found! & pause & exit /b)

if not exist "node_modules" (
    echo Installing client-side npm packages...
    call npm install
)

echo Building production files...
call npm run build

echo.
echo [2/2] Setting up Backend Server...
cd /d "%~dp0server" || (echo Server folder not found! & pause & exit /b)

echo Installing server-side npm packages...
call npm install

echo.
echo Setup Complete! 
pause