import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from '@widgets/lazy'
import stylesText from './run-as-picker.css?inline'
interface Props { value?: string; root?: string; disabled?: boolean }
interface Events {
  'config-changed': { principal: { kind: 'user'; id: string }; label: string }
  load: undefined
  error: { message: string; error: unknown }
}
const propsSchema = { type: 'object', properties: {
  value: { type: 'string', default: '' }, root: { type: 'string', default: '' },
  disabled: { type: 'boolean', default: false },
} } as WippyPropsSchema
const RunAsPickerElement = lazyControl(
  () => import('./app/RunAsPickerElement.vue'),
  { loading: 'Loading run-as picker…', failed: 'Could not load the run-as picker. Reload the page to try again.' },
  useEvents,
)

class KicksideRunAsPickerElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return { rootComponent: RunAsPickerElement } }
}
export async function webComponent() { return KicksideRunAsPickerElement }
define(import.meta.url, KicksideRunAsPickerElement)
