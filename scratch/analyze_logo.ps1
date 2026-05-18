Add-Type -AssemblyName System.Drawing
$logoPath = Resolve-Path "public/images/logo.png"
$bmp = [System.Drawing.Bitmap]::FromFile($logoPath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 10) { # Threshold for non-transparency
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$bmp.Dispose()

$contentWidth = $maxX - $minX + 1
$contentHeight = $maxY - $minY + 1

Write-Output "Bounding Box of content:"
Write-Output "Left (minX): $minX"
Write-Output "Right (maxX): $maxX"
Write-Output "Top (minY): $minY"
Write-Output "Bottom (maxY): $maxY"
Write-Output "Content Width: $contentWidth"
Write-Output "Content Height: $contentHeight"
Write-Output "Canvas Width: $($bmp.Width)"
Write-Output "Canvas Height: $($bmp.Height)"
