import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'w-artifact',
        },
      },
    }),
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
    // Build into the module's own served directory so kickside/sessions ships and
    // serves its own UI bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        artifacts: resolve(__dirname, 'src/artifacts.ts'),
        artifact_panel: resolve(__dirname, 'src/artifact_panel.ts'),
        artifact_coordinator: resolve(__dirname, 'src/artifact_coordinator.ts'),
      },
      name: 'KicksideSessions',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        artifacts: resolve(__dirname, 'src/artifacts.ts'),
        artifact_panel: resolve(__dirname, 'src/artifact_panel.ts'),
        artifact_coordinator: resolve(__dirname, 'src/artifact_coordinator.ts'),
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
