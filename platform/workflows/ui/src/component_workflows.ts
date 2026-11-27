import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import componentStylesText from './component-workflows.css?inline'

interface Props { 'component-instance-id'?: string }
interface Events { navigate: { route: string } }
const config = lazyVueConfig(
  () => import('./app/ComponentWorkflows.vue').then(({ default: rootComponent }) => ({ rootComponent, plugins: [PrimeVuePlugin] })),
  { surface: 'compact', loading: 'Loading the Workflows panel…', failed: 'Could not load the Workflows panel. Reload the page to try again.' },
)

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
  static get vueConfig() { return config }
}
export async function webComponent() { return KicksideComponentWorkflowsElement }
define(import.meta.url, KicksideComponentWorkflowsElement)
