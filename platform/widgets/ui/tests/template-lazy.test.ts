// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { lazyCases, message } from './lazy-cases'
import { useEvents } from '@wippy-fe/webcomponent-vue'
import { lazyPage } from '../../../../app/templates/plugin/ui/src/lazy'

lazyCases({
  template: load => ({ lazyConfig: lazyPage(async () => ({ rootComponent: await load() }), message, useEvents) }),
})
