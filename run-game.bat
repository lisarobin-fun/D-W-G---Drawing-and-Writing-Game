@echo off
setlocal
cd /d "%~dp0"

echo Starting Denan's Stylus Adventure...
where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo npm was not found. Please install Node.js LTS first:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

start "" http://localhost:3000
npm start
