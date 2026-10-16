import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyPagePlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'
import { shellVendor, shellExternal } from './shell-vendor.mjs'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // `wippy-*` are real custom elements defined by the web host's
          // bundles. Without this the compiler tries to resolve them as Vue
          // components, fails, and renders nothing at all.
          isCustomElement: (tag) => tag.startsWith('example-') || tag.startsWith('wippy-'),
        },
      },
    }),
    wippyPagePlugin(),
    shellVendor(),
  ],
  base: '',
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@widgets': resolve(__dirname, '../../../../platform/widgets/ui/src'),
    },
    // The shared @widgets sources resolve their own proxy copy; dedupe to one
    // instance so tests can mock the single specifier.
    dedupe: ['@wippy-fe/proxy'],
  },
  // Vitest executes package entries through Vite's SSR pipeline. Keep layout
  // in that pipeline so its declared CSS side effect is transformed instead
  // of being handed directly to Node as an unknown `.css` module.
  ssr: {
    noExternal: ['@wippy-fe/layout'],
  },
  test: {
    setupFiles: ['./src/test-setup.ts'],
  },
  build: {
    target: 'esnext',
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: { app: resolve(__dirname, 'app.html') },
      external: shellExternal,
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
  },
})
