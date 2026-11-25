# Windows adapter for this module's Makefile test target.
[CmdletBinding()]
param(
    [Parameter(Position = 0)] [string]$Target = 'test',
    [Parameter(ValueFromRemainingArguments)] [string[]]$TestArgs = @()
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

try {
    if ($Target -ne 'test') { throw 'This adapter supports make.bat test [Wippy test arguments].' }
    $wippy = if ($env:WIPPY_BIN) { $env:WIPPY_BIN } else { 'wippy' }
    $port = if ($env:WIPPY_TEST_PORT) { $env:WIPPY_TEST_PORT } else { '19110' }
    if ($port -notmatch '^\d{1,5}$' -or [int]$port -lt 1 -or [int]$port -gt 65535) {
        throw 'WIPPY_TEST_PORT must be a port from 1 to 65535'
    }

    # Mirror test/prepare.sh without requiring Bash on Windows.
    $subjects = @{
        'src/api/list_nav.lua' = 'nav_subject.lua'
        'src/registry_nav_provider.lua' = 'registry_provider_subject.lua'
        'src/contributions.lua' = 'contributions_subject.lua'
        'src/shell_discovery.lua' = 'discovery_subject.lua'
    }
    foreach ($source in $subjects.Keys) {
        $destination = Join-Path 'test/suites' $subjects[$source]
        Copy-Item -LiteralPath $source -Destination $destination -Force -ErrorAction Stop
        if ((Get-FileHash -LiteralPath $source).Hash -ne (Get-FileHash -LiteralPath $destination).Hash) {
            throw "Harness subject copy did not match $source"
        }
    }

    Push-Location 'test'
    try {
        & $wippy test --set "vars.http_port=$port" @TestArgs 2>&1 | Tee-Object -Variable output
        $status = $LASTEXITCODE
        $text = $output -join "`n"
        if ($status -ne 0 -or $text -match 'FAILED|No tests found' -or
            $text -notmatch 'PASSED' -or $text -notmatch '[1-9][0-9]* tests') {
            throw "Wippy test did not report a passing suite (exit $status)"
        }
    }
    finally { Pop-Location }
}
catch {
    Write-Error $_ -ErrorAction Continue
    exit 1
}
