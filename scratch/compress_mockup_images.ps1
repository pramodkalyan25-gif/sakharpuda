Add-Type -AssemblyName System.Drawing

function Save-AsOptimizedJpeg($bmp, $outputPath, $quality) {
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $bmp.Save($outputPath, $jpegCodec, $encoderParams)
}

function Resize-Bitmap($srcBmp, $newWidth, $newHeight) {
    $newBmp = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $newWidth, $newHeight)
    $g.DrawImage($srcBmp, $destRect, 0, 0, $srcBmp.Width, $srcBmp.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    return $newBmp
}

$dir = Resolve-Path "public/images/exclusive"
$images = @(
    "Gemini_Generated_Image_e9s2bwe9s2bwe9s2.png",
    "Gemini_Generated_Image_vs0bnvs0bnvs0bnv.png",
    "Gemini_Generated_Image_yyl2ylyyl2ylyyl2.png"
)

foreach ($imgName in $images) {
    $inPath = Join-Path $dir $imgName
    $outPath = Join-Path $dir ($imgName.Replace(".png", ".jpg"))
    
    Write-Output "Optimizing $imgName..."
    $img = [System.Drawing.Image]::FromFile($inPath)
    
    $newWidth = 400
    $newHeight = [Math]::Round(400 * ($img.Height / $img.Width))
    
    Write-Output "Resizing $imgName from $($img.Width)x$($img.Height) to $($newWidth)x$($newHeight)..."
    $resized = Resize-Bitmap $img $newWidth $newHeight
    
    Save-AsOptimizedJpeg $resized $outPath 75
    
    $resized.Dispose()
    $img.Dispose()
    
    Write-Output "Saved optimized image to: $($imgName.Replace('.png', '.jpg'))"
    Write-Output "------------------------"
}

Write-Output "Optimization Complete!"
