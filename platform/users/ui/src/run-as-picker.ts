import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RunAsPickerElement from './app/RunAsPickerElement.vue'
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
class KicksideRunAsPickerElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return { rootComponent: RunAsPickerElement } }
}
export async function webComponent() { return KicksideRunAsPickerElement }
define(import.meta.url, KicksideRunAsPickerElement)
