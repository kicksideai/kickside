import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../scripts/testing/frontend-test-clock'
import { config } from '@vue/test-utils'
import { afterEach, vi } from 'vitest'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

// The component installs PrimeVue (unstyled) through vueConfig.plugins when the
// host mounts it. @vue/test-utils' mount() bypasses that bridge, so PrimeVue
// components (Drawer, Select) mounted in specs need the same plugin installed
// on the test app — otherwise they fault reading the missing $primevue config.
config.global.plugins.push(PrimeVuePlugin)
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({ '--p-primary': '#22c55e' }),
})) as unknown as typeof fetch)
afterEach(async () => {
  await (window as any).happyDOM.waitUntilComplete()
})

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)
