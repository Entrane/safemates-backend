@echo off
REM ====================================================
REM Script de déploiement rapide pour MatchMates
REM ====================================================

echo.
echo ========================================
echo   DEPLOIEMENT MATCHMATES
echo ========================================
echo.

REM 1. Git add
echo [1/4] Ajout des fichiers modifies...
git add .

REM 2. Git commit
echo [2/4] Creation du commit...
set /p commit_msg="Message de commit: "
git commit -m "%commit_msg%"

REM 3. Git push
echo [3/4] Push vers GitHub...
git push origin main

REM 4. Railway deploy
echo [4/4] Deploiement sur Railway...
railway up

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE !
echo ========================================
echo.
pause
