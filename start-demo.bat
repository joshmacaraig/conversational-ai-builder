@echo off
echo 🚀 Starting Conversational AI Builder...
echo.

echo 📡 Starting Backend Server...
start "Backend" cmd /k "cd /d C:\Users\Admin\OneDrive\Documents\GitHub\conversational-ai-builder\backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 🌐 Starting Frontend Server...
start "Frontend" cmd /k "cd /d C:\Users\Admin\OneDrive\Documents\GitHub\conversational-ai-builder\frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo 🌍 Opening Browser...
start http://localhost:5173

echo.
echo ✅ Conversational AI Builder is starting up!
echo 📋 Two terminal windows should open automatically
echo 🌐 Browser will open to http://localhost:5173
echo.
echo 🎯 Ready for your demo in 10-15 seconds!
pause
