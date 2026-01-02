@echo off
REM Simple Python HTTP Server for AI Document Processor
REM This starts the web application

echo ========================================
echo AI Document Processor - Application
echo ========================================
echo.
echo Starting the application...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Installing mock server...
    goto start_mock
)

REM Start Python server
python server.py
goto end

:start_mock
echo.
echo ========================================
echo Mock Server Not Available
echo ========================================
echo.
echo Prerequisites:
echo - Python 3.7+ (for running the server)
echo - Node.js 16+ with npm (for React development)
echo.
echo To get started:
echo 1. Install Python from https://www.python.org/downloads/
echo 2. Install Node.js from https://nodejs.org/
echo.
echo Then run this script again.
echo.
echo Alternatively, you can open the HTML version directly:
echo Open 'app.html' in your browser (requires server running)
echo.
pause

:end
