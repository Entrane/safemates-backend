@echo off
REM ====================================================
REM Déploiement API vers Hostinger via FTP
REM ====================================================

echo.
echo ========================================
echo   DEPLOIEMENT API HOSTINGER
echo ========================================
echo.

REM Upload des fichiers API modifiés
echo Upload des fichiers API...
echo.

curl -T "api/login.php" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/api/ --progress-bar
curl -T "api/signup.php" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/api/ --progress-bar
curl -T "api/heartbeat.php" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/api/ --progress-bar
curl -T "api/match/search.php" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/api/match/ --progress-bar

echo.
echo Upload des pages HTML...
echo.

curl -T "dashboard.html" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar
curl -T "game.html" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/ --progress-bar

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE !
echo   Filtrage en ligne active
echo ========================================
echo.

timeout /t 3
