import { vi } from "vitest"
import { config } from "@vue/test-utils"
;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__events__ = []
vi.mock("@wippy-fe/proxy", () => ({ host: { toast: vi.fn(), handleError: vi.fn() }, on: vi.fn(() => vi.fn()), loadByTagName: vi.fn(() => Promise.resolve()) }))
vi.mock("@wippy-fe/webcomponent-vue", () => ({ useProps: () => ({ value: (globalThis as any).__props__ }), useEvents: () => vi.fn((name, detail) => (globalThis as any).__events__.push({ name, detail })) }))
config.global.stubs = { Icon: true, 'wc-icon-picker': true, 'wc-kb-picker': true, 'wc-model-picker': true, 'wc-resource-view': true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }
