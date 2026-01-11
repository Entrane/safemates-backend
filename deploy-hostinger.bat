@echo off
REM ====================================================
REM Script de déploiement AUTOMATIQUE sur Hostinger via Git
REM ====================================================

echo.
echo ========================================
echo   DEPLOIEMENT HOSTINGER (GIT)
echo ========================================
echo.

REM 1. Git add
echo [1/3] Ajout des fichiers modifies...
git add .

REM 2. Git commit
echo [2/3] Creation du commit...
set /p commit_msg="Message de commit: "
if "%commit_msg%"=="" set commit_msg="Update files"
git commit -m "%commit_msg%"

REM 3. Git push vers GitHub et Hostinger
echo [3/3] Push vers GitHub et Hostinger...
git push origin main

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE !
echo   Les fichiers sont sur GitHub.
echo   Hostinger va auto-deployer dans 1-2 min.
echo ========================================
echo.
echo Consultez le panneau Hostinger pour voir le statut.
pause
