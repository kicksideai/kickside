import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import stylesText from './principal-picker.css?inline'
interface P { value?: string; config?: string; schema?: string; placeholder?: string; kinds?: string }
interface E { 'config-changed': Record<string, unknown>; load: undefined; error: { message: string; error: unknown } }
const propsSchema = { type: 'object', properties: {
  value: { type: 'string', default: '' }, config: { type: 'string', default: '' }, schema: { type: 'string', default: '' },
  placeholder: { type: 'string', default: 'Select a person or group…' }, kinds: { type: 'string', default: 'user,group' },
} } as WippyPropsSchema


class KicksidePrincipalPickerElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> { return { propsSchema, hostCssKeys: ['themeConfigUrl'] as const, inlineCss: stylesText } }
  static get vueConfig() { return lazyVueConfig(() => import('./app/PrincipalPickerElement.vue').then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading person picker…', failed: 'Could not load the person picker. Reload the page to try again.', delay: 200, timeout: 30000 }) }
}
export async function webComponent() { return KicksidePrincipalPickerElement }
define(import.meta.url, KicksidePrincipalPickerElement)
