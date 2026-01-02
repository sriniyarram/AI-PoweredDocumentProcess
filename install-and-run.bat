@echo off
REM AI Document Processor - Dependency Installer
REM This script helps install required dependencies

echo.
echo ======================================================================
echo  AI Document Processor - Automatic Dependency Installer
echo ======================================================================
echo.

REM Check if Python is installed
echo Checking for Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [NOT FOUND] Python is not installed or not in PATH
    goto install_python
) else (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo [FOUND] %PYTHON_VERSION%
    goto start_python
)

:install_python
echo.
echo Installing Python...
echo.
echo Opening Python download page in browser...
start https://www.python.org/downloads/
echo.
echo IMPORTANT: When installing Python:
echo   1. Download Python 3.9 or higher
echo   2. During installation, CHECK "Add Python to PATH"
echo   3. Click "Install Now"
echo.
echo After installation, close and rerun this script.
echo.
pause
exit /b

:start_python
echo.
echo Python is ready! Starting the server...
echo.
cd /d C:\Work\AI-PoweredDocumentProcess
python server.py
goto end

:end
pause
