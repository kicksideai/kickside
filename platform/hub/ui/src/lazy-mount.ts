// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import type { WippyVueMountConfig } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Modules from './app/modules.vue'

export const mountConfig: WippyVueMountConfig = {
  rootComponent: Modules,
  plugins: [PrimeVuePlugin],
}
