import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerRadiusCanon } from './app/radiusCanon'

// Radius canon guardrail for this package. The scanner and canon table live in
// ./app/radiusCanon (the shared implementation every UI package invokes).
// See app/src/app/docs/kickside-development/frontend/best-practices.md "Radius canon".
registerRadiusCanon({
  srcDir: dirname(fileURLToPath(import.meta.url)),
  allow: [{
    reason: 'PrimeVue overlay radii are supplied by the canonical host theme token.',
    ok: ({ raw }) => raw === 'var(--p-select-overlay-border-radius)',
  }],
  required: [
    { selector: '.ip-reset', value: '8px' },
    { selector: '.ms-row', value: '8px' },
    { selector: '.ms-row-drill', value: '8px' },
    { selector: '.ms-crumb', value: '8px' },
    { selector: '.ms-more', value: '8px' },
    { selector: '.ms-alert', value: '10px' },
    { selector: '.sf-check', value: '8px' },
    { selector: '.sf-advanced-summary', value: '8px' },
    { selector: '.cp', value: '8px' },
    { selector: '.cp-row', value: '8px' },
    { selector: '.cp-row-main', value: '8px' },
    { selector: '.cp-row-del', value: '8px' },
    { selector: '.cp-create-btn', value: '8px' },
    { selector: '.cp-create-foot', value: '8px' },
    { selector: '.fm-err', value: '8px' },
    { selector: '.fm-row-hd', value: '8px' },
  ],
})
