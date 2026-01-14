@echo off
REM ====================================================
REM Déploiement direct vers Hostinger via FTP
REM ====================================================

echo.
echo ========================================
echo   DEPLOIEMENT DIRECT HOSTINGER
echo ========================================
echo.

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

curl -T "dashboard.html" -u "u639530603:En70freva=" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "game.html" -u "u639530603:En70freva=" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "index.html" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "login.html" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "signup.html" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "profile.html" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "contact.html" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "style.css" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "style-enhanced.css" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "components.css" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "animations.js" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T ".htaccess" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE !
echo   Ton site est maintenant a jour
echo ========================================
echo.

timeout /t 3
