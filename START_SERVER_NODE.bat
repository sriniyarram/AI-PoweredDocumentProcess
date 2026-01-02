@echo off
REM AI Document Processor - Node.js Setup and Run Script

echo.
echo ======================================
echo AI Document Processor - Node.js Setup
echo ======================================
echo.

REM Check if Node is available
node --version >nul 2>&1
if errorlevel 1 (
    echo [!] Node.js is not installed
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose LTS version (recommended)
    echo.
    echo Then restart this script.
    echo.
    pause
    exit /b
)

echo [✓] Node.js is installed
node --version
npm --version

echo.
echo [✓] Starting API Server...
echo.
echo ======================================
echo Server Starting...
echo ======================================
echo.
echo Navigate to: http://localhost:8080/app.html
echo.
echo Health Check: http://localhost:8080/api/health
echo.
echo Press Ctrl+C to stop the server
echo ======================================
echo.

cd /d C:\Work\AI-PoweredDocumentProcess
node server-simple.js

pause
