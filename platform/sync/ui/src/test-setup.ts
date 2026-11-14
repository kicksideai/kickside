import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { vi } from "vitest"
import { config } from "@vue/test-utils"
import { PrimeVuePlugin } from "@wippy-fe/theme/primevue-plugin"
;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__api__ = {}
;(globalThis as any).__realtime__ = { on: vi.fn(() => vi.fn()) }
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = { get: vi.fn((u)=>Promise.resolve({data:resp(u)})), post: vi.fn((u)=>Promise.resolve({data:resp(u)})), put: vi.fn((u)=>Promise.resolve({data:resp(u)})), patch: vi.fn((u)=>Promise.resolve({data:resp(u)})), delete: vi.fn((u)=>Promise.resolve({data:resp(u)})) }
vi.mock("@wippy-fe/proxy", () => ({
  api,
  host: { toast: vi.fn(), handleError: vi.fn() },
  on: vi.fn((topic: string, cb: (msg: unknown) => void) => (globalThis as any).__realtime__.on(topic, cb)),
  loadByTagName: vi.fn(()=>Promise.resolve()),
}))
vi.mock("@wippy-fe/webcomponent-vue", () => ({
  WippyVueElement: class WippyVueElement extends HTMLElement {},
  define: vi.fn(),
  useProps: () => ({ value: (globalThis as any).__props__ }),
  useEvents: () => vi.fn(),
}))
// The component installs PrimeVue (unstyled) through vueConfig.plugins when the
// host mounts it. @vue/test-utils' mount() bypasses that bridge, so PrimeVue
// components (Select) mounted in specs need the same plugin installed on the test
// app — otherwise they fault reading the missing $primevue config.
config.global.plugins = config.global.plugins || []
config.global.plugins.push(PrimeVuePlugin)
config.global.stubs = { Icon: true, 'wc-icon-picker': true, 'wc-model-picker': true, 'wc-resource-view': true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
