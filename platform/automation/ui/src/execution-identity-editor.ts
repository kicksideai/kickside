import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import stylesText from './execution-identity-editor.css?inline'
interface Props { root?: string }
const propsSchema = { type: 'object', properties: { root: { type: 'string', default: '' } } } as WippyPropsSchema

class ExecutionIdentityEditorElement extends WippyVueElement<Props> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return lazyVueConfig(() => import('./app/ExecutionIdentityEditorElement.vue').then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading execution account editor…', failed: 'Could not load the execution account editor. Reload the page to try again.', delay: 200, timeout: 30000 }) }
}
export async function webComponent() { return ExecutionIdentityEditorElement }
define(import.meta.url, ExecutionIdentityEditorElement)
