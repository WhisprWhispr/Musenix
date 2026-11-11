$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$csc = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$csFile = Join-Path $PSScriptRoot 'MusenixLauncher.cs'
$icon = Join-Path $root 'windows\runner\resources\app_icon.ico'
$tempDir = Join-Path $PSScriptRoot 'temp_windows_build'
$destZip = Join-Path $PSScriptRoot 'public\downloads\MusenixMusical-1.0.0-windows.zip'

if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

$appDir = Join-Path $tempDir 'app'
New-Item -ItemType Directory -Force -Path $appDir | Out-Null

# 1. Copy compiled Flutter Web application bundle to app/
$webBuildDir = Join-Path $root 'build\web'
if (Test-Path $webBuildDir) {
    Copy-Item "$webBuildDir\*" $appDir -Recurse -Force
    Write-Host "Disalin Flutter Web bundle ke $appDir"
}

# 2. Compile native Windows executable with official Musenix icon
$outExe = Join-Path $tempDir 'MusenixMusical.exe'
& $csc /target:winexe /win32icon:$icon /out:$outExe $csFile

if (-not (Test-Path $outExe)) {
    throw "Gagal mengompilasi MusenixMusical.exe"
}
Write-Host "Berhasil mengompilasi: $outExe"

# 3. Create Desktop shortcut installer script: Install-Shortcut.bat
$batContent = @"
@echo off
title MUSENIX Musical Desktop Setup
echo ============================================================
echo   Membuat Pintasan Desktop MUSENIX Musical Pro
echo ============================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "`$ws = New-Object -ComObject WScript.Shell; `$s = `$ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'MUSENIX Musical.lnk')); `$s.TargetPath = [System.IO.Path]::Combine('`%~dp0', 'MusenixMusical.exe'); `$s.WorkingDirectory = '`%~dp0'; `$s.IconLocation = [System.IO.Path]::Combine('`%~dp0', 'MusenixMusical.exe'); `$s.Save()"
echo [OK] Pintasan berhasil dibuat di Desktop Anda!
echo.
echo Menjalankan MUSENIX Musical...
start "" "%~dp0MusenixMusical.exe"
"@
Set-Content -Path (Join-Path $tempDir 'Install-Shortcut.bat') -Value $batContent

# 4. Create README.txt
$readmeContent = @"
============================================================
 MUSENIX MUSICAL DESKTOP v1.0.0 (Windows 10 / 11)
============================================================

Panduan Menjalankan:
1. Klik ganda 'MusenixMusical.exe' untuk langsung menikmati musik.
2. (Opsional) Klik ganda 'Install-Shortcut.bat' untuk membuat pintasan MUSENIX di Desktop Windows Anda secara otomatis.

Fitur Unggulan:
- Kualitas Audio Master HD 320kbps & FLAC Lossless
- Lirik Berjalan Sinkron Realtime (Spotify-grade)
- Mode Karaoke Sing-Along (Vokal Diredam)
- Equalizer Pro & Bass Booster
- Tanpa Iklan Audio Pengganggu
============================================================
"@
Set-Content -Path (Join-Path $tempDir 'README.txt') -Value $readmeContent

# 5. Compress into MusenixMusical-1.0.0-windows.zip
if (Test-Path $destZip) { Remove-Item -Force $destZip }
Write-Host "Mengompresi ke $destZip ..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $destZip -CompressionLevel Optimal

# Cleanup temp folder
Remove-Item -Recurse -Force $tempDir

Write-Host "SELESAI MEMBUAT WINDOWS PACKAGE:"
Get-Item $destZip | Select-Object FullName, Length, LastWriteTime

