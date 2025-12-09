# Fermer toutes les instances de Chrome existantes pour un test propre
Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Minimiser toutes les fenêtres
$shell = New-Object -ComObject "Shell.Application"
$shell.minimizeall()
Start-Sleep -Seconds 1

# Ouvrir Chrome en plein écran
Start-Process chrome -ArgumentList "http://localhost:3000/dashboard","--start-maximized","--new-window"

# Attendre que Chrome démarre et que la page se charge
Start-Sleep -Seconds 8

# Prendre une capture d'écran
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)

$savePath = "c:\Users\enzoj\.claude-worktrees\MatchMates1.0-main\dreamy-stonebraker\dashboard_final.png"
$bitmap.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Capture enregistree : $savePath"
