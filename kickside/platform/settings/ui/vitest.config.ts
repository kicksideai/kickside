import { resolve } from "node:path"
import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ["vue"],
    alias: {
      "@widgets": resolve(__dirname, "../../widgets/ui/src"),
      "@wippy-fe/proxy": resolve(__dirname, "node_modules/@wippy-fe/proxy"),
    },
  },
  test: { environment: "happy-dom", setupFiles: ["src/test-setup.ts"], include: ["src/**/*.{test,spec}.ts"], coverage: { reporter: ["text"], include: ["src/**"], exclude: ["**/coverage/**","src/**/*.{test,spec}.ts","src/*.ts","src/test-setup.ts"] } },
})
