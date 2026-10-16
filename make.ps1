# Windows FE build driver for kickside web-component / page modules.
# There is no `make` on Windows here, so this mirrors the per-module Makefile
# recipes (cd <ui> && npm ... && npm run build) with cross-platform-safe
# install/cleaninstall/typecheck targets.
#
# Invoke through make.bat (`make build inbox`) or directly:
#   powershell -ExecutionPolicy Bypass -File make.ps1 <target> [module]
#
# Pure ASCII on purpose: Windows PowerShell 5.1 reads BOM-less files as
# Windows-1252, so any non-ASCII char corrupts on read. Keep it ASCII.
[CmdletBinding()]
param(
    [Parameter(Position = 0)] [string]$Target = 'help',
    [Parameter(Position = 1)] [string]$Module = '',
    [Parameter(ValueFromRemainingArguments)] [string[]]$ExtraArgs = @()
)

# Modules that import @kickside/ui-kit. Their install/build/test materializes the
# package first: it is not in the repo and not on any npm registry, so without it
# the build fails on ENOENT for the import. Add a module here when it adopts.
$UiKitConsumers = @('app-main', 'agents', 'automation', 'channel', 'connection', 'hub', 'inbox', 'knowledge',
    'mcp', 'models', 'renderers', 'security', 'sessions', 'settings', 'skills', 'transform', 'ui', 'uploads',
    'users', 'webhooks', 'widgets', 'workflows')

# These modules typecheck source imported from platform/widgets/ui via the
# @widgets path alias. TypeScript resolves that source's bare imports from the
# widgets package directory, so its local dependencies must exist first.
$WidgetSourceConsumers = @('agents', 'automation', 'channel', 'connection', 'hub', 'identity', 'inbox', 'knowledge',
    'mcp', 'models', 'settings', 'skills', 'sync', 'transform', 'ui', 'uploads', 'users', 'webhooks', 'workflows')

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# Resolve a module name to its FE package dir and Make-owned build output.
function Resolve-Module {
    param([Parameter(Mandatory)][string]$Name)
    if ($Name -eq 'app-main' -or $Name -eq 'app') {
        return @{ dir = 'app/frontend/applications/main'; buildArgs = @('--', '--outDir', '../../../static/app/main', '--emptyOutDir') }
    }

    if ($Name -eq 'plugin-template') {
        return @{ dir = 'app/templates/plugin/ui'; buildArgs = @() }
    }
    if ($Name -eq 'workflows') {
        return @{ dir = 'platform/workflows/ui'; buildArgs = @('--', '--outDir', '../static', '--emptyOutDir') }
    }
    if ($Name -eq 'agents') {
        return @{ dir = 'platform/agents/ui'; buildArgs = @('--', '--outDir', '../static', '--emptyOutDir') }
    }
    $p = "platform/$Name/ui"
    if (Test-Path (Join-Path $PSScriptRoot "$p/package.json")) {
        return @{ dir = $p; buildArgs = @() }
    }
    throw "Unknown module: $Name. Run 'make help' for the list."
}

# Every FE package in the repo (page app + all WC modules), discovered so the
# list never drifts from the tree.
function Get-AllModules {
    $mods = @('app-main', 'plugin-template')
    Get-ChildItem -Path (Join-Path $PSScriptRoot 'platform') -Directory | ForEach-Object {
        if (Test-Path (Join-Path $_.FullName 'ui/package.json')) { $mods += $_.Name }
    }
    return $mods
}

function Invoke-In {
    param([Parameter(Mandatory)][string]$Dir, [Parameter(Mandatory)][scriptblock]$Body)
    Push-Location (Join-Path $PSScriptRoot $Dir)
    try { & $Body } finally { Pop-Location }
}

# install: reproducible install from the committed lockfile (the CI path).
function Do-Install {
    param([Parameter(Mandatory)][string]$Name)
    if ($UiKitConsumers -contains $Name) { Do-UiKit $Name }
    $m = Resolve-Module $Name
    Write-Host "==> install $($m.dir)" -ForegroundColor Cyan
    Invoke-In $m.dir {
        npm ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "npm ci failed in $($m.dir) (exit $LASTEXITCODE)" }
    }
}

