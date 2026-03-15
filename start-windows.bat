@echo off
echo.
echo  AgriAssist - AI Smart Farming Assistant
echo  ----------------------------------------
echo.
echo  Starting Backend on http://localhost:5000
echo  Starting Frontend on http://localhost:3000
echo.
echo  Demo Login: rajesh@farm.com / farmer123
echo.

:: Start Backend
start "AgriAssist Backend" cmd /k "cd backend && npm install && node server.js"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Start Frontend
start "AgriAssist Frontend" cmd /k "cd frontend && npm install && npm start"

echo  Both servers starting. Browser will open automatically.
pause
