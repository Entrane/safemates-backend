@echo off
REM ====================================================
REM Script d'upload FTP automatique vers Hostinger
REM ====================================================

echo.
echo ========================================
echo   UPLOAD FTP VERS HOSTINGER
echo ========================================
echo.

REM Créer le fichier de commandes FTP
echo open 92.113.28.141 21> ftp_commands.txt
echo u639530603>> ftp_commands.txt
echo 1b^6kf$#g=I7pzZU>> ftp_commands.txt
echo cd public_html>> ftp_commands.txt
echo binary>> ftp_commands.txt
echo put deploy-simple.php>> ftp_commands.txt
echo put dashboard.html>> ftp_commands.txt
echo put game.html>> ftp_commands.txt
echo bye>> ftp_commands.txt

echo [UPLOAD] Connexion a Hostinger FTP...
ftp -s:ftp_commands.txt

REM Nettoyer le fichier temporaire
del ftp_commands.txt

echo.
echo ========================================
echo   UPLOAD TERMINE !
echo   Fichiers uploades:
echo   - deploy-simple.php
echo   - dashboard.html
echo   - game.html
echo ========================================
echo.

pause
