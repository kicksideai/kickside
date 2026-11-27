// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { lazyCases, message } from './lazy-cases'
import { lazyVueConfig } from '@wippy-fe/webcomponent-vue'

lazyCases({
  page: load => lazyVueConfig(async () => ({ rootComponent: await load() }), { surface: 'page', loading: 'Loading page', failed: message, timeout: 30000 }),
  control: load => lazyVueConfig(async () => ({ rootComponent: await load() }), { surface: 'compact', loading: 'Loading control', failed: message, timeout: 30000 }),
})
