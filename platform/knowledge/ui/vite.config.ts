import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') },
    // Shared widget sources import the host proxy too; make their bare import
    // resolve to this consumer's copy during Vite tests and development.
    dedupe: ['@wippy-fe/proxy'],
  },
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } }), wippyComponentPlugin()],
  base: '',
  // Lib builds don't auto-replace process.env; provide it so deps that read
  // NODE_ENV don't throw "process is not defined" in the browser/shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/knowledge ships
    // and serves its own UI bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      // Two elements ship from this package: the knowledge surface (index) and
      // the KB trait config component (picker), each its own bundle + element.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        picker: resolve(__dirname, 'src/picker.ts'),
        onboard: resolve(__dirname, 'src/onboard.ts'),
        kb_create: resolve(__dirname, 'src/kb_create.ts'),
      },
      name: 'KicksideKnowledge',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        picker: resolve(__dirname, 'src/picker.ts'),
        onboard: resolve(__dirname, 'src/onboard.ts'),
        kb_create: resolve(__dirname, 'src/kb_create.ts'),
      },
      external: ['vue', '@iconify/vue', '@wippy-fe/proxy'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
