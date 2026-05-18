Add-Type -AssemblyName System.Drawing
$logoPath = Resolve-Path "public/images/logo.png"
$img = [System.Drawing.Image]::FromFile($logoPath)
Write-Output "Width: $($img.Width)"
Write-Output "Height: $($img.Height)"
$img.Dispose()
