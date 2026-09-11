$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$shortRoot = 'C:\mapp'
$shortRootParent = Split-Path -Parent $shortRoot

if (-not (Test-Path $shortRootParent)) {
    New-Item -ItemType Directory -Path $shortRootParent -Force | Out-Null
}

if (Test-Path $shortRoot) {
    $item = Get-Item $shortRoot
    if ($item.LinkType -eq 'Junction' -or $item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        Remove-Item $shortRoot -Force
    } else {
        Write-Error "Target path $shortRoot exists and is not a junction. Please remove it manually."
        exit 1
    }
}

New-Item -ItemType Junction -Path $shortRoot -Target $projectRoot -Force | Out-Null
Set-Location "$shortRoot\android"
& "$shortRoot\android\gradlew.bat" assembleRelease

exit $LASTEXITCODE
