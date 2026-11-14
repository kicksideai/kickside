import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { vi } from "vitest"
import { config } from "@vue/test-utils"
import { ref } from "vue"
import { PrimeVuePlugin } from "@wippy-fe/theme/primevue-plugin"
const propsRef = ref({ config: {} } as Record<string, unknown>)
Object.defineProperty(globalThis, "__props__", {
  configurable: true,
  get: () => propsRef.value,
  set: (value) => { propsRef.value = value },
})
;(globalThis as any).__props_ref__ = propsRef
;(globalThis as any).__api__ = {}
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = { get: vi.fn((u)=>Promise.resolve({data:resp(u)})), post: vi.fn((u)=>Promise.resolve({data:resp(u)})), put: vi.fn((u)=>Promise.resolve({data:resp(u)})), delete: vi.fn((u)=>Promise.resolve({data:resp(u)})) }
vi.mock("@wippy-fe/proxy", () => ({ api, host: { toast: vi.fn(), handleError: vi.fn() }, on: vi.fn(()=>vi.fn()), loadByTagName: vi.fn(()=>Promise.resolve()) }))
vi.mock("@wippy-fe/webcomponent-vue", () => ({ useProps: () => propsRef, useEvents: () => vi.fn() }))
config.global.stubs = { Icon: true, 'wc-icon-picker': true, 'wc-model-picker': true, 'wc-resource-view': true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }
// The model/connection pickers and the shared PickerSelect now render through
// PrimeVue's Select, which faults reading the missing $primevue config unless the
// plugin is installed. The host installs it via vueConfig.plugins in production;
// @vue/test-utils' mount() bypasses that bridge, so install it on the test app too.
config.global.plugins.push(PrimeVuePlugin)

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
