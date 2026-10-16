import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Editor from './app/ExecutionIdentityEditorElement.vue'
import stylesText from './execution-identity-editor.css?inline'
interface Props { root?: string }
const propsSchema = { type: 'object', properties: { root: { type: 'string', default: '' } } } as WippyPropsSchema
class ExecutionIdentityEditorElement extends WippyVueElement<Props> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return { rootComponent: Editor } }
}
export async function webComponent() { return ExecutionIdentityEditorElement }
define(import.meta.url, ExecutionIdentityEditorElement)
