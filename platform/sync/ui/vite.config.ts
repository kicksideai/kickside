import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

const entries = {
  sync_create: resolve(__dirname, 'src/sync_create.ts'),
  sync_manage: resolve(__dirname, 'src/sync_manage.ts'),
}

export default defineConfig({
  resolve: {
    alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') },
    // PickerSelect is compiled from the shared widgets source tree. Resolve
    // its bare PrimeVue imports from this package's declared dependency
    // instead of walking upward from platform/widgets.
    dedupe: ['@iconify/vue', 'primevue'],
  },
  plugins: [
    vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') || t.startsWith('kickside-') } } }),
    wippyComponentPlugin(),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: entries,
      name: 'KicksideSync',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: entries,
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
