import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

interface WebHostImportMapSnapshot {
  releaseTag: string
  sourceUrl: string
  sourceSha256: string
  imports: Record<string, string>
}

const uiRoot = fileURLToPath(new URL('.', import.meta.url))
const webHostImportMap = JSON.parse(
  readFileSync(resolve(uiRoot, 'web-host.import-map.snapshot.json'), 'utf8'),
) as WebHostImportMapSnapshot

const entries = {
  index: resolve(uiRoot, 'src/index.ts'),
  workflow_setup: resolve(uiRoot, 'src/workflow_setup.ts'),
  workflow_picker: resolve(uiRoot, 'src/workflow_picker.ts'),
  workflow_embed: resolve(uiRoot, 'src/workflow_embed.ts'),
  component_workflows: resolve(uiRoot, 'src/component_workflows.ts'),
}

export default defineConfig({
  // Shared widgets (ports.ts, WcMount, PickerSelect, componentRealtime) are
  // consumed straight from source through the same alias every module UI uses.
  resolve: {
    alias: {
      '@widgets': resolve(uiRoot, '../../widgets/ui/src'),
      // Shared widget source resolves bare PrimeVue imports from the consuming
      // Workflow package, even when widgets has no local node_modules.
      primevue: resolve(uiRoot, 'node_modules/primevue'),
    },
    // Shared monorepo source must resolve framework dependencies from this
    // package, even when the sibling package has never been installed.
    dedupe: ['vue', '@iconify/vue', '@wippy-fe/proxy'],
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('wc-') || tag.startsWith('kickside-'),
        },
      },
    }),
    wippyComponentPlugin({ required: true }),
    {
      name: 'strip-generated-trailing-whitespace',
      enforce: 'post',
      generateBundle(_options, bundle) {
        for (const output of Object.values(bundle)) {
          if (output.type === 'chunk') {
            output.code = output.code.replace(/[ \t]+$/gm, '')
          }
        }
      },
    },
  ],
  // Lib builds don't auto-replace process.env; dependencies that read NODE_ENV
  // would otherwise throw "process is not defined" inside the shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    lib: {
      entry: entries,
      name: 'KicksideWorkflowBuilder',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: entries,
      external: Object.keys(webHostImportMap.imports),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: false,
  },
})
