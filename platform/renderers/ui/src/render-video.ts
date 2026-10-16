import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderVideo from './app/RenderVideo.vue'
import stylesText from './styles.css?inline'

// <wc-render-video> — isolated video player.
const propsSchema = {
  type: 'object',
  properties: {
    'source-url': { type: 'string', default: '', description: 'URL to fetch the video bytes from (auth via proxy).' },
  },
} as const

class RenderVideoElement extends WippyVueElement<{ sourceUrl?: string }> {
  static get wippyConfig(): WippyElementConfig<{ sourceUrl?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderVideo } }
}

export async function webComponent() { return RenderVideoElement }
define(import.meta.url, RenderVideoElement)
