Add-Type -AssemblyName System.Drawing
$dir = Resolve-Path "public/images/exclusive"
Get-ChildItem "$dir\*.png" | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    Write-Output "Image Name: $($_.Name)"
    Write-Output "Size: $([Math]::Round($_.Length / 1024, 2)) KB"
    Write-Output "Dimensions: $($img.Width) x $($img.Height)"
    Write-Output "------------------------"
    $img.Dispose()
}
