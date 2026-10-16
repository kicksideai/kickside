import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

vi.mock('@wippy-fe/webcomponent-vue', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@wippy-fe/webcomponent-vue')>()),
  useHostVisibilityRefresh: (refresh: () => unknown) => { void refresh() },
}))

// Component tests must exercise the same PrimeVue configuration contract as
// the Workflows web-component entries. Base input controls read this plugin's
// app-level configuration while rendering.
config.global.plugins.push(PrimeVuePlugin)
config.global.plugins.push(ConfirmationService)
config.global.plugins.push(ToastService)

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
