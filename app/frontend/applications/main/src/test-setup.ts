import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../../scripts/testing/frontend-test-clock'
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

// Pages render PrimeVue components (System's tabs, the chat empty state), which
// read their config off the plugin and throw on $primevue without it.
config.global.plugins.push(PrimeVuePlugin)

// Iconify may fetch missing icon collections in Happy DOM. Tests exercise the
// shell behavior rather than Iconify's network loader, so keep the component
// structural and deterministic and prevent teardown-time fetch aborts.
vi.mock('@iconify/vue', () => ({
  addCollection: vi.fn(),
  Icon: {
    name: 'Icon',
    inheritAttrs: false,
    template: '<svg v-bind="$attrs" aria-hidden="true" />',
  },
}))

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
