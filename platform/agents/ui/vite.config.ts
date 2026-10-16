import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  agent_picker: resolve(__dirname, 'src/agent_picker.ts'),
  agent_trait_picker: resolve(__dirname, 'src/agent_trait_picker.ts'),
  agent_edit: resolve(__dirname, 'src/agent_edit.ts'),
  master_picker: resolve(__dirname, 'src/master_picker.ts'),
  agent_block_config: resolve(__dirname, 'src/agent_block_config.ts'),
}

export default defineConfig({
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
  plugins: [
    vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } }),
    wippyComponentPlugin(),
    {
      name: 'strip-generated-trailing-whitespace',
      enforce: 'post',
      generateBundle(_options, bundle) {
        for (const output of Object.values(bundle)) {
          if (output.type === 'chunk') output.code = output.code.replace(/[ \t]+$/gm, '')
        }
      },
    },
  ],
  // Lib builds don't auto-replace process.env; provide it so deps that read
  // NODE_ENV don't throw "process is not defined" in the browser/shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    lib: {
      entry: entries,
      name: 'KicksideAgents',
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
