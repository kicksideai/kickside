import { resolve } from "node:path"
import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"

// Shared widget wrappers (MultiSelectField, IconField) live in ../../widgets/ui/src
// and import @wippy-fe/* by bare specifier. Without an alias, Vitest resolves those
// to the widgets package's own node_modules copy — a second module instance the
// test-setup's vi.mock (keyed to this package's copy) never intercepts. Pinning
// both to this package's install gives one instance the mock owns.
export default defineConfig({
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("wc-") } } })],
  resolve: {
    alias: {
      "@widgets": resolve(__dirname, "../../widgets/ui/src"),
      "@wippy-fe/proxy": resolve(__dirname, "node_modules/@wippy-fe/proxy"),
      "@wippy-fe/webcomponent-vue": resolve(__dirname, "node_modules/@wippy-fe/webcomponent-vue"),
    },
  },
  test: { environment: "happy-dom", setupFiles: ["src/test-setup.ts"], include: ["src/**/*.{test,spec}.ts"], coverage: { reporter: ["text"], include: ["src/**"], exclude: ["**/coverage/**","src/**/*.{test,spec}.ts","src/*.ts","src/test-setup.ts"] } },
})
