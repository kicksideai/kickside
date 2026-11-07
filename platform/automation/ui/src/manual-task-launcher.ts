import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from '@widgets/lazy'
import stylesText from './manual-task-launcher.css?inline'
interface Props { target?: string; parent?: string; title?: string }
const propsSchema = { type: 'object', properties: {
  target: { type: 'string', default: '' }, parent: { type: 'string', default: '' }, title: { type: 'string', default: 'Manual task' },
} } as WippyPropsSchema
const Launcher = lazyControl(
  () => import('./app/ManualTaskLauncherElement.vue'),
  { loading: 'Loading manual task launcher…', failed: 'Could not load the manual task launcher. Reload the page to try again.' },
  useEvents,
)
class ManualTaskLauncherElement extends WippyVueElement<Props> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return { rootComponent: Launcher } }
}
export async function webComponent() { return ManualTaskLauncherElement }
define(import.meta.url, ManualTaskLauncherElement)
