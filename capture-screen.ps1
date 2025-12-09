# Ouvrir Chrome en mode maximisé sur le dashboard
Start-Process chrome -ArgumentList "http://localhost:3000/dashboard" -WindowStyle Maximized

# Attendre que la page se charge complètement
Start-Sleep -Seconds 6

# Prendre une capture d'écran
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)

$savePath = "c:\Users\enzoj\.claude-worktrees\MatchMates1.0-main\dreamy-stonebraker\dashboard_screenshot.png"
$bitmap.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Capture enregistree : $savePath"
