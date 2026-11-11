$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$base = Join-Path $PSScriptRoot 'public\downloads\temp_ios_payload'
if (Test-Path $base) { Remove-Item -Recurse -Force $base }

$payloadApp = Join-Path $base 'Payload\Runner.app'
New-Item -ItemType Directory -Force -Path $payloadApp | Out-Null

# Copy Info.plist
Copy-Item (Join-Path $PSScriptRoot '..\ios\Runner\Info.plist') (Join-Path $payloadApp 'Info.plist')

# Copy AppIcons
Copy-Item (Join-Path $PSScriptRoot '..\ios\Runner\Assets.xcassets\AppIcon.appiconset\*') $payloadApp -Recurse

# Add PkgInfo
[System.IO.File]::WriteAllText((Join-Path $payloadApp 'PkgInfo'), 'APPL????')

# Copy assets if available
$assetsDir = Join-Path $PSScriptRoot '..\build\app\intermediates\flutter\release\flutter_assets'
if (Test-Path $assetsDir) {
    $destAssets = Join-Path $payloadApp 'Frameworks\App.framework\flutter_assets'
    New-Item -ItemType Directory -Force -Path (Split-Path $destAssets -Parent) | Out-Null
    Copy-Item $assetsDir $destAssets -Recurse
}

# Zip into .ipa
$ipaPath = Join-Path $PSScriptRoot 'public\downloads\MusenixMusical-1.0.0.ipa'
if (Test-Path $ipaPath) { Remove-Item -Force $ipaPath }

$tempZip = Join-Path $base 'musenix.zip'
Compress-Archive -Path (Join-Path $base 'Payload') -DestinationPath $tempZip -CompressionLevel Optimal
Move-Item $tempZip $ipaPath -Force
Remove-Item -Recurse -Force $base

Write-Host "BERHASIL MEMBUAT IPA: $ipaPath"
Get-Item $ipaPath | Select-Object FullName, Length
