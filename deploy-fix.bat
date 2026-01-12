@echo off
REM Fix pour le problème de self-match
echo.
echo Deploiement du correctif self-match...
echo.

curl -T "api/match/search.php" -u "u639530603:1b^6kf$#g=I7pzZU" ftp://92.113.28.141/domains/safemates.fr/public_html/api/match/ --progress-bar

echo.
echo Deploiement termine!
echo.
