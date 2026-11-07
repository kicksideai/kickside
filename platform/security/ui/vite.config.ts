import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'
import { hostExternals, wcRuntimeChunk } from '../../widgets/ui/wc-build'

export default defineConfig({
  resolve: { dedupe: ['vue', 'primevue'], alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
  plugins: [vue(), wippyComponentPlugin()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KicksideSecurity',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      external: hostExternals,
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
