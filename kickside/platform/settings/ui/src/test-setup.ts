import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { vi } from "vitest"
import { onMounted, ref, watch } from "vue"
import { config } from "@vue/test-utils"
import { PrimeVuePlugin } from "@wippy-fe/theme/primevue-plugin"
;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__api__ = {}
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = { get: vi.fn((u)=>Promise.resolve({data:resp(u)})), post: vi.fn((u)=>Promise.resolve({data:resp(u)})), put: vi.fn((u)=>Promise.resolve({data:resp(u)})), delete: vi.fn((u)=>Promise.resolve({data:resp(u)})) }
vi.mock("@wippy-fe/proxy", () => ({ api, host: { toast: vi.fn(), handleError: vi.fn() }, on: vi.fn(()=>vi.fn()), loadByTagName: vi.fn(()=>Promise.resolve()) }))
vi.mock("@iconify/vue", () => ({ Icon: { template: '<span aria-hidden="true" />' } }))
;(globalThis as any).__hostVisibility__ = ref(false)
function useHostVisibilityRefresh(callback: () => unknown) {
  const visible = (globalThis as any).__hostVisibility__
  onMounted(() => callback())
  watch(visible, (next: boolean, previous: boolean) => {
    if (previous === false && next === true) callback()
  })
  return visible
}
vi.mock("@wippy-fe/webcomponent-vue", () => ({ useProps: () => ({ value: (globalThis as any).__props__ }), useEvents: () => vi.fn(), useHostVisibilityRefresh }))
// The components install PrimeVue (unstyled) through vueConfig.plugins when the
// host mounts them. @vue/test-utils' mount() bypasses that bridge, so PrimeVue
// components (Select) mounted in specs need the same plugin installed on the test
// app — otherwise they fault reading the missing $primevue config.
config.global.plugins = config.global.plugins || []
config.global.plugins.push(PrimeVuePlugin)
config.global.stubs = { Icon: true, 'wc-icon-picker': true, 'wc-model-picker': true, 'wc-resource-view': true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
