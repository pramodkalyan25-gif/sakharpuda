Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "public/images/logo.png"
$backupPath = Join-Path (Split-Path $srcPath) "logo_backup.png"

# Back up the original logo
if (-not (Test-Path $backupPath)) {
    Copy-Item $srcPath $backupPath
    Write-Output "Backed up original logo to logo_backup.png"
}

# Load the source image
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Bounding box coordinates found in analysis
$minX = 229
$maxX = 746
$minY = 175
$maxY = 654

$contentWidth = $maxX - $minX + 1
$contentHeight = $maxY - $minY + 1

# New square canvas dimensions (512x512 is standard for favicons/apple-touch-icons)
$canvasSize = 512

# We want the content width to fill 82% of the canvas width
$targetWidth = [Math]::Round($canvasSize * 0.82)
$scaleRatio = $targetWidth / $contentWidth
$targetHeight = [Math]::Round($contentHeight * $scaleRatio)

# Create a new blank bitmap with transparent background
$dstBmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize)
$g = [System.Drawing.Graphics]::FromImage($dstBmp)

# Set high-quality rendering options
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Center the cropped content on the new canvas
$destX = ($canvasSize - $targetWidth) / 2
$destY = ($canvasSize - $targetHeight) / 2

$destRect = New-Object System.Drawing.RectangleF($destX, $destY, $targetWidth, $targetHeight)
$srcRect = New-Object System.Drawing.RectangleF($minX, $minY, $contentWidth, $contentHeight)

# Draw cropped logo onto new canvas
$g.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

# Clean up
$g.Dispose()
$srcBmp.Dispose()

# Save the new cropped logo (overwriting the original)
$dstBmp.Save($srcPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dstBmp.Dispose()

Write-Output "Successfully cropped and optimized logo.png!"
Write-Output "New dimensions: 512x512 pixels"
Write-Output "Logo content width is now scaled to fill 82% of the canvas with a safe circular crop margin."
