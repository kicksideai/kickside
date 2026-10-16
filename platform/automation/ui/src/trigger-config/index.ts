import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import TriggerConfig from './app/TriggerConfig.vue'
import stylesText from './styles.css?inline'
import type { TriggerConfigEvents, TriggerConfigProps } from './types.ts'

// kickside-trigger-config — the flagship Trigger Spec v2 editor, mounted by any
// consumer that embeds inputs.trigger (registry entry
// kickside.automation:trigger_config_view; the props schema below is published
// on the entry).
const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    value: {
      type: 'string',
      default: '',
      description: 'Current Trigger Spec v2 as a JSON object string. Empty starts a fresh spec; non-empty seeds every section (edit mode).',
    },
    allowed: {
      type: 'string',
      default: 'timer,source',
      description: 'CSV of offered trigger families: "timer" (the "On a schedule" row) and/or "source" (the source catalog).',
    },
    'source-classes': {
      type: 'string',
      default: '',
      description: 'Optional CSV of source classes; when set, only bindings declaring one of these classes are offered.',
    },
    'history-default': {
      type: 'string',
      description: 'Optional owner-provided initial History. Missing history is unready; the editor does not choose a replay boundary.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disable all edits.',
    },
    reconfigure: {
      type: 'boolean',
      default: false,
      description: 'Editing an installed trigger: structural fields (source, instance, options, filter, history) render locked; cadence stays editable.',
    },
  },
}

class KicksideTriggerConfigElement extends WippyVueElement<TriggerConfigProps, TriggerConfigEvents> {
  static get wippyConfig(): WippyElementConfig<TriggerConfigProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: TriggerConfig, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideTriggerConfigElement
}

define(import.meta.url, KicksideTriggerConfigElement)
