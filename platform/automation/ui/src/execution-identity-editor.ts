import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from '@widgets/lazy'
import stylesText from './execution-identity-editor.css?inline'
interface Props { root?: string }
const propsSchema = { type: 'object', properties: { root: { type: 'string', default: '' } } } as WippyPropsSchema
const Editor = lazyControl(
  () => import('./app/ExecutionIdentityEditorElement.vue'),
  { loading: 'Loading execution account editor…', failed: 'Could not load the execution account editor. Reload the page to try again.' },
  useEvents,
)
class ExecutionIdentityEditorElement extends WippyVueElement<Props> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return { rootComponent: Editor } }
}
export async function webComponent() { return ExecutionIdentityEditorElement }
define(import.meta.url, ExecutionIdentityEditorElement)
