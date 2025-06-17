@echo off
echo 🚀 Starting Minimal ConversaAI...
echo.

echo Starting backend...
start cmd /k "cd backend && npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers should be starting!
echo 📱 Frontend: http://localhost:5173
echo 🖥️  Backend: http://localhost:3001
echo.
echo Press any key to close this window...
pause >nul