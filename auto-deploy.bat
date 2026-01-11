@echo off
REM ====================================================
REM AUTO-DEPLOY RAPIDE - Push automatique vers Hostinger
REM Usage: Lancez ce script apres chaque modification
REM ====================================================

echo.
echo [AUTO-DEPLOY] Synchronisation en cours...
echo.

REM Ajouter tous les fichiers modifies
git add . >nul 2>&1

REM Verifier s'il y a des changements
git diff-index --quiet HEAD
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Aucun changement detecte.
    timeout /t 2 >nul
    exit /b 0
)

REM Creer un commit automatique avec timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%

git commit -m "Auto-deploy: Update %timestamp%" >nul 2>&1

REM Push vers GitHub/Hostinger
echo [PUSH] Envoi vers GitHub et Hostinger...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   DEPLOIEMENT REUSSI !
    echo   Hostinger deploiera dans 30-60 sec
    echo ========================================
) else (
    echo.
    echo [ERREUR] Echec du push !
    pause
)

echo.
timeout /t 2 >nul
