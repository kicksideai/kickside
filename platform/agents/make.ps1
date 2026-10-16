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

switch ($Target) {
    'build' { & $rootScript 'build' 'agents' @ExtraArgs; break }
    'dev' { & $rootScript 'watch' 'agents' @ExtraArgs; break }
    'watch' { & $rootScript 'watch' 'agents' @ExtraArgs; break }
    'help' { & $rootScript 'help'; break }
    '-h' { & $rootScript 'help'; break }
    '--help' { & $rootScript 'help'; break }
    default { Write-Host "Unsupported agents Windows target: $Target" -ForegroundColor Red; exit 1 }
}
exit $LASTEXITCODE
