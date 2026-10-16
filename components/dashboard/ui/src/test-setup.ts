import { vi } from "vitest"
import { config } from "@vue/test-utils"
;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__api__ = {}
function resp(url: string){ const o=(globalThis as any).__api__; for(const k of Object.keys(o)) if(url.includes(k)) return o[k]; return { success: true } }
const api = { get: vi.fn((u: string)=>Promise.resolve({data:resp(u)})), post: vi.fn((u: string)=>Promise.resolve({data:resp(u)})), put: vi.fn((u: string)=>Promise.resolve({data:resp(u)})), delete: vi.fn((u: string)=>Promise.resolve({data:resp(u)})) }
vi.mock("@wippy-fe/proxy", () => ({ api, host: { toast: vi.fn(), handleError: vi.fn() }, on: vi.fn(()=>vi.fn()), loadByTagName: vi.fn(()=>Promise.resolve()) }))
vi.mock("@wippy-fe/webcomponent-vue", async () => {
  const { inject, onMounted, watch } = await import("vue")
  const HOST_VISIBILITY_PROVIDER = Symbol("host-visibility")
  return {
    HOST_VISIBILITY_PROVIDER,
    useProps: () => ({ value: (globalThis as any).__props__ }),
    useEvents: () => vi.fn(),
    useHostVisibilityRefresh: (task: () => void | Promise<void>) => {
      const visible = inject<any>(HOST_VISIBILITY_PROVIDER)
      onMounted(() => task())
      watch(visible, (next: boolean | null, previous: boolean | null) => {
        if (previous === false && next === true) task()
      })
      return visible
    },
  }
})
vi.mock("@iconify/vue", () => ({ Icon: { name: "Icon", render: () => null } }))
config.global.stubs = { Icon: true, 'wc-icon-picker': true, 'wc-model-picker': true, 'wc-resource-view': true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-') }
