// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach } from 'vitest'
import { config, enableAutoUnmount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

config.global.plugins.push(PrimeVuePlugin)
enableAutoUnmount(afterEach)
