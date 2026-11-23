// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { tablerIconNames } from './tabler-icon-names'
export default defineConfig({
  plugins: [vue(), tablerIconNames()],
  test: {
    server: { deps: { inline: [/@wippy-fe\/webcomponent-/] } },
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
})
