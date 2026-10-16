import { vi } from "vitest"
import { config } from "@vue/test-utils"
;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__api__ = {}
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = { get: vi.fn((u)=>Promise.resolve({data:resp(u)})), post: vi.fn((u)=>Promise.resolve({data:resp(u)})), put: vi.fn((u)=>Promise.resolve({data:resp(u)})), delete: vi.fn((u)=>Promise.resolve({data:resp(u)})) }
vi.mock("@wippy-fe/proxy", () => ({ api, host: { toast: vi.fn(), handleError: vi.fn() }, on: vi.fn(()=>vi.fn()), loadByTagName: vi.fn(()=>Promise.resolve()) }))
vi.mock("@wippy-fe/webcomponent-vue", () => ({ useProps: () => ({ value: (globalThis as any).__props__ }), useEvents: () => vi.fn() }))
config.global.stubs = { Icon: true, "wc-icon-picker": true, "wc-model-picker": true, "wc-resource-view": true }
