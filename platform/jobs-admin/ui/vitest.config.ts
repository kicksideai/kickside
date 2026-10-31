// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
export default defineConfig({plugins: [vue()], test: {environment: 'happy-dom', css: {include: /styles\.css/}, include: ['src/app/performance.test.ts']}})
