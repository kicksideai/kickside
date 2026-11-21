import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import stylesText from './manual-task-launcher.css?inline'
interface Props { target?: string; parent?: string; title?: string }
const propsSchema = { type: 'object', properties: {
  target: { type: 'string', default: '' }, parent: { type: 'string', default: '' }, title: { type: 'string', default: 'Manual task' },
} } as WippyPropsSchema

class ManualTaskLauncherElement extends WippyVueElement<Props> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return lazyVueConfig(() => import('./app/ManualTaskLauncherElement.vue').then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading manual task launcher…', failed: 'Could not load the manual task launcher. Reload the page to try again.', delay: 200, timeout: 30000 }) }
}
export async function webComponent() { return ManualTaskLauncherElement }
define(import.meta.url, ManualTaskLauncherElement)
