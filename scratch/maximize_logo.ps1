Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "public/images/logo.png"
$backupPath = "public/images/unused/logo_backup.png"

# Load the backup image to get the clean original if possible, otherwise use the current one
if (Test-Path $backupPath) {
    $img = [System.Drawing.Bitmap]::FromFile($backupPath)
    Write-Output "Using original backup logo from $backupPath"
} else {
    $img = [System.Drawing.Bitmap]::FromFile($srcPath)
    Write-Output "Using current logo from $srcPath"
}

# Dynamically find the non-transparent bounding box
$minX = $img.Width
$maxX = 0
$minY = $img.Height
$maxY = 0

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $pixel = $img.GetPixel($x, $y)
        if ($pixel.A -gt 5) { # Threshold for non-transparency
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$contentWidth = $maxX - $minX + 1
$contentHeight = $maxY - $minY + 1

Write-Output "Detected bounding box: Left=$minX, Right=$maxX, Top=$minY, Bottom=$maxY"
Write-Output "Content dimensions: Width=$contentWidth, Height=$contentHeight"

# Make the crop area a perfect square centered on the content
$size = [Math]::Max($contentWidth, $contentHeight)
$centerX = $minX + ($contentWidth / 2)
$centerY = $minY + ($contentHeight / 2)

$cropX = [Math]::Round($centerX - ($size / 2))
$cropY = [Math]::Round($centerY - ($size / 2))

# Ensure crop coordinates are within image boundaries
if ($cropX -lt 0) { $cropX = 0 }
if ($cropY -lt 0) { $cropY = 0 }
if (($cropX + $size) -gt $img.Width) { $size = $img.Width - $cropX }
if (($cropY + $size) -gt $img.Height) { $size = $img.Height - $cropY }

Write-Output "Square crop area: X=$cropX, Y=$cropY, Size=$size"

# Target canvas size: 512x512
$canvasSize = 512
$dstBmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize)
$g = [System.Drawing.Graphics]::FromImage($dstBmp)

# Set highest quality rendering
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Clear with transparency
$g.Clear([System.Drawing.Color]::Transparent)

# Draw the cropped area to fill 100% of the canvas
$destRect = New-Object System.Drawing.RectangleF(0, 0, $canvasSize, $canvasSize)
$srcRect = New-Object System.Drawing.RectangleF($cropX, $cropY, $size, $size)

$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

# Clean up
$g.Dispose()
$img.Dispose()

# Overwrite logo.png
$dstBmp.Save($srcPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dstBmp.Dispose()

Write-Output "Successfully updated logo.png to fill 100% of the canvas!"
