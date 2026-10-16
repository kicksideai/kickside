import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

// One project, four isolated elements. Each entry is its own bundle, so the heavy
// renderers (pdfjs in render-pdf, markdown-it + highlight.js in render-markdown)
// load only when that viewer is actually mounted — never into a host like the
// wiki. <wc-resource-view> is the tiny host that picks + mounts the right one.
export default defineConfig({
  base: './',
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } }), wippyComponentPlugin()],
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
      entry: {
        'resource-view': resolve(__dirname, 'src/resource-view.ts'),
        'render-markdown': resolve(__dirname, 'src/render-markdown.ts'),
        'render-pdf': resolve(__dirname, 'src/render-pdf.ts'),
        'render-image': resolve(__dirname, 'src/render-image.ts'),
        'render-html': resolve(__dirname, 'src/render-html.ts'),
        'render-code': resolve(__dirname, 'src/render-code.ts'),
        'render-audio': resolve(__dirname, 'src/render-audio.ts'),
        'render-video': resolve(__dirname, 'src/render-video.ts'),
        'render-docx': resolve(__dirname, 'src/render-docx.ts'),
        'render-xlsx': resolve(__dirname, 'src/render-xlsx.ts'),
        'render-pptx': resolve(__dirname, 'src/render-pptx.ts'),
      },
      name: 'KicksideRenderers',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: {
        'resource-view': resolve(__dirname, 'src/resource-view.ts'),
        'render-markdown': resolve(__dirname, 'src/render-markdown.ts'),
        'render-pdf': resolve(__dirname, 'src/render-pdf.ts'),
        'render-image': resolve(__dirname, 'src/render-image.ts'),
        'render-html': resolve(__dirname, 'src/render-html.ts'),
        'render-code': resolve(__dirname, 'src/render-code.ts'),
        'render-audio': resolve(__dirname, 'src/render-audio.ts'),
        'render-video': resolve(__dirname, 'src/render-video.ts'),
        'render-docx': resolve(__dirname, 'src/render-docx.ts'),
        'render-xlsx': resolve(__dirname, 'src/render-xlsx.ts'),
        'render-pptx': resolve(__dirname, 'src/render-pptx.ts'),
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
