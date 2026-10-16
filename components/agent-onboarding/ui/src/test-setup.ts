import { config } from '@vue/test-utils'
import { vi } from 'vitest'
vi.mock('@iconify/vue',()=>({Icon:{template:'<span aria-hidden="true" />'}}))
config.global.config.compilerOptions={isCustomElement:(tag:string)=>tag.startsWith('wc-')||tag==='wc-agent-trait-picker'}

import {PrimeVuePlugin} from '@wippy-fe/theme/primevue-plugin'
config.global.plugins.push(PrimeVuePlugin)
