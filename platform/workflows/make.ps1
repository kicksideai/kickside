# Windows wrapper for the repository Make interface.
# Keep this file ASCII for Windows PowerShell 5.1.
[CmdletBinding()]
param(
    [Parameter(Position = 0)] [string]$Target = 'help',
    [Parameter(ValueFromRemainingArguments)] [string[]]$ExtraArgs = @()
)

$ErrorActionPreference = 'Stop'
$rootScript = (Resolve-Path (Join-Path $PSScriptRoot '..\..\make.ps1')).Path
Write-Host "==> delegate workflows $Target" -ForegroundColor Cyan

switch ($Target) {
    'build' { & $rootScript 'build' 'workflows' @ExtraArgs; break }
    'dev' { & $rootScript 'watch' 'workflows' @ExtraArgs; break }
    'watch' { & $rootScript 'watch' 'workflows' @ExtraArgs; break }
    'help' { & $rootScript 'help'; break }
    '-h' { & $rootScript 'help'; break }
    '--help' { & $rootScript 'help'; break }
    default { Write-Host "Unsupported workflows Windows target: $Target" -ForegroundColor Red; exit 1 }
}
exit $LASTEXITCODE
