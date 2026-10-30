// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig(({mode}) => ({
  define: {'process.env.NODE_ENV': JSON.stringify(mode), 'process.env': '{}'},
  plugins: [vue(), wippyComponentPlugin()],
  build: {
    target: 'esnext',
    lib: { entry: resolve(__dirname, 'src/index.ts'), name: 'KicksideJobsAdmin', formats: ['es'] },
    rollupOptions: {
      preserveEntrySignatures: false,
      external: ['vue', '@iconify/vue', '@wippy-fe/proxy'],
      output: { entryFileNames: 'index.js', chunkFileNames: '[name]-[hash].js', assetFileNames: '[name]-[hash][extname]' },
    },
    sourcemap: true,
  },
}))
