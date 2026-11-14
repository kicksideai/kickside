import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

// Every document a component loads in serves the complete Host import map, so its
// pinned keys stay external. Refresh the snapshot when the Host release changes.
const hostImportMap = JSON.parse(readFileSync(resolve(__dirname, 'web-host.import-map.snapshot.json'), 'utf8')) as { imports: Record<string, string> }

// The Host requests an entry with a ?declare-tag= query. A lazy chunk that imports the
// entry back has no query, so it would load a second copy of the wrapper. Keeping the
// wrapper in its own chunk leaves the entry with nothing a lazy chunk needs.
const wcRuntimeChunk = (id: string) => (id.includes('/@wippy-fe/webcomponent-') ? 'wc-runtime' : undefined)

export default defineConfig({
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } }), wippyComponentPlugin()],
  // Lib builds don't auto-replace process.env; provide it so deps that read
  // NODE_ENV don't throw "process is not defined" in the browser/shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so acme/starter ships and
    // serves its own UI bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AcmeStarter',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: { index: resolve(__dirname, 'src/index.ts') },
      external: Object.keys(hostImportMap.imports),
      output: {
        manualChunks: wcRuntimeChunk,
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
