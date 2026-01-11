@echo off
REM ====================================================
REM Script FTP simple pour Hostinger
REM ====================================================

echo.
echo ========================================
echo   UPLOAD FTP VERS HOSTINGER
echo ========================================
echo.

REM Créer le script FTP
(
echo open 92.113.28.141
echo u639530603
echo 1b^^6kf$#g=I7pzZU
echo cd domains/safemates.fr/public_html
echo binary
echo put deploy-simple.php
echo put dashboard.html
echo put game.html
echo dir
echo bye
) > ftp_script.txt

echo [INFO] Connexion FTP en cours...
echo.

ftp -n -s:ftp_script.txt

del ftp_script.txt

echo.
echo ========================================
echo   UPLOAD TERMINE !
echo ========================================
echo.

pause