# cleaninstall: wipe node_modules AND package-lock.json, then npm install.
# Removing the lockfile is what makes it clean: a lock generated on another
# platform (or before a @wippy-fe/* bump) can omit this platform's optional
# deps (e.g. @rollup/rollup-win32-x64-msvc, npm/cli#4828) or pin stale
# versions -- `npm ci` then fails. `npm install` re-resolves and records all
# platform optionals. Use this to recover a broken install; use `install`
# otherwise.
function Do-CleanInstall {
    param([Parameter(Mandatory)][string]$Name)
    $m = Resolve-Module $Name
    Write-Host "==> cleaninstall $($m.dir)" -ForegroundColor Cyan
    Invoke-In $m.dir {
        if (Test-Path 'node_modules') { Remove-Item -Recurse -Force 'node_modules' }
        if (Test-Path 'package-lock.json') { Remove-Item -Force 'package-lock.json' }
        npm install --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "npm install failed in $($m.dir) (exit $LASTEXITCODE)" }
    }
}

function Do-LockRefresh {
    param([Parameter(Mandatory)][string]$Name)
    $m = Resolve-Module $Name
    Write-Host "==> lockrefresh $($m.dir)" -ForegroundColor Cyan
    Invoke-In $m.dir {
        npm install --package-lock-only --ignore-scripts --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "npm lock refresh failed in $($m.dir) (exit $LASTEXITCODE)" }
    }
}

# build: install (if node_modules missing) then build the static bundle.
function Do-Build {
    param([Parameter(Mandatory)][string]$Name)
    if ($UiKitConsumers -contains $Name) { Do-UiKit $Name }
    $m = Resolve-Module $Name
    Write-Host "==> build $($m.dir)" -ForegroundColor Cyan
    Invoke-In $m.dir {
        if (-not (Test-Path 'node_modules')) {
            npm install --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "npm install failed in $($m.dir) (exit $LASTEXITCODE)" }
        }
        npm run build @($m.buildArgs)
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed in $($m.dir) (exit $LASTEXITCODE)" }
    }
    if ($Name -in @('app-main', 'app')) {
        node (Join-Path $PSScriptRoot 'app/scripts/check-app-bundle.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'Application bundle check fails' }
        node --test (Join-Path $PSScriptRoot 'app/scripts/check-shell-vendor.test.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'Shell vendor check fails' }
    }
}

# watch: continuously rebuild a module into the same Make-owned output used by build.
function Do-Watch {
    param([Parameter(Mandatory)][string]$Name, [string[]]$WatchArgs = @())
    if ($Name -notin @('workflows', 'agents')) { throw 'watch supports only workflows and agents' }
    $m = Resolve-Module $Name
    Write-Host "==> watch $($m.dir)" -ForegroundColor Cyan
    Invoke-In $m.dir {
        if (-not (Test-Path 'node_modules')) {
            npm install --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "npm install failed in $($m.dir) (exit $LASTEXITCODE)" }
        }
        npm run watch @($m.buildArgs) @WatchArgs
        if ($LASTEXITCODE -ne 0) { throw "npm run watch failed in $($m.dir) (exit $LASTEXITCODE)" }
    }
}

# ui-kit: materialize the shared FE vocabulary (@kickside/ui-kit) into a module.
# It is its own module publishing a build-time artifact rather than a path alias,
# so a consumer resolves it from node_modules and works from any repository. The
# package version must equal the ui-kit module version; publish validates it.
function Do-UiKit {
    param([Parameter(Mandatory)][string]$Name)
    $m = Resolve-Module $Name
    $wippy = if ($env:WIPPY_BIN) { $env:WIPPY_BIN } else { 'wippy' }
    # The .wapp comes from build-inputs/, a lock holding only build-time modules,
    # not from the app: ui-kit has no runtime role and adding it to app/wippy.lock
    # forces a boot-time re-resolution that fails offline.
    if ($env:UI_KIT_WAPP) {
        $wappPath = $env:UI_KIT_WAPP
    } else {
        Invoke-In 'build-inputs' { & $wippy update --src-dir src; if ($LASTEXITCODE -ne 0) { throw "wippy update failed (exit $LASTEXITCODE)" } }
        $found = Get-ChildItem 'build-inputs/.wippy/vendor/kickside' -Filter 'ui-kit-*.wapp' |
            Where-Object { $_.Name -notlike '*sha256*' } | Sort-Object Name | Select-Object -Last 1
        if (-not $found) { throw "no kickside/ui-kit .wapp; is the module published?" }
        $wappPath = $found.FullName
    }
    Write-Host "==> ui-kit $($m.dir)" -ForegroundColor Cyan
    & $wippy artifacts materialize $wappPath 'kickside.ui_kit:package_fs' --root (Join-Path $m.dir '.wippy')
    if ($LASTEXITCODE -ne 0) { throw "artifacts materialize failed (exit $LASTEXITCODE)" }
    $wire = Join-Path $PSScriptRoot 'scripts/wire-ui-kit.mjs'
    Invoke-In $m.dir {
        node $wire
        if ($LASTEXITCODE -ne 0) { throw "wire-ui-kit failed in $($m.dir) (exit $LASTEXITCODE)" }
        npm install --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "npm install failed in $($m.dir) (exit $LASTEXITCODE)" }
    }
}

