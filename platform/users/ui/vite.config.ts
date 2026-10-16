import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
  plugins: [vue(), wippyComponentPlugin()],
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
      // Elements shipped from this package: the users surface (index), the
      // reusable share popup (share), and the self-service profile (profile) —
      // each its own bundle + element.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        share: resolve(__dirname, 'src/share.ts'),
        profile: resolve(__dirname, 'src/profile.ts'),
        principal_picker: resolve(__dirname, 'src/principal-picker.ts'),
        run_as_picker: resolve(__dirname, 'src/run-as-picker.ts'),
      },
      name: 'KicksideUsers',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        share: resolve(__dirname, 'src/share.ts'),
        profile: resolve(__dirname, 'src/profile.ts'),
        principal_picker: resolve(__dirname, 'src/principal-picker.ts'),
        run_as_picker: resolve(__dirname, 'src/run-as-picker.ts'),
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
