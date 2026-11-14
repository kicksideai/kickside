// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { resolve } from 'node:path'
import { defineConfig, mergeConfig } from 'vitest/config'
import publicConfig from './vitest.config'

// Extend the selected product's test config; never replace public configuration
// when staging the private host bridge fixtures beside it.
export default mergeConfig(publicConfig, defineConfig({
  resolve: { alias: {
    '@wippy-fe/proxy': resolve(__dirname, 'node_modules/@wippy-fe/proxy'),
    '@wippy-fe/webcomponent-vue': resolve(__dirname, 'node_modules/@wippy-fe/webcomponent-vue'),
  } },
  test: { setupFiles: ['src/test-setup.ts'] },
}))
