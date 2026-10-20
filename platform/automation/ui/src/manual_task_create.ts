// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { TaskElement } from './task-element'
import ManualTaskCreate from './app/ManualTaskCreate.vue'

class ManualTaskCreateElement extends TaskElement {
  static get vueConfig() { return { rootComponent: ManualTaskCreate, plugins: [PrimeVuePlugin] } }
}
export async function webComponent() { return ManualTaskCreateElement }
define(import.meta.url, ManualTaskCreateElement)
