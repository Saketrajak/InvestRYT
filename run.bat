@echo off
echo ========================================
echo  Investryt AI - Starting Project
echo ========================================
echo.

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Install backend dependencies if needed
echo [1/4] Installing backend dependencies...
cd /d "%~dp0backend"
if not exist "node_modules" (
    call npm install
) else (
    echo       Already installed.
)

:: Install frontend dependencies if needed
echo [2/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install
) else (
    echo       Already installed.
)

echo [3/4] Starting backend server (port 5000)...
cd /d "%~dp0backend"
start "Investryt Backend" cmd /c "npm run dev"

:: Wait for backend to initialize
timeout /t 3 /nobreak >nul

echo [4/4] Starting frontend dev server (port 3000)...
cd /d "%~dp0frontend"
start "Investryt Frontend" cmd /c "npm run dev"

echo.
echo ========================================
echo  Both servers are starting up.
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo ========================================
echo.
echo  Close this window to stop both servers.
echo  (Or close each server window individually)
echo.
pause
