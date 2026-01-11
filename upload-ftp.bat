@echo off
REM ====================================================
REM Script d'upload FTP automatique vers Hostinger
REM Nécessite WinSCP installé
REM ====================================================

echo.
echo ========================================
echo   UPLOAD FTP AUTOMATIQUE HOSTINGER
echo ========================================
echo.

REM Chemin vers WinSCP (ajustez si nécessaire)
set WINSCP="C:\Program Files (x86)\WinSCP\WinSCP.com"

REM Vérifier si WinSCP est installé
if not exist %WINSCP% (
    echo ERREUR: WinSCP n'est pas installé !
    echo Téléchargez-le sur: https://winscp.net/
    pause
    exit /b 1
)

echo Création du script WinSCP temporaire...

REM Créer un script WinSCP temporaire
echo open ftp://VOTRE_USER:VOTRE_PASSWORD@ftp.votredomaine.com > %TEMP%\winscp_script.txt
echo lcd "%~dp0" >> %TEMP%\winscp_script.txt
echo cd /public_html >> %TEMP%\winscp_script.txt
echo synchronize remote -delete -criteria=time >> %TEMP%\winscp_script.txt
echo exit >> %TEMP%\winscp_script.txt

echo Upload des fichiers vers Hostinger...
%WINSCP% /script=%TEMP%\winscp_script.txt

if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo   UPLOAD TERMINE AVEC SUCCES !
    echo ========================================
) else (
    echo.
    echo ERREUR lors de l'upload !
)

del %TEMP%\winscp_script.txt
pause
