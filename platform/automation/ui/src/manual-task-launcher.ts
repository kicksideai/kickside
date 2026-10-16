import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Launcher from './app/ManualTaskLauncherElement.vue'
import stylesText from './execution-identity-editor.css?inline'
interface Props { target?: string; parent?: string; title?: string }
const propsSchema = { type: 'object', properties: {
  target: { type: 'string', default: '' }, parent: { type: 'string', default: '' }, title: { type: 'string', default: 'Manual task' },
} } as WippyPropsSchema
class ManualTaskLauncherElement extends WippyVueElement<Props> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return { rootComponent: Launcher } }
}
export async function webComponent() { return ManualTaskLauncherElement }
define(import.meta.url, ManualTaskLauncherElement)
