@echo off
echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: GitHub push failed!
    pause
    exit /b 1
)

echo.
echo Pushing to GitLab...
git push gitlab main
if errorlevel 1 (
    echo ERROR: GitLab push failed!
    pause
    exit /b 1
)

echo.
echo SUCCESS! Pushed to both GitHub and GitLab!
pause
