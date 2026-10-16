import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderHtml from './app/RenderHtml.vue'
import stylesText from './styles.css?inline'

// <wc-render-html> — isolated HTML viewer (sandboxed iframe).
const propsSchema = {
  type: 'object',
  properties: {
    source: { type: 'string', default: '', description: 'Inline HTML document to render.' },
    'source-url': { type: 'string', default: '', description: 'URL to fetch the HTML from (auth via proxy) when source is empty.' },
  },
} as const

class RenderHtmlElement extends WippyVueElement<{ source?: string; sourceUrl?: string }> {
  static get wippyConfig(): WippyElementConfig<{ source?: string; sourceUrl?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderHtml } }
}

export async function webComponent() { return RenderHtmlElement }
define(import.meta.url, RenderHtmlElement)
