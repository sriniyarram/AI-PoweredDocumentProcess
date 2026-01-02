@echo off
REM AI Document Processor - Automated Setup and Run Script
REM This script will install Python and run the server automatically

echo.
echo ======================================
echo AI Document Processor - Setup
echo ======================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [!] Python is not installed or not in PATH
    echo.
    echo Please choose an option:
    echo.
    echo 1. Install Python (requires administrator)
    echo 2. Install Node.js instead
    echo 3. Manual installation instructions
    echo.
    echo Option 1: Python Installation
    echo Start - Open Microsoft Store and search for "Python 3.11"
    echo Then install it and restart this script.
    echo.
    echo Option 2: Node.js Installation
    echo Download from https://nodejs.org/ (LTS version)
    echo Then restart this script.
    echo.
    echo Option 3: View detailed instructions
    echo Open: INSTALL_GUIDE.md
    echo.
    pause
    exit /b
)

echo [✓] Python is installed
python --version

echo.
echo [✓] Starting API Server...
echo.
echo ======================================
echo Server Starting...
echo ======================================
echo.
echo Navigate to: http://localhost:3000/app.html
echo.
echo Health Check: http://localhost:3000/api/health
echo.
echo Press Ctrl+C to stop the server
echo ======================================
echo.

cd /d C:\Work\AI-PoweredDocumentProcess
python server.py

pause
