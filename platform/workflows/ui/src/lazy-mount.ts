// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import type { WippyVueMountConfig } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import type { App } from 'vue'
import WorkflowBuilder from './app/WorkflowBuilder.vue'

const WorkflowPrimeVueServices = {
  install(app: App) {
    app.use(ConfirmationService)
    app.use(ToastService)
  },
}

export const mountConfig: WippyVueMountConfig = {
  rootComponent: WorkflowBuilder,
  plugins: [PrimeVuePlugin, WorkflowPrimeVueServices],
}
