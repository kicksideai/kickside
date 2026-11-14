import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { vi } from "vitest"
import { config } from "@vue/test-utils"
import { PrimeVuePlugin } from "@wippy-fe/theme/primevue-plugin"
;(globalThis as any).__props__ = {}
;(globalThis as any).__api__ = {}
;(globalThis as any).__events__ = []
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = { get: vi.fn((u)=>Promise.resolve({data:resp(u)})), post: vi.fn((u)=>Promise.resolve({data:resp(u)})), put: vi.fn((u)=>Promise.resolve({data:resp(u)})), delete: vi.fn((u)=>Promise.resolve({data:resp(u)})) }
vi.mock("@wippy-fe/proxy", () => ({ api, host: { toast: vi.fn(), handleError: vi.fn() }, on: vi.fn(()=>vi.fn()), loadByTagName: vi.fn(()=>Promise.resolve()) }))
vi.mock("@wippy-fe/webcomponent-vue", () => ({ useProps: () => ({ value: (globalThis as any).__props__ }), useEvents: () => vi.fn((name, detail) => (globalThis as any).__events__.push({ name, detail })) }))
config.global.plugins.push(PrimeVuePlugin)
config.global.stubs = { Icon: true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
