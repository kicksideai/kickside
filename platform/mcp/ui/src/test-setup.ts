import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { vi } from "vitest"
import { config } from "@vue/test-utils"
import { PrimeVuePlugin } from "@wippy-fe/theme/primevue-plugin"
import { onMounted, ref, watch } from "vue"
;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__api__ = {}
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = { get: vi.fn((u)=>Promise.resolve({data:resp(u)})), post: vi.fn((u)=>Promise.resolve({data:resp(u)})), put: vi.fn((u)=>Promise.resolve({data:resp(u)})), delete: vi.fn((u)=>Promise.resolve({data:resp(u)})) }
vi.mock("@wippy-fe/proxy", () => ({ api, host: { toast: vi.fn(), handleError: vi.fn() }, on: vi.fn(()=>vi.fn()), loadByTagName: vi.fn(()=>Promise.resolve()) }))
vi.mock("@iconify/vue", () => ({ Icon: { template: '<span aria-hidden="true" />' } }))
;(globalThis as any).__hostVisibility__ = ref(false)
function useHostVisibilityRefresh(task: () => unknown) {
  const visible = (globalThis as any).__hostVisibility__
  onMounted(() => task())
  watch(visible, (next: boolean, previous: boolean) => { if (previous === false && next === true) task() })
  return visible
}
vi.mock("@wippy-fe/webcomponent-vue", () => ({ useProps: () => ({ value: (globalThis as any).__props__ }), useEvents: () => vi.fn(), useHostVisibilityRefresh }))
config.global.stubs = { Icon: true, 'wc-icon-picker': true, 'wc-model-picker': true, 'wc-resource-view': true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }

// PrimeVue (Dialog) mounted in specs needs the plugin the host normally installs.
config.global.plugins = config.global.plugins || []
config.global.plugins.push(PrimeVuePlugin)

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
