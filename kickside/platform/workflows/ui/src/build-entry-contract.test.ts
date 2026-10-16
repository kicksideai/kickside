import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

interface WebHostImportMapSnapshot {
  releaseTag: string
  sourceUrl: string
  sourceSha256: string
  imports: Record<string, string>
}

const srcRoot = fileURLToPath(new URL('.', import.meta.url))
const uiRoot = resolve(srcRoot, '..')
const moduleRoot = resolve(uiRoot, '..')
const repoRoot = resolve(uiRoot, '../../..')
const agentsRoot = resolve(repoRoot, 'platform/agents')
const read = (path: string) => readFileSync(path, 'utf8')
const source = (name: string) => read(resolve(srcRoot, name))
const snapshot = JSON.parse(
  read(resolve(uiRoot, 'web-host.import-map.snapshot.json')),
) as WebHostImportMapSnapshot

const expectedHostImports = [
  'vue',
  'pinia',
  'vue-router',
  'axios',
  'nanoevents',
  'luxon',
  '@iconify/vue',
  'iconify-icon',
  '@tanstack/vue-query',
  'sanitize-html',
  'markdown-it',
  'markdown-it-async',
  '@wippy-fe/proxy',
  '@wippy-fe/markdown-iframe',
  '@wippy-fe/log',
  '@wippy-fe/log/default-receiver',
  '@wippy-fe/log/logger',
  '@wippy-fe/log/sentry-transport',
  '@wippy-fe/log/console-transport',
  '@wippy-fe/log/gelf-transport',
]

describe('Workflows Web Host build contract', () => {
  it('pins the active Web Host release and all of its imports', () => {
    expect(snapshot.releaseTag).toBe('webcomponents-1.0.49')
    expect(snapshot.sourceUrl).toBe(
      'https://web-host.wippy.ai/webcomponents-1.0.49/import-map.json',
    )
    expect(snapshot.sourceSha256).toBe(
      'b56716674ee6d7960ac65255bf8dba4e1aefad3bb5d20244ec947c8deeb5ec02',
    )
    expect(Object.keys(snapshot.imports)).toEqual(expectedHostImports)
    expect(Object.values(snapshot.imports).every((url) => (
      url.startsWith('https://web-host.wippy.ai/webcomponents-1.0.49/')
    ))).toBe(true)
  })

  it('derives externals from the snapshot and leaves deployment output to Make', () => {
    const configSource = read(resolve(uiRoot, 'vite.config.ts'))
    expect(configSource).toContain('wippyComponentPlugin({ required: true })')
    expect(configSource).toContain('external: Object.keys(webHostImportMap.imports)')
    expect(configSource).not.toMatch(/\boutDir\s*:/)
    expect(configSource).not.toMatch(/\bemptyOutDir\s*:/)
  })

  it('keeps the four public entries and deterministic filenames', () => {
    const configSource = read(resolve(uiRoot, 'vite.config.ts'))
    expect(configSource).toContain("index: resolve(uiRoot, 'src/index.ts')")
    expect(configSource).toContain(
      "workflow_setup: resolve(uiRoot, 'src/workflow_setup.ts')",
    )
    expect(configSource).toContain(
      "workflow_embed: resolve(uiRoot, 'src/workflow_embed.ts')",
    )
    expect(configSource).toContain(
      "component_workflows: resolve(uiRoot, 'src/component_workflows.ts')",
    )
    expect(configSource).toContain("entryFileNames: '[name].js'")
  })

  it('passes deployment output and watch arguments through every checked-in Make surface', () => {
    const rootMakefile = read(resolve(repoRoot, 'Makefile'))
    const rootPowerShell = read(resolve(repoRoot, 'make.ps1'))
    const moduleMakefile = read(resolve(moduleRoot, 'Makefile'))
    const modulePowerShell = read(resolve(moduleRoot, 'make.ps1'))
    const moduleBatch = read(resolve(moduleRoot, 'make.bat'))

    expect(rootMakefile).toContain('$(if $(filter workflows agents,$(1)),-- --outDir ../static --emptyOutDir,)')
    expect(rootMakefile).toContain('npm run watch $(call fe_build_args,$(MOD)) $(WATCH_ARGS)')
    expect(rootMakefile).toContain('watch supports only MOD=workflows or MOD=agents')
    expect(rootPowerShell).toContain(
      "return @{ dir = 'platform/workflows/ui'; buildArgs = @('--', '--outDir', '../static', '--emptyOutDir') }",
    )
    expect(rootPowerShell).toContain("return @{ dir = 'platform/agents/ui'; buildArgs = @('--', '--outDir', '../static', '--emptyOutDir') }")
    expect(rootPowerShell).toContain('npm run watch @($m.buildArgs) @WatchArgs')
    expect(rootPowerShell).toContain('Do-Watch $Module $ExtraArgs')
    expect(rootPowerShell).toContain("watch supports only workflows and agents")
    expect(moduleMakefile).toContain('$(MAKE) -C ../.. build MOD=$(MODULE)')
    expect(moduleMakefile).toContain('$(MAKE) -C ../.. watch MOD=$(MODULE)')
    expect(modulePowerShell).toContain("'dev' { & $rootScript 'watch' 'workflows' @ExtraArgs")
    expect(modulePowerShell).toContain("'watch' { & $rootScript 'watch' 'workflows' @ExtraArgs")
    expect(modulePowerShell).toContain('Unsupported workflows Windows target')
    expect(moduleBatch).toContain(
      'powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%~dp0make.ps1" %*',
    )
    expect(moduleBatch).toContain('exit /b %errorlevel%')

    const agentsConfig = read(resolve(agentsRoot, 'ui/vite.config.ts'))
    const agentsPackage = read(resolve(agentsRoot, 'ui/package.json'))
    const agentsMakefile = read(resolve(agentsRoot, 'Makefile'))
    const agentsPowerShell = read(resolve(agentsRoot, 'make.ps1'))
    expect(agentsConfig).not.toMatch(/\boutDir\s*:/)
    expect(agentsConfig).not.toMatch(/\bemptyOutDir\s*:/)
    expect(agentsPackage).toContain('"watch": "vite build --watch"')
    expect(agentsMakefile).toContain('$(MAKE) -C ../.. watch MOD=$(MODULE)')
    expect(agentsPowerShell).toContain("'dev' { & $rootScript 'watch' 'agents' @ExtraArgs")
    expect(agentsPowerShell).toContain("'watch' { & $rootScript 'watch' 'agents' @ExtraArgs")
    expect(agentsPowerShell).toContain('Unsupported agents Windows target')
  })

  it('keeps facade watch and freshness checks on the checked-in Make surface', () => {
    const rootMakefile = read(resolve(repoRoot, 'Makefile'))
    const rootPowerShell = read(resolve(repoRoot, 'make.ps1'))
    const facadeScript = read(resolve(repoRoot, 'app/scripts/build-facade-css.mjs'))

    expect(rootMakefile).toContain('facade-css-check:')
    expect(rootMakefile).toContain('node scripts/build-facade-css.mjs --check')
    expect(rootMakefile).toContain('facade-css-watch:')
    expect(rootPowerShell).toContain("'^facade-css-check$'")
    expect(rootPowerShell).toContain("'^facade-css-watch$'")
    expect(facadeScript).toContain("const watchMode = process.argv.includes('--watch')")
    expect(facadeScript).toContain('writeBundles()')
    expect(facadeScript).toContain('BUNDLES.map((bundle) => watch(join(SRC, bundle.src), scheduleRebuild))')
    expect(facadeScript).toContain('rebuildTimer = setTimeout(() =>')
    expect(facadeScript).toContain('facade CSS rebuild failed:')
  })
})

