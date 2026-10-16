import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerRadiusCanon } from '../test/radiusCanon'

// The harness owns its guardrail so this suite runs in a standalone checkout.
registerRadiusCanon({ srcDir: dirname(fileURLToPath(import.meta.url)) })
