# ====================================================
# Script PowerShell pour upload FTP vers Hostinger
# ====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   UPLOAD FTP VERS HOSTINGER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration FTP
$ftpServer = "ftp://92.113.28.141"
$ftpUsername = "u639530603"
$ftpPassword = "1b^6kf`$#g=I7pzZU"
$ftpPath = "public_html"

# Fichiers à uploader
$filesToUpload = @(
    "deploy-simple.php",
    "dashboard.html",
    "game.html"
)

# Fonction d'upload FTP
function Upload-FTP {
    param (
        [string]$LocalFile,
        [string]$RemotePath
    )

    try {
        $fileName = Split-Path $LocalFile -Leaf
        $ftpUri = "$ftpServer/$RemotePath/$fileName"

        Write-Host "[UPLOAD] $fileName..." -ForegroundColor Yellow

        # Créer la requête FTP
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.UseBinary = $true
        $ftpRequest.KeepAlive = $false

        # Lire le fichier local
        $fileContent = [System.IO.File]::ReadAllBytes($LocalFile)
        $ftpRequest.ContentLength = $fileContent.Length

        # Upload
        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()

        # Vérifier la réponse
        $response = $ftpRequest.GetResponse()
        Write-Host "   [OK] $($response.StatusDescription)" -ForegroundColor Green
        $response.Close()

        return $true
    }
    catch {
        Write-Host "   [ERREUR] $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Upload de chaque fichier
$successCount = 0
$failCount = 0

foreach ($file in $filesToUpload) {
    $localPath = Join-Path $PSScriptRoot $file

    if (Test-Path $localPath) {
        if (Upload-FTP -LocalFile $localPath -RemotePath $ftpPath) {
            $successCount++
        } else {
            $failCount++
        }
    } else {
        Write-Host "[SKIP] $file (fichier introuvable)" -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   UPLOAD TERMINE !" -ForegroundColor Green
Write-Host "   Reussis: $successCount | Echecs: $failCount" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tester le script de déploiement
Write-Host "[TEST] Verification du deploiement..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://safemates.fr/deploy-simple.php?password=SafeMates2024Deploy" -UseBasicParsing -TimeoutSec 30
    Write-Host "[OK] Script de deploiement accessible !" -ForegroundColor Green
}
catch {
    Write-Host "[INFO] Le script sera accessible dans quelques secondes" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
