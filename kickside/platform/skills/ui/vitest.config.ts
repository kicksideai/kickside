import { resolve } from "node:path"
import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"

// skill-picker.vue imports the shared MultiSelectField from ../../widgets/ui/src,
// which imports @wippy-fe/* by bare specifier. Pin those to this package's install
// so the test-setup's vi.mock owns the single instance (see agents/ui for detail).
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@widgets": resolve(__dirname, "../../widgets/ui/src"),
      "@wippy-fe/proxy": resolve(__dirname, "node_modules/@wippy-fe/proxy"),
      "@wippy-fe/webcomponent-vue": resolve(__dirname, "node_modules/@wippy-fe/webcomponent-vue"),
    },
  },
  test: { environment: "happy-dom", setupFiles: ["src/test-setup.ts"], include: ["src/**/*.{test,spec}.ts"], coverage: { reporter: ["text"], include: ["src/**"], exclude: ["**/coverage/**","src/**/*.{test,spec}.ts","src/*.ts","src/test-setup.ts"] } },
})
