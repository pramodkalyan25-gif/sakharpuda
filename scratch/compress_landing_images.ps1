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

# --- 1. HERO BACKGROUND OPTIMIZATION ---
Write-Output "Optimizing Hero Background..."
$heroPath = Resolve-Path "public/images/hero-bg-final.png"
$heroImg = [System.Drawing.Image]::FromFile($heroPath)

$newHeroWidth = 1920
$newHeroHeight = [Math]::Round(1920 * ($heroImg.Height / $heroImg.Width))

Write-Output "Resizing Hero from $($heroImg.Width)x$($heroImg.Height) to $($newHeroWidth)x$($newHeroHeight)..."
$resizedHero = Resize-Bitmap $heroImg $newHeroWidth $newHeroHeight

$heroOutPath = Join-Path (Split-Path $heroPath) "hero-bg-final.jpg"
Save-AsOptimizedJpeg $resizedHero $heroOutPath 75

$resizedHero.Dispose()
$heroImg.Dispose()
Write-Output "Saved optimized hero to: hero-bg-final.jpg"

# --- 2. EXCLUSIVE BANNER OPTIMIZATION ---
Write-Output "Optimizing Exclusive Banner..."
$bannerPath = Resolve-Path "public/images/exclusive-banner-new.png"
$bannerImg = [System.Drawing.Image]::FromFile($bannerPath)

$newBannerWidth = 1200
$newBannerHeight = [Math]::Round(1200 * ($bannerImg.Height / $bannerImg.Width))

Write-Output "Resizing Banner from $($bannerImg.Width)x$($bannerImg.Height) to $($newBannerWidth)x$($newBannerHeight)..."
$resizedBanner = Resize-Bitmap $bannerImg $newBannerWidth $newBannerHeight

$bannerOutPath = Join-Path (Split-Path $bannerPath) "exclusive-banner-new.jpg"
Save-AsOptimizedJpeg $resizedBanner $bannerOutPath 75

$resizedBanner.Dispose()
$bannerImg.Dispose()
Write-Output "Saved optimized banner to: exclusive-banner-new.jpg"

Write-Output "Optimization Complete!"
