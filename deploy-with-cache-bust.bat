@echo off
REM ====================================================
REM AUTO-DEPLOY avec Cache Busting automatique
REM Met à jour les versions de cache avant de pusher
REM ====================================================

echo.
echo ========================================
echo   AUTO-DEPLOY + CACHE BUSTING
echo ========================================
echo.

REM 1. Mettre à jour les versions de cache
echo [1/4] Mise a jour des versions de cache...
node update-cache-version.js

if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Echec de la mise a jour du cache !
    pause
    exit /b 1
)

REM 2. Ajouter tous les fichiers modifies
echo [2/4] Ajout des fichiers modifies...
git add .

REM 3. Verifier s'il y a des changements
git diff-index --quiet HEAD
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Aucun changement detecte.
    timeout /t 2 >nul
    exit /b 0
)

REM 4. Creer un commit avec timestamp
echo [3/4] Creation du commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%

git commit -m "Auto-deploy with cache bust: %timestamp%"

REM 5. Push vers GitHub/Hostinger
echo [4/4] Push vers Hostinger...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   DEPLOIEMENT REUSSI !
    echo   Cache force a se recharger
    echo   Hostinger deploiera dans 30-60 sec
    echo ========================================
) else (
    echo.
    echo [ERREUR] Echec du push !
    pause
)

echo.
timeout /t 2 >nul
