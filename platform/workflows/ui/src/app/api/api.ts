// Typed client for the workflow definition API — a barrel over the per-domain clients so
// every consumer keeps one import surface. Every call routes through the authenticated
// proxy; the server enforces authorization. Errors are surfaced with the server's own
// message where present (validation copy is already human) and never masked with fake data.
//
// Domains: http (shared core) · defs · labels · runs · versions · export.

export { humanError } from './http'
export * from './defs'
export * from './labels'
export * from './runs'
export * from './versions'
export * from './export'
