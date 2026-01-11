@echo off
REM ====================================================
REM Upload manuel des fichiers critiques via FTP
REM Pour forcer la mise à jour sur Hostinger
REM ====================================================

echo.
echo ========================================
echo   UPLOAD MANUEL FICHIERS CRITIQUES
echo ========================================
echo.

REM Vérifier si WinSCP est installé
set WINSCP="C:\Program Files (x86)\WinSCP\WinSCP.com"

if not exist %WINSCP% (
    echo ERREUR: WinSCP n'est pas installé !
    echo.
    echo Vous avez 2 options:
    echo.
    echo 1. Installer WinSCP: https://winscp.net/eng/download.php
    echo 2. Utiliser FileZilla pour uploader manuellement:
    echo    - dashboard.html
    echo    - game.html
    echo    - .htaccess
    echo.
    pause
    exit /b 1
)

echo INSTRUCTIONS:
echo.
echo 1. Connectez-vous via FTP a Hostinger
echo 2. Allez dans le dossier /public_html
echo 3. Uploadez ces fichiers:
echo    - dashboard.html
echo    - game.html
echo    - login.html
echo    - signup.html
echo    - contact.html
echo    - moderation.html
echo    - index.html
echo    - profile.html
echo    - .htaccess
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

echo.
echo Veuillez entrer vos identifiants FTP Hostinger:
echo.
set /p FTP_HOST="Hote FTP (ex: ftp.safemates.fr): "
set /p FTP_USER="Utilisateur FTP: "
set /p FTP_PASS="Mot de passe FTP: "

echo.
echo Création du script WinSCP...

REM Créer un script WinSCP temporaire
echo open ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST% > %TEMP%\winscp_upload.txt
echo lcd "%~dp0" >> %TEMP%\winscp_upload.txt
echo cd /public_html >> %TEMP%\winscp_upload.txt
echo put dashboard.html >> %TEMP%\winscp_upload.txt
echo put game.html >> %TEMP%\winscp_upload.txt
echo put login.html >> %TEMP%\winscp_upload.txt
echo put signup.html >> %TEMP%\winscp_upload.txt
echo put contact.html >> %TEMP%\winscp_upload.txt
echo put moderation.html >> %TEMP%\winscp_upload.txt
echo put index.html >> %TEMP%\winscp_upload.txt
echo put profile.html >> %TEMP%\winscp_upload.txt
echo put .htaccess >> %TEMP%\winscp_upload.txt
echo exit >> %TEMP%\winscp_upload.txt

echo Upload des fichiers...
%WINSCP% /script=%TEMP%\winscp_upload.txt

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   UPLOAD TERMINE AVEC SUCCES !
    echo ========================================
    echo.
    echo Testez maintenant: https://safemates.fr
    echo En mode incognito: Ctrl + Shift + N
) else (
    echo.
    echo [ERREUR] L'upload a echoue !
    echo Verifiez vos identifiants FTP.
)

del %TEMP%\winscp_upload.txt
pause
