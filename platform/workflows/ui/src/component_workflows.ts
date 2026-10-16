import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import ComponentWorkflows from './app/ComponentWorkflows.vue'
import componentStylesText from './component-workflows.css?inline'

interface Props { 'component-instance-id'?: string }
interface Events { navigate: { route: string } }
const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: { 'component-instance-id': { type: 'string', description: 'Component whose defaults and event Automations are managed.' } },
}
class KicksideComponentWorkflowsElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: componentStylesText,
    }
  }
  static get vueConfig() { return { rootComponent: ComponentWorkflows, plugins: [PrimeVuePlugin] } }
}
export async function webComponent() { return KicksideComponentWorkflowsElement }
define(import.meta.url, KicksideComponentWorkflowsElement)
