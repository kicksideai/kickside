import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderMarkdown from './app/RenderMarkdown.vue'
import stylesText from './styles.css?inline'

// <wc-render-markdown> — isolated markdown viewer. markdown-it + highlight.js +
// sanitize-html live in THIS bundle only, loaded by tag when a host needs it.
const propsSchema = {
  type: 'object',
  properties: {
    source: { type: 'string', default: '', description: 'Markdown/plain text to render inline.' },
    'source-url': { type: 'string', default: '', description: 'URL to fetch the source text from (auth via proxy) when source is empty.' },
  },
} as const

class RenderMarkdownElement extends WippyVueElement<{ source?: string; sourceUrl?: string }> {
  static get wippyConfig(): WippyElementConfig<{ source?: string; sourceUrl?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderMarkdown } }
}

export async function webComponent() { return RenderMarkdownElement }
define(import.meta.url, RenderMarkdownElement)
