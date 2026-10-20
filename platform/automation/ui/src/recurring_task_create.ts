// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { TaskElement } from './task-element'
import RecurringTaskCreate from './app/RecurringTaskCreate.vue'

class RecurringTaskCreateElement extends TaskElement {
  static get vueConfig() { return { rootComponent: RecurringTaskCreate, plugins: [PrimeVuePlugin] } }
}
export async function webComponent() { return RecurringTaskCreateElement }
define(import.meta.url, RecurringTaskCreateElement)
