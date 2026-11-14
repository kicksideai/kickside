import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../scripts/testing/frontend-test-clock'
import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

// The components install PrimeVue (unstyled) through vueConfig.plugins when the
// host mounts them. @vue/test-utils' mount() bypasses that bridge, so PrimeVue
// components (Dialog, Select) mounted in specs need the same plugin installed on
// the test app — otherwise they fault reading the missing $primevue config.
config.global.plugins.push(PrimeVuePlugin)
config.global.stubs = { ...config.global.stubs, teleport: true }

// Unit specs validate application behavior, not Iconify's remote icon loader.
// Leaving the real component in Happy DOM starts resource fetches that are
// still pending when Vitest disposes a test window.
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<span />' },
}))

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
