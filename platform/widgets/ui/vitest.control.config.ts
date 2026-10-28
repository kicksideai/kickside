// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  test: { environment: 'happy-dom', include: ['src/app/WcMount.select.test.ts', 'src/model-picker/app/model-picker-capability.test.ts'] },
})
