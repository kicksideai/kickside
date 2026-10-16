import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Profile from './app/profile.vue'
import stylesText from './profile.css?inline'

// kickside-profile — the self-service account popup. A standalone element built
// as its own bundle (profile.js) and registered as its own view.component. It
// reads the current user from GET /user/me and writes editable fields via
// PUT /user/me. It owns its full modal chrome and emits `close` (and `updated`
// after a successful save) for the host to act on. No props are required.
interface ProfileProps { config?: { readonly?: boolean } }
interface ProfileEvents {
  updated: { full_name?: string }
  close: undefined
  load: undefined
  error: { message: string; error: unknown }
}

const PROPS_SCHEMA = {
  type: 'object',
  properties: {
    config: {
      type: 'object',
      description: 'Optional: { readonly } to force the read-only view.',
    },
  },
} as unknown as WippyPropsSchema

class KicksideProfileElement extends WippyVueElement<ProfileProps, ProfileEvents> {
  static get wippyConfig(): WippyElementConfig<ProfileProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Profile, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideProfileElement
}

define(import.meta.url, KicksideProfileElement)
