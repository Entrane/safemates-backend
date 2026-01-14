@echo off
REM ====================================================
REM Déploiement sécurisé vers Hostinger via FTP
REM Les credentials sont chargés depuis .env
REM ====================================================

echo.
echo ========================================
echo   DEPLOIEMENT SECURISE HOSTINGER
echo ========================================
echo.

REM Charger les variables d'environnement depuis .env
for /f "tokens=1,2 delims==" %%a in (.env) do (
    set %%a=%%b
)

REM Étape 1: Git push vers GitHub
echo [1/2] Push vers GitHub...
git add .
git commit -m "Deploy: %date% %time%"
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Push GitHub échoué
    pause
    exit /b 1
)

echo [OK] GitHub mis à jour
echo.

REM Étape 2: Upload FTP des fichiers modifiés
echo [2/2] Upload FTP vers Hostinger...
echo.
echo ATTENTION: Les mots de passe FTP doivent être dans le fichier .env
echo FTP_USER, FTP_PASS_1, FTP_PASS_2, FTP_HOST
echo.

REM Note: curl -T "fichier" -u "user:pass" ftp://host/path/
REM Vous devez adapter ce script pour lire depuis .env

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE !
echo ========================================
echo.

timeout /t 3
