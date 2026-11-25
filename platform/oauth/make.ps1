[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('test', 'lint', 'lockrefresh')]
    [string]$Target = 'test',
    [Parameter(ValueFromRemainingArguments)]
    [string[]]$ExtraArgs = @()
)
$ErrorActionPreference = 'Stop'
$wippy = if ($env:WIPPY_BIN) { $env:WIPPY_BIN } else { 'wippy' }
$command = if ($Target -eq 'lockrefresh') { 'update' } else { $Target }
$arguments = @($command) + $ExtraArgs
if ($Target -eq 'lint') {
    $arguments += @('--ns', 'app', '--ns', 'app.*', '--ns', 'kickside.oauth', '--ns', 'kickside.oauth.*')
}
if ($Target -eq 'test' -and $env:WIPPY_TEST_PORT) {
    $arguments += @('--set', "vars.http_port=$($env:WIPPY_TEST_PORT)")
}
$testRoot = Join-Path $PSScriptRoot 'test'
if ($Target -eq 'test') {
    & node --test (Join-Path $testRoot 'oauth_callback_page_test.mjs')
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
$sourceLink = Join-Path $testRoot 'src_link'
$placeholder = $null
Push-Location $testRoot
try {
    # Git can check out a directory symlink as its small target-path file.
    $link = Get-Item -LiteralPath $sourceLink
    if (-not $link.PSIsContainer) {
        $placeholder = [IO.File]::ReadAllBytes($sourceLink)
        $linkTarget = [Text.Encoding]::UTF8.GetString($placeholder).Trim()
        if ($linkTarget -cne '../src') { throw 'Unexpected test/src_link placeholder' }
        Remove-Item -LiteralPath $sourceLink
        New-Item -ItemType Junction -Path $sourceLink -Target (Join-Path $PSScriptRoot 'src') | Out-Null
    }
    $ErrorActionPreference = 'Continue'
    $output = @(& $wippy @arguments 2>&1)
    $status = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    $text = $output -join [Environment]::NewLine
    Write-Output $text
    if ($status -ne 0) { exit $status }
    if ($Target -eq 'test' -and ($text -cmatch 'FAILED|No tests found' -or
        $text -cnotmatch 'PASSED' -or $text -notmatch '[1-9][0-9]* tests')) { exit 1 }
} finally {
    if ($null -ne $placeholder) {
        if (Test-Path -LiteralPath $sourceLink -PathType Container) {
            [IO.Directory]::Delete($sourceLink)
        }
        [IO.File]::WriteAllBytes($sourceLink, $placeholder)
    }
    Pop-Location
}
