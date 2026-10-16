import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

// Dependency CSS is embedded in the JS library chunk. Keep blank lines blank
// after bundling so a fresh served artifact passes the repository diff check.
const cleanBundleBlankLines = {
  name: 'clean-bundle-blank-lines',
  generateBundle(_options: unknown, bundle: Record<string, { type: string; code?: string }>) {
    for (const output of Object.values(bundle)) {
      if (output.type === 'chunk' && output.code) output.code = output.code.replace(/^[ \t]+$/gm, '')
    }
  },
}

export default defineConfig({
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } }),
    wippyComponentPlugin(), cleanBundleBlankLines],
  // Lib builds don't auto-replace process.env; provide it so deps that read
  // NODE_ENV don't throw "process is not defined" in the browser/shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/uploads ships and
    // serves its own UI bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KicksideUploads',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: { index: resolve(__dirname, 'src/index.ts') },
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
