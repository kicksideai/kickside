import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerRadiusCanon } from '@widgets/app/radiusCanon'

// Radius canon guardrail for this package. The scanner and canon table live in
// platform/widgets/ui/src/app/radiusCanon (the shared implementation every UI
// package invokes). See app/src/app/docs/kickside-development/frontend/best-practices.md "Radius canon".
registerRadiusCanon({ srcDir: dirname(fileURLToPath(import.meta.url)) })
