Add-Type -AssemblyName System.Drawing
$dir = Resolve-Path "public"
Get-ChildItem -Path $dir -Recurse -Include *.png, *.jpg, *.jpeg, *.webp, *.gif, *.svg | Where-Object { $_.FullName -notmatch '\\unused\\' } | ForEach-Object {
    $sizeKB = [Math]::Round($_.Length / 1024, 2)
    $relPath = $_.FullName.Substring($_.FullName.IndexOf('public'))
    Write-Output "Image: $($_.Name)"
    Write-Output "Size: $sizeKB KB"
    Write-Output "Path: $relPath"
    Write-Output "------------------------"
}
