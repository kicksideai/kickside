# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
# Windows wrapper for the repository Make interface.
# Keep this file ASCII for Windows PowerShell 5.1.
[CmdletBinding()]
param(
    [Parameter(Position = 0)] [string]$Target = 'help',
    [Parameter(ValueFromRemainingArguments)] [string[]]$ExtraArgs = @()
)

$ErrorActionPreference = 'Stop'
$rootScript = (Resolve-Path (Join-Path $PSScriptRoot '..\..\make.ps1')).Path
Write-Host "==> delegate agents $Target" -ForegroundColor Cyan

function Invoke-BackendMake {
    $bash = 'C:/Progra~1/Git/bin/bash.exe'
    if (-not (Test-Path -LiteralPath $bash -PathType Leaf)) { throw 'Install Git for Windows to run the Makefile shell recipes.' }
    $make = (Get-Command make.exe -ErrorAction Stop).Source
    $env:PATH = 'C:/Progra~1/Git/usr/bin;C:/Progra~1/Git/bin;' + $env:PATH
    if ($env:WIPPY_BIN) {
        $wippyPath = (Resolve-Path -LiteralPath $env:WIPPY_BIN -ErrorAction Stop).Path
        $env:PATH = (Split-Path -Parent $wippyPath) + ';' + $env:PATH
    }
    & $make -C $PSScriptRoot "SHELL=$bash" $Target @ExtraArgs
}

switch ($Target) {
    'build' { & $rootScript 'build' 'agents' @ExtraArgs; break }
    'dev' { & $rootScript 'watch' 'agents' @ExtraArgs; break }
    'watch' { & $rootScript 'watch' 'agents' @ExtraArgs; break }
    'test' { Invoke-BackendMake; break }
    'lint' { Invoke-BackendMake; break }
    'lockrefresh' { Invoke-BackendMake; break }
    'help' { & $rootScript 'help'; break }
    '-h' { & $rootScript 'help'; break }
    '--help' { & $rootScript 'help'; break }
    default { Write-Host "Unsupported agents Windows target: $Target" -ForegroundColor Red; exit 1 }
}
exit $LASTEXITCODE