# facade-css: assemble app/static/*.facade.generated.css from facade-src.
# App-level step (node only, no node_modules) that mirrors the root Makefile
# facade-css target; CI verifies freshness through the same repository build interface.
function Do-FacadeCss {
    Write-Host "==> facade-css app/static/*.facade.generated.css" -ForegroundColor Cyan
    Invoke-In 'app' {
        node scripts/build-facade-css.mjs
        if ($LASTEXITCODE -ne 0) { throw "build-facade-css.mjs failed (exit $LASTEXITCODE)" }
    }
}

function Do-FacadeCssCheck {
    Write-Host "==> facade-css-check app/static/*.facade.generated.css" -ForegroundColor Cyan
    Invoke-In 'app' {
        node scripts/build-facade-css.mjs --check
        if ($LASTEXITCODE -ne 0) { throw "build-facade-css.mjs --check failed (exit $LASTEXITCODE)" }
    }
}

function Do-FacadeCssWatch {
    Write-Host "==> facade-css-watch app/facade-src" -ForegroundColor Cyan
    Invoke-In 'app' {
        node scripts/build-facade-css.mjs --watch
        if ($LASTEXITCODE -ne 0) { throw "build-facade-css.mjs --watch failed (exit $LASTEXITCODE)" }
    }
}

# Ensure dependencies for source reached through the @widgets alias exist.
# This intentionally does not materialize @kickside/ui-kit: typechecking only
# follows the Vue/TypeScript source graph, not the CSS-only build package.
function Ensure-WidgetsTypecheckDependencies {
    $widgets = Resolve-Module 'widgets'
    Invoke-In $widgets.dir {
        if (-not (Test-Path 'node_modules')) {
            npm ci --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed in $($widgets.dir) (exit $LASTEXITCODE)" }
        }
    }
}

# typecheck: vue-tsc where a tsconfig exists (11.19).
function Do-Typecheck {
    param([Parameter(Mandatory)][string]$Name)
    if ($WidgetSourceConsumers -contains $Name) { Ensure-WidgetsTypecheckDependencies }
    $m = Resolve-Module $Name
    Write-Host "==> typecheck $($m.dir)" -ForegroundColor Cyan
    Invoke-In $m.dir {
        if (-not (Test-Path 'tsconfig.json')) { Write-Host "  (no tsconfig.json, skipping)"; return }
        if (-not (Test-Path 'node_modules')) {
            npm ci --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed in $($m.dir) (exit $LASTEXITCODE)" }
        }
        & .\node_modules\.bin\vue-tsc.cmd --noEmit -p tsconfig.json
        if ($LASTEXITCODE -ne 0) { throw "vue-tsc failed in $($m.dir) (exit $LASTEXITCODE)" }
    }
}

function Do-Test {
    param([Parameter(Mandatory)][string]$Name, [string[]]$TestArgs = @())
    if ($UiKitConsumers -contains $Name) { Do-UiKit $Name }
    $m = Resolve-Module $Name
    Write-Host "==> test $($m.dir)" -ForegroundColor Cyan
    Invoke-In $m.dir {
        if (-not (Test-Path 'node_modules')) {
            npm ci --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed in $($m.dir) (exit $LASTEXITCODE)" }
        }
        if ($TestArgs.Count -gt 0) { npm test -- @TestArgs } else { npm test }
        if ($LASTEXITCODE -ne 0) { throw "npm test failed in $($m.dir) (exit $LASTEXITCODE)" }
    }
}

