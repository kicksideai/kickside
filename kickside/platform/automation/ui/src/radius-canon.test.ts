import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerRadiusCanon } from '@widgets/app/radiusCanon'

// Radius canon guardrail for this package. The scanner and canon table live in
// platform/widgets/ui/src/app/radiusCanon (the shared implementation every UI
// package invokes). See app/src/app/docs/kickside-development/frontend/best-practices.md "Radius canon".
const srcDir = dirname(fileURLToPath(import.meta.url))

registerRadiusCanon({
  srcDir,
  sharedFiles: [resolve(srcDir, '../../../widgets/ui/src/app/pickerselect.css')],
  required: [
    { selector: '.kx-check', value: '8px' },
    { selector: '.kx-delopt input', value: '8px' },
    { selector: '.kx-cat-card', value: '14px' },
    { selector: '.kx-tc-check input', value: '8px' },
    { selector: '.kx-tc-retry', value: '8px' },
  ],
})
