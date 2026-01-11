@echo off
REM ====================================================
REM QUICK PUSH - Version ultra-rapide sans message
REM Double-clic sur ce fichier pour push instantane
REM ====================================================

git add . && git commit -m "Quick update" && git push origin main

if %ERRORLEVEL% EQU 0 (
    echo ✓ Push reussi !
) else (
    echo ✗ Erreur !
    pause
)

timeout /t 2 >nul