# test-all runs every package-owned test script and deliberately skips packages
# that declare no test script. Individual `make test <module>` remains strict.
function Do-TestAll {
    ForEach-Module {
        param($Name)
        $m = Resolve-Module $Name
        Write-Host "==> test $($m.dir)" -ForegroundColor Cyan
        Invoke-In $m.dir {
            if (-not (Test-Path 'node_modules')) {
                npm ci --no-audit --no-fund
                if ($LASTEXITCODE -ne 0) { throw "npm ci failed in $($m.dir) (exit $LASTEXITCODE)" }
            }
            npm test --if-present
            if ($LASTEXITCODE -ne 0) { throw "npm test failed in $($m.dir) (exit $LASTEXITCODE)" }
        }
    }
}

function ForEach-Module {
    param([Parameter(Mandatory)][scriptblock]$Action)
    $failed = @()
    foreach ($mod in Get-AllModules) {
        try { & $Action $mod } catch { Write-Host $_.Exception.Message -ForegroundColor Red; $failed += $mod }
    }
    if ($failed.Count) { throw "failed: $($failed -join ', ')" }
}

function Show-Help {
    Write-Host "make - kickside FE build driver (Windows mirror, via make.bat -> make.ps1)`n"
    Write-Host "Usage: make <target> [module]`n"
    Write-Host "Targets:"
    Write-Host "  install <module>       npm ci from the committed lockfile"
    Write-Host "  build <module>         install if needed, then build the static bundle"
    Write-Host "  watch <module>         continuously rebuild workflows or agents"
    Write-Host "  cleaninstall <module>  wipe node_modules + lockfile, npm install (fixes broken installs)"
    Write-Host "  lockrefresh <module>   update lock metadata without a clean re-resolution"
    Write-Host "  typecheck <module>     vue-tsc --noEmit (where a tsconfig exists)"
    Write-Host "  test <module>          run the package test script"
    Write-Host "  facade-css             assemble app/static/*.facade.generated.css from facade-src"
    Write-Host "  facade-css-check       verify generated facade CSS is current"
    Write-Host "  facade-css-watch       rebuild facade CSS when facade-src changes"
    Write-Host "  install-all | build-all | cleaninstall-all | lockrefresh-all | typecheck-all | test-all"
    Write-Host "  help                   Show this message`n"
    Write-Host "Module names: app-main, plugin-template, or any platform/<name> (e.g. inbox, agents, widgets)"
}

try {
    switch -Regex ($Target) {
        '^help$|^-h$|^--help$'   { Show-Help; break }
        '^install$'              { if (-not $Module) { throw 'install needs a module (or use install-all)' }; Do-Install $Module; break }
        '^build$'                { if (-not $Module) { throw 'build needs a module (or use build-all)' }; Do-Build $Module; break }
        '^watch$'                { if (-not $Module) { throw 'watch needs a module' }; Do-Watch $Module $ExtraArgs; break }
        '^cleaninstall$'         { if (-not $Module) { throw 'cleaninstall needs a module (or use cleaninstall-all)' }; Do-CleanInstall $Module; break }
        '^lockrefresh$'          { if (-not $Module) { throw 'lockrefresh needs a module (or use lockrefresh-all)' }; Do-LockRefresh $Module; break }
        '^typecheck$'            { if (-not $Module) { throw 'typecheck needs a module (or use typecheck-all)' }; Do-Typecheck $Module; break }
        '^test$'                 { if (-not $Module) { throw 'test needs a module' }; Do-Test $Module $ExtraArgs; break }
        '^ui-kit$'               { if (-not $Module) { throw 'ui-kit needs a module' }; Do-UiKit $Module; break }
        '^facade-css$'           { Do-FacadeCss; break }
        '^facade-css-check$'     { Do-FacadeCssCheck; break }
        '^facade-css-watch$'     { Do-FacadeCssWatch; break }
        '^install-all$'          { ForEach-Module { param($m) Do-Install $m }; break }
        '^build-all$'            { Do-FacadeCss; ForEach-Module { param($m) Do-Build $m }; break }
        '^cleaninstall-all$'     { ForEach-Module { param($m) Do-CleanInstall $m }; break }
        '^lockrefresh-all$'      { ForEach-Module { param($m) Do-LockRefresh $m }; break }
        '^typecheck-all$'        { ForEach-Module { param($m) Do-Typecheck $m }; break }
        '^test-all$'             { Do-TestAll; break }
        default { throw "Unknown target: $Target. Run 'make help' for the list." }
    }
}
catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
