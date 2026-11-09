import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const prefix = '\0shell-vendor:'
const importMapPattern = /<script\b[^>]*type="importmap"[^>]*>[\s\S]*?<\/script>/
const primevue = ['config', 'button', 'tag', 'dialog', 'checkbox', 'inputtext', 'password',
  'select', 'datatable', 'column', 'avatar', 'accordion', 'accordionpanel', 'accordionheader',
  'accordioncontent', 'chip', 'textarea', 'toggleswitch', 'radiobutton', 'inputnumber',
  'datepicker', 'listbox', 'panel', 'card', 'toolbar', 'message', 'badge', 'divider', 'menu']
export const shellModules = ['@wippy-fe/proxy', 'vue', 'pinia', 'vue-router', 'luxon',
  '@iconify/vue', ...primevue.map(name => 'primevue/' + name), 'axios', 'nanoevents']
export const shellExternal = (id, importer) => shellModules.includes(id) && !importer?.startsWith(prefix)
const packageName = id => id.split('/').slice(0, id.startsWith('@') ? 2 : 1).join('/')
const sri = bytes => 'sha256-' + createHash('sha256').update(bytes).digest('base64')

export function shellVendor() {
  let root, lock, imports, fonts
  function lockedPackage(key) {
    const pinned = lock.packages[key]
    const installed = JSON.parse(readFileSync(join(root, key, 'package.json'), 'utf8'))
    if (!pinned?.integrity || installed.version !== pinned.version) throw new Error('Unlocked shell vendor package: ' + key)
    return { version: pinned.version, integrity: pinned.integrity }
  }
  return {
    name: 'kickside-shell-vendor',
    apply: 'build',
    enforce: 'post',
    configResolved(config) { root = config.root },
    async buildStart() {
      const lockPath = join(root, 'package-lock.json')
      this.addWatchFile(lockPath)
      lock = JSON.parse(readFileSync(lockPath, 'utf8'))
      fonts = {}
      for (const family of ['inter', 'outfit', 'jetbrains-mono']) {
        const name = '@fontsource-variable/' + family
        fonts['node_modules/' + name] = lockedPackage('node_modules/' + name)
        const css = readFileSync(join(root, 'node_modules', name, 'index.css'), 'utf8')
        for (const reference of css.matchAll(/url\(\.\/files\/([^)]+)\)/g)) {
          this.emitFile({ type: 'asset', fileName: 'fonts/' + reference[1],
            source: readFileSync(join(root, 'node_modules', name, 'files', reference[1])) })
        }
      }
      imports = {}
      for (const specifier of shellModules) {
        const name = packageName(specifier)
        const pinned = lockedPackage('node_modules/' + name)
        const entry = await this.resolve(specifier, prefix + specifier)
        if (!entry || entry.external) this.error('Shell vendor entry does not resolve: ' + specifier)
        const subpath = specifier.slice(name.length + 1) || 'index'
        const file = `vendor/${name}@${pinned.version}/${subpath}.js`
        this.emitFile({ type: 'chunk', id: entry.id, fileName: file, preserveSignature: 'strict' })
        imports[specifier] = { package: name, version: pinned.version, integrity: pinned.integrity, file }
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const entries = Object.fromEntries(Object.entries(imports).map(([id, entry]) =>
          [id, '/app/app/main/' + entry.file]))
        const map = { imports: entries, scopes: { '/app/app/main/': entries } }
        return html.replace(importMapPattern,
          '<script type="importmap" id="kickside-shell-import-map">' + JSON.stringify(map, null, 2) + '</script>')
      },
    },
    outputOptions(options) {
      return { ...options, paths: specifier => {
        const entry = imports[specifier]
        if (!entry) this.error('Unvendored shell external: ' + specifier)
        return '/app/app/main/' + entry.file
      } }
    },
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        const html = bundle['app.html']
        if (!html || html.type !== 'asset') this.error('Shell HTML asset is absent')
        const source = html.source.toString()
        const map = source.match(importMapPattern)
        if (!map || !source.includes('<head>')) this.error('Shell import map or head is absent')
        html.source = source.replace(map[0], '').replace('<head>', '<head>\n' + map[0])
        const packages = { ...fonts }
        for (const id of this.getModuleIds()) {
          if (!id.startsWith(root + '/node_modules/')) continue
          let directory = dirname(id.split('?')[0])
          while (directory.startsWith(root + '/node_modules/')) {
            const key = relative(root, directory).replaceAll('\\', '/')
            const pinned = lock.packages[key]
            if (pinned && !pinned.link) {
              packages[key] = lockedPackage(key)
              break
            }
            directory = dirname(directory)
          }
        }
        for (const [key, pinned] of Object.entries(packages)) {
          for (const name of readdirSync(join(root, key)).filter(name => /^licen[sc]e(?:\.[^/]+)?$/i.test(name))) {
            this.emitFile({ type: 'asset',
              fileName: `vendor/licenses/${key.slice('node_modules/'.length)}@${pinned.version}/${name}`,
              source: readFileSync(join(root, key, name)) })
          }
        }
        const files = Object.fromEntries(Object.entries(bundle).map(([name, entry]) =>
          [name, sri(entry.type === 'chunk' ? entry.code : entry.source)]))
        this.emitFile({ type: 'asset', fileName: 'vendor/manifest.json',
          source: JSON.stringify({ imports, packages: Object.fromEntries(Object.entries(packages).sort()), files }, null, 2) + '\n' })
      },
    },
  }
}
