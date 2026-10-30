import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@widgets': resolve(__dirname, '../../widgets/ui/src'),
      // Shared Widgets source consumes the Hub's declared PrimeVue dependency.
      primevue: resolve(__dirname, 'node_modules/primevue'),
    },
    dedupe: ['vue', '@iconify/vue', '@wippy-fe/proxy'],
  },
  plugins: [vue(), wippyComponentPlugin()],
  // Specs assert the composed stylesheet, so CSS runs through the Vite pipeline under vitest.
  test: { css: { include: [/\.css(\?|$)/] } },
  // Lib builds don't auto-replace process.env; provide it so deps that read
  // NODE_ENV don't throw "process is not defined" in the browser/shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/hub ships and
    // serves its own UI bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        onboard: resolve(__dirname, 'src/onboard.ts'),
      },
      name: 'KicksideHub',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        onboard: resolve(__dirname, 'src/onboard.ts'),
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
