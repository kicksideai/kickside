import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'
import { hostExternals, wcRuntimeChunk } from '../../widgets/ui/wc-build'

export default defineConfig({
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
  plugins: [vue(), wippyComponentPlugin()],
  base: '',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        onboard: resolve(__dirname, 'src/onboard.ts'),
      },
      name: 'KicksideModels',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        onboard: resolve(__dirname, 'src/onboard.ts'),
      },
      external: hostExternals,
      output: {
        manualChunks: (id) => (id.endsWith('/providerTags.ts') ? 'provider-tags' : wcRuntimeChunk(id)),
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
