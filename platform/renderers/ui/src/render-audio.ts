import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderAudio from './app/RenderAudio.vue'
import stylesText from './styles.css?inline'

// <wc-render-audio> — isolated audio player.
const propsSchema = {
  type: 'object',
  properties: {
    'source-url': { type: 'string', default: '', description: 'URL to fetch the audio bytes from (auth via proxy).' },
  },
} as const

class RenderAudioElement extends WippyVueElement<{ sourceUrl?: string }> {
  static get wippyConfig(): WippyElementConfig<{ sourceUrl?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderAudio } }
}

export async function webComponent() { return RenderAudioElement }
define(import.meta.url, RenderAudioElement)
