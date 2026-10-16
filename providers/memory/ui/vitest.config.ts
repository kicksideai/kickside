import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
export default defineConfig({ plugins: [vue()], test: { environment: "happy-dom", setupFiles: ["src/test-setup.ts"], include: ["src/**/*.{test,spec}.ts"], coverage: { reporter: ["text"], include: ["src/**"], exclude: ["**/coverage/**","src/**/*.{test,spec}.ts","src/*.ts","src/test-setup.ts"] } } })
