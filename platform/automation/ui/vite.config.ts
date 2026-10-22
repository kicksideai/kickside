import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

const entries = {
  recurring_task_create: resolve(__dirname, 'src/recurring_task_create.ts'),
  manual_task_create: resolve(__dirname, 'src/manual_task_create.ts'),
  index: resolve(__dirname, 'src/index.ts'),
  trigger_config: resolve(__dirname, 'src/trigger-config/index.ts'),
  manual_task_launcher: resolve(__dirname, 'src/manual-task-launcher.ts'),
  execution_identity_editor: resolve(__dirname, 'src/execution-identity-editor.ts'),
}

export default defineConfig({
  resolve: { dedupe: ['vue', 'primevue'], alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
  plugins: [
    vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') || t.startsWith('kickside-') } } }),
    wippyComponentPlugin(),
  ],
  // Lib builds don't auto-replace process.env; provide it so deps that read
  // NODE_ENV don't throw "process is not defined" in the browser/shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/automation ships
    // and serves its own UI bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: entries,
      name: 'KicksideAutomation',
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
