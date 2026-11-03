// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  define: { 'process.env.NODE_ENV': JSON.stringify('test') },
  test: { environment: 'happy-dom', setupFiles: ['./src/test-setup.ts'], maxWorkers: 2 },
}))
