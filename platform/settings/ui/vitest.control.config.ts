// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@widgets': resolve(__dirname, '../../widgets/ui/src'), '@wippy-fe/proxy': resolve(__dirname, 'node_modules/@wippy-fe/proxy') }, dedupe: ['vue'] },
  test: { environment: 'happy-dom', include: ['src/app/settings-control.test.ts'] },
})
