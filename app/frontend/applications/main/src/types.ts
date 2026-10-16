// Types derive from the `@wippy-fe/proxy` module surface (the synchronous
// exports), not the host-injected `window.$W` getters. The default export is
// the `resolvers` instance (has `.api`/`.host`/`.config`/`.on`).
export type HostApi = typeof import('@wippy-fe/proxy').host
export type ProxyApiInstance = typeof import('@wippy-fe/proxy').default
export type WippyConfig = typeof import('@wippy-fe/proxy').config
