// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, beforeEach, vi } from 'vitest'
import { config, enableAutoUnmount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'

config.global.plugins.push(PrimeVuePlugin)
installFrontendTestClock(beforeEach, afterEach, vi, enableAutoUnmount)
