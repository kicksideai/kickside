import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import MultiSelect from './app/MultiSelect.vue'
import stylesText from './styles.css?inline'

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    source: { type: 'string', default: '', description: 'List endpoint the picker pages through: GET ?q=&limit=&cursor=&parent_id=, rows under response-key, next_cursor for the following page, optional boolean search declaring server-side search. ?ids=<csv> resolves preselected chips.' },
    'connection-id': { type: 'string', default: '', description: "Connection component id whose discovery lists the rows (replaces source). Rows are the provider's resources; selectable/drillable come from the discovery envelope." },
    'discover-path': { type: 'string', default: '/api/v1/connections/{id}/discover_resources', description: 'POST endpoint template for a connection\'s discovery; {id} is the connection id, the body carries q, limit, cursor, parent_id.' },
    search: { type: 'string', default: 'server', description: 'server sends the search text to the source; local filters the loaded pages and says so. A source answering a boolean search overrides it.' },
    'page-size': { type: 'integer', default: 20, description: 'Rows requested per page (1-1000).' },
    'drill-key': { type: 'string', default: 'id', description: 'Row field sent as parent_id when a drillable row is opened.' },
    'unselectable-hint': { type: 'string', default: 'This item cannot be selected.', description: 'Reason shown on rows the source marks non-selectable (and not drillable).' },
    'id-key': { type: 'string', default: 'id', description: 'Item field used as the selected value (e.g. id, skill_id, full_path).' },
    'label-key': { type: 'string', default: 'name', description: 'Item field shown as the label (e.g. name, title).' },
    'desc-key': { type: 'string', default: 'description', description: 'Item field shown as the secondary description line.' },
    'icon-key': { type: 'string', default: 'icon', description: 'Item field holding a Tabler icon name.' },
    'meta-key': { type: 'string', default: '', description: 'Optional item field shown as a small tag next to the label.' },
    selected: { type: 'string', default: '', description: 'Initially selected ids — a JSON array string, a CSV string, or a single id.' },
    multi: { type: 'boolean', default: true, description: 'Allow multiple selections (chips). When false, a pick replaces the selection.' },
    placeholder: { type: 'string', default: 'Search…', description: 'Search input placeholder.' },
    'response-key': { type: 'string', default: '', description: 'Field on the JSON response holding the rows array. Auto-detected (items/skills/traits/results/rows/data) when empty.' },
  },
}

class KicksideMultiselectElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: MultiSelect }
  }
}

export async function webComponent() {
  return KicksideMultiselectElement
}

define(import.meta.url, KicksideMultiselectElement)
