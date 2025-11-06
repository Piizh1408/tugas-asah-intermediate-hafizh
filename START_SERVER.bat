@echo off
echo ========================================
echo   STARTING STORYMAP APPLICATION
echo ========================================
echo.
echo Building application...
call npm run build
echo.
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo Starting HTTP server...
echo.
echo IMPORTANT: Keep this window open!
echo.
echo Open browser and go to:
echo   http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.
call npm run serve
pause

