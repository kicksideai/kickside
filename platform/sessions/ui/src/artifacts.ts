// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import type { Events } from './constants.ts'
import stylesText from './styles.css?inline'

class KicksideArtifactsElement extends WippyVueElement<Record<string, unknown>, Events> {
  static get wippyConfig(): WippyElementConfig<Record<string, unknown>> {
    return {
      propsSchema: { type: 'object', properties: {} } as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return {
      ...lazyVueConfig(() => import('./artifacts-mount').then((module) => module.mountConfig), { surface: 'page', loading: 'Loading…', failed: 'Could not load the artifact gallery. Reload the page to try again.', timeout: 30000 }),
    }
  }
}

export async function webComponent() {
  return KicksideArtifactsElement
}

define(import.meta.url, KicksideArtifactsElement)
