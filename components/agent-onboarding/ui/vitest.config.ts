import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ plugins: [vue({template:{compilerOptions:{isCustomElement:(tag)=>tag.startsWith('wc-')||tag==='wc-agent-trait-picker'}}})], test: {environment:'happy-dom',setupFiles:['src/test-setup.ts'],include:['src/**/*.{test,spec}.ts']} })
