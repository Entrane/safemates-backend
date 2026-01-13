@echo off
echo ==========================================
echo    ENVOI VERS GITHUB ET HOSTINGER
echo ==========================================
echo.
echo 1. Preparation des fichiers (git add)...
git add .
echo.
echo 2. Enregistrement (git commit)...
git commit -m "Mise a jour automatique et deploiement"
echo.
echo 3. Envoi vers GitHub (git push)...
git push origin main
echo.
echo ==========================================
echo    TERMINE ! VERIFIE TON SITE DANS 2 MIN
echo ==========================================
pause