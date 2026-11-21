import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class AcmeStarterElement extends WippyVueElement<ComponentProps, Record<string, never>> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      containerClasses: ['starter-mount'],
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./lazy-mount').then((module) => module.mountConfig), {
      surface: 'page',
      loading: 'Loading the starter page',
      failed: 'Could not load this page. Reload the page to try again.',
    })
  }
}

export async function webComponent() {
  return AcmeStarterElement
}

define(import.meta.url, AcmeStarterElement)