describe('Workflows entry isolation', () => {
  it('delivers PrimeVue only to the four control-bearing entries', () => {
    for (const entry of [
      'index.ts',
      'workflow_setup.ts',
      'workflow_embed.ts',
      'component_workflows.ts',
    ]) {
      expect(source(entry)).toContain('PrimeVuePlugin')
      expect(source(entry)).toContain('primeVueCssUrl')
    }

    const componentView = source('app/ComponentWorkflows.vue')
    expect(componentView).toContain('<Message')
    expect(componentView).toContain('<ProgressSpinner')
    expect(componentView).not.toMatch(/<(?:button|input|textarea|select)\b/)
  })

  it('keeps setup, embed, and component-workflows off the builder stylesheet', () => {
    expect(source('workflow_setup.ts')).toContain(
      "import stylesText from './workflow-setup.css?inline'",
    )
    expect(source('workflow_embed.ts')).toContain(
      "import stylesText from './workflow-embed.css?inline'",
    )
    expect(source('component_workflows.ts')).toContain(
      "import componentStylesText from './component-workflows.css?inline'",
    )

    for (const entry of ['workflow_setup.ts', 'workflow_embed.ts', 'component_workflows.ts']) {
      expect(source(entry)).not.toContain("'./styles.css?inline'")
    }

    expect(source('styles.css')).not.toContain("import './styles/embed.css'")
    expect(source('workflow-setup.css')).toContain("import './styles/nodes.css'")
    expect(source('workflow-embed.css')).toContain("import './styles/embed.css'")
    expect(source('component-workflows.css')).toContain('.cw-root')
    expect(source('component-workflows.css')).not.toContain('.wf-')
  })
})
