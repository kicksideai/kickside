// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig({
  plugins: viteConfig.plugins,
  resolve: viteConfig.resolve,
  test: { environment: 'happy-dom' },
})
