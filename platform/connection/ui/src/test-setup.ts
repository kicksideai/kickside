import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { afterEach, vi } from "vitest"
import { config } from "@vue/test-utils"
import { PrimeVuePlugin } from "@wippy-fe/theme/primevue-plugin"
import { onMounted, ref, watch } from "vue"
;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__api__ = {}
;(globalThis as any).__events__ = []
;(globalThis as any).__realtimeHandlers__ = []
;(globalThis as any).__emitRealtime__ = (msg: any) => {
  for (const cb of (globalThis as any).__realtimeHandlers__ || []) cb(msg)
}
function onRealtime(_topic: string, cb: (m: any) => void) {
  ;((globalThis as any).__realtimeHandlers__ ||= []).push(cb)
  return () => {
    const a = (globalThis as any).__realtimeHandlers__ || []
    const i = a.indexOf(cb)
    if (i >= 0) a.splice(i, 1)
  }
}
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = { get: vi.fn((u)=>Promise.resolve({data:resp(u)})), post: vi.fn((u)=>Promise.resolve({data:resp(u)})), put: vi.fn((u)=>Promise.resolve({data:resp(u)})), delete: vi.fn((u)=>Promise.resolve({data:resp(u)})) }
vi.mock("@wippy-fe/proxy", () => ({ api, host: { toast: vi.fn(), handleError: vi.fn() }, on: vi.fn(onRealtime), loadByTagName: vi.fn(()=>Promise.resolve()) }))
;(globalThis as any).__hostVisibility__ = ref(false)
function useHostVisibilityRefresh(task: () => unknown) {
  const visible = (globalThis as any).__hostVisibility__
  onMounted(() => task())
  watch(visible, (next: boolean, previous: boolean) => { if (previous === false && next === true) task() })
  return visible
}
vi.mock("@wippy-fe/webcomponent-vue", () => ({ useProps: () => ({ value: (globalThis as any).__props__ }), useEvents: () => vi.fn((name, detail) => (globalThis as any).__events__.push({ name, detail })), useHostVisibilityRefresh }))
// The components install PrimeVue (unstyled) through vueConfig.plugins when the
// host mounts them. @vue/test-utils' mount() bypasses that bridge, so PrimeVue
// components (Dialog, Select) mounted in specs need the same plugin installed on
// the test app — otherwise they fault reading the missing $primevue config.
config.global.plugins.push(PrimeVuePlugin)
vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({ "--p-primary": "#22c55e" }),
})) as unknown as typeof fetch)
afterEach(async () => {
  await (window as any).happyDOM.waitUntilComplete()
})
// Keep teleported Dialog content in the wrapper during unit tests. Production
// exercises the theme plugin's shadow-root portal; these specs exercise the
// connection and OAuth behavior behind that surface.
config.global.stubs = { teleport: true, Icon: true, 'wc-icon-picker': true, 'wc-model-picker': true, 'wc-resource-view': true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
