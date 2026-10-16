import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import { resolve } from "node:path"
export default defineConfig({ resolve: { alias: { "@widgets": resolve(__dirname, "../../widgets/ui/src") } }, plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('wc-') } } })], test: { environment: "happy-dom", setupFiles: ["src/test-setup.ts"], include: ["src/**/*.{test,spec}.ts"], coverage: { reporter: ["text"], include: ["src/**"], exclude: ["**/coverage/**","src/**/*.{test,spec}.ts","src/*.ts","src/test-setup.ts"] } } })
