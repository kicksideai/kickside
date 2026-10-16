import { config } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

// Wippy installs this plugin from each web component's vueConfig. Unit mounts
// bypass that bridge, so exercise dialogs with the same shadow-safe setup.
config.global.plugins.push(PrimeVuePlugin)
