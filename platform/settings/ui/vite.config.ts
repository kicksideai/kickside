import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), wippyComponentPlugin()],
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
  // Lib builds don't auto-replace process.env; provide it so deps that read
  // NODE_ENV don't throw "process is not defined" in the browser/shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/settings ships and
    // serves its own UI bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      // Independently mounted Settings shell, provider card, and About view.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        provider: resolve(__dirname, 'src/provider.ts'),
        about: resolve(__dirname, 'src/about.ts'),
        performance: resolve(__dirname, 'src/performance.ts'),
      },
      name: 'KicksideSettings',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        provider: resolve(__dirname, 'src/provider.ts'),
        about: resolve(__dirname, 'src/about.ts'),
        performance: resolve(__dirname, 'src/performance.ts'),
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
