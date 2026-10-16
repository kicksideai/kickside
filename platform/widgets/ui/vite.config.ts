import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

// One build for every shared widget web component — the canonical module shape
// (one ui/ -> one ../static, one mount). Each entry compiles to its own custom
// element bundle: index.js = wc-icon-picker, the rest by file name.
const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  model_picker: resolve(__dirname, 'src/model-picker/index.ts'),
  multiselect: resolve(__dirname, 'src/multiselect/index.ts'),
  schema_form: resolve(__dirname, 'src/multiselect/schema_form.ts'),
  channel_picker: resolve(__dirname, 'src/channel-picker/index.ts'),
  connection_picker: resolve(__dirname, 'src/connection-picker/index.ts'),
  component_picker: resolve(__dirname, 'src/component-picker/index.ts'),
}

export default defineConfig({
  plugins: [vue(), wippyComponentPlugin()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/widgets ships and
    // serves its own bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: entries,
      name: 'KicksideWidgets',
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
