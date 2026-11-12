// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { lazyCases, message } from '../tests/lazy-cases'
import { useEvents } from '@wippy-fe/webcomponent-vue'
import { lazyControl, lazyPage } from './lazy'

lazyCases({
  page: load => ({ lazyConfig: lazyPage(async () => ({ rootComponent: await load() }), message, useEvents) }),
  control: load => ({ rootComponent: lazyControl(async () => ({ __esModule: true as const, default: await load() }), { loading: 'Loading control', failed: message }, useEvents) }),
})
