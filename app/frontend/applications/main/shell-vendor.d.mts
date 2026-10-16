import type { Plugin } from 'vite'
export const shellModules: string[]
export const shellExternal: (id: string, importer: string | undefined) => boolean
export function shellVendor(): Plugin
