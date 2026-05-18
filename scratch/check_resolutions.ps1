Add-Type -AssemblyName System.Drawing
$heroPath = Resolve-Path "public/images/hero-bg-final.png"
$bannerPath = Resolve-Path "public/images/exclusive-banner-new.png"

$heroImg = [System.Drawing.Image]::FromFile($heroPath)
$bannerImg = [System.Drawing.Image]::FromFile($bannerPath)

Write-Output "Hero Image dimensions: $($heroImg.Width) x $($heroImg.Height)"
Write-Output "Banner Image dimensions: $($bannerImg.Width) x $($bannerImg.Height)"

$heroImg.Dispose()
$bannerImg.Dispose()
