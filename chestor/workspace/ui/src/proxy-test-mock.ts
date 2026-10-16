import { vi } from 'vitest'

export const loadByTagName = vi.fn(() => Promise.resolve())
export const api = (globalThis as any).__host_api__
