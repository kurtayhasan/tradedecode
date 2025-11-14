@echo off
echo ========================================
echo TradeDecode Content Generator
echo ========================================
echo.

REM Check if HF_API_KEY is set
if "%HF_API_KEY%"=="" (
    echo ERROR: HF_API_KEY environment variable is not set!
    echo.
    echo Please set it first:
    echo set HF_API_KEY=your_key_here
    echo.
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Generating new content...
call npm run bot
if errorlevel 1 (
    echo ERROR: Content generation failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Committing changes...
git add .
git commit -m "Auto content update - %date% %time%"
if errorlevel 1 (
    echo No changes to commit or commit failed
)

echo.
echo [4/4] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Content generated and pushed!
echo ========================================
echo.
echo Netlify will automatically deploy your site.
echo Check: https://tradedecode.com
echo.
pause
