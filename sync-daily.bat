@echo off
echo ========================================
echo TradeDecode Daily Sync
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Fetching from GitLab...
git fetch gitlab

echo.
echo [2/3] Pulling new content from GitLab...
git pull gitlab main

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to pull from GitLab
    pause
    exit /b 1
)

echo.
echo [3/3] Pushing to GitHub...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to push to GitHub
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Sync completed.
echo ========================================
echo.
echo Netlify will deploy automatically in 1-2 minutes.
echo.
pause
