import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { vi } from "vitest"
import { config } from "@vue/test-utils"
import { PrimeVuePlugin } from "@wippy-fe/theme/primevue-plugin"
;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__api__ = {}
;(globalThis as any).__calls__ = []
;(globalThis as any).__uploadHandlers__ = []
;(globalThis as any).__hostVisible = null
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = {
  get: vi.fn((u) => { ;((globalThis as any).__calls__ ||= []).push({ method: 'get', url: u }); return Promise.resolve({data:resp(u)}) }),
  post: vi.fn((u, body, config) => { ;((globalThis as any).__calls__ ||= []).push({ method: 'post', url: u, body, config }); return Promise.resolve({data:resp(u)}) }),
  put: vi.fn((u, body) => { ;((globalThis as any).__calls__ ||= []).push({ method: 'put', url: u, body }); return Promise.resolve({data:resp(u)}) }),
  delete: vi.fn((u) => { ;((globalThis as any).__calls__ ||= []).push({ method: 'delete', url: u }); return Promise.resolve({data:resp(u)}) }),
}
vi.mock("@wippy-fe/proxy", () => ({
  api,
  host: { toast: vi.fn(), handleError: vi.fn(), confirm: vi.fn(() => Promise.resolve(true)) },
  on: vi.fn((_topic: string, cb: (m: any) => void) => {
    ;((globalThis as any).__uploadHandlers__ ||= []).push(cb)
    return () => {
      const a = (globalThis as any).__uploadHandlers__ || []
      const i = a.indexOf(cb)
      if (i >= 0) a.splice(i, 1)
    }
  }),
  loadByTagName: vi.fn(()=>Promise.resolve()),
}))
vi.mock("@wippy-fe/webcomponent-vue", () => ({
  useProps: () => ({ value: (globalThis as any).__props__ }),
  useEvents: () => vi.fn(),
  useHostVisibilityRefresh: (refresh: () => unknown) => {
    let previous = (globalThis as any).__hostVisible
    void refresh()
    ;(globalThis as any).__setHostVisible = (next: boolean | null) => {
      if (previous === false && next === true) void refresh()
      previous = next
      ;(globalThis as any).__hostVisible = next
    }
    return { value: previous }
  },
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))
;(globalThis as any).__uploadEmit__ = (msg: any) => {
  for (const cb of (globalThis as any).__uploadHandlers__ || []) cb(msg)
}
config.global.plugins.push(PrimeVuePlugin)
config.global.stubs = {
  Icon: true,
  Drawer: { template: '<div><slot name="header" /><slot /></div>' },
  'wc-icon-picker': true,
  'wc-model-picker': true,
  'wc-resource-view': true,
}
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
