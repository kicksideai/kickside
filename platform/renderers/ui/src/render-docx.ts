import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderDocx from './app/RenderDocx.vue'
import stylesText from './styles.css?inline'

// <wc-render-docx> — isolated high-fidelity Word viewer (docx-preview).
const propsSchema = {
  type: 'object',
  properties: {
    'source-url': { type: 'string', default: '', description: 'URL to fetch the .docx bytes from (auth via proxy).' },
  },
} as const

class RenderDocxElement extends WippyVueElement<{ sourceUrl?: string }> {
  static get wippyConfig(): WippyElementConfig<{ sourceUrl?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderDocx } }
}

export async function webComponent() { return RenderDocxElement }
define(import.meta.url, RenderDocxElement)
