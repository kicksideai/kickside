import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderImage from './app/RenderImage.vue'
import stylesText from './styles.css?inline'

// <wc-render-image> — isolated image viewer.
const propsSchema = {
  type: 'object',
  properties: {
    'source-url': { type: 'string', default: '', description: 'URL to fetch the image bytes from (auth via proxy).' },
    alt: { type: 'string', default: '', description: 'Alt text.' },
  },
} as const

class RenderImageElement extends WippyVueElement<{ sourceUrl?: string; alt?: string }> {
  static get wippyConfig(): WippyElementConfig<{ sourceUrl?: string; alt?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderImage } }
}

export async function webComponent() { return RenderImageElement }
define(import.meta.url, RenderImageElement)
