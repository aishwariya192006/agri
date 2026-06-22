@echo off
echo Starting AgriMate Project...

start "TF Model Service" cmd /k "cd /d "c:\Users\midhu\Downloads\agri june 20" && tf_env\Scripts\python.exe predict_service.py"

timeout /t 3 /nobreak >nul

start "Backend Server" cmd /k "cd /d "c:\Users\midhu\Downloads\agri june 20\agri\agrimate\backend" && npm run dev"

timeout /t 3 /nobreak >nul

start "Frontend Dev Server" cmd /k "cd /d "c:\Users\midhu\Downloads\agri june 20\agri\agrimate" && npm run dev"

echo All services started!
echo.
echo TF Model  -^> http://localhost:5050
echo Backend   -^> http://localhost:5001
echo Frontend  -^> http://localhost:5174
echo.
pause
