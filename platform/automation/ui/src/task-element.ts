// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig } from '@wippy-fe/webcomponent-vue'
import stylesText from './task-styles.css?inline'

interface Props {
  'type-id'?: string
  'parent-id'?: string
  'submit-nonce'?: string
  input?: string
  config?: string
}
interface Events {
  'automation-installed': { success: boolean; id?: string; error?: string }
  'submit-state': { saving: boolean }
  created: { id?: string }
  change: { id: string }
  close: Record<string, never>
}
export class TaskElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: {
        type: 'object',
        properties: {
          'type-id': { type: 'string' }, 'parent-id': { type: 'string' },
          'submit-nonce': { type: 'string' }, input: { type: 'string' }, config: { type: 'string' },
        },
      },
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }
}
