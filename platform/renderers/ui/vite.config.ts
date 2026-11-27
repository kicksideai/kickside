import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'
import { hostExternals, wcRuntimeChunk } from '../../widgets/ui/wc-build'
import { docxPreviewCompatibility } from './docx-preview-compat'
import { requireRendererEntryRegistration } from './renderer-entry-registration'

const entryNames = [
  'resource-view', 'render-markdown', 'render-pdf', 'render-image', 'render-html',
  'render-code', 'render-audio', 'render-video', 'render-docx', 'render-xlsx', 'render-pptx',
]
const entries = Object.fromEntries(entryNames.map(name => [name, resolve(__dirname, `src/${name}.ts`)]))

// A shared build with isolated components. Each entry is its own bundle, so the heavy
// renderers (pdfjs in render-pdf, markdown-it + highlight.js in render-markdown)
// load only when that viewer is actually mounted — never into a host like the
// wiki. <wc-resource-view> is the tiny host that picks + mounts the right one.
export default defineConfig({
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src') } },
  base: './',
  plugins: [
    docxPreviewCompatibility(),
    vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } }),
    wippyComponentPlugin({ required: true, lazyEntries: ['render-code'] }),
    requireRendererEntryRegistration(entryNames),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  worker: { format: 'es' },
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: entries,
      name: 'KicksideRenderers',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: entries,
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
