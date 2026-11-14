import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../scripts/testing/frontend-test-clock'
import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

config.global.plugins.push(PrimeVuePlugin)

// Application specs do not exercise Iconify's remote icon loader. Mock it so
// Happy DOM has no pending asset requests while disposing the test window.
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<svg />' },
}))

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
