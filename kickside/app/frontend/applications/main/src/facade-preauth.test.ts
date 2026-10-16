import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const appRoot = new URL('../../../../', import.meta.url)

async function navigateWithoutToken(entry: string, stored: string | null = null) {
  const html = readFileSync(new URL(`replacements/wippy-facade-0.6.39/${entry}`, appRoot), 'utf8')
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  const shell = scripts.at(-1)?.[1]
  expect(shell).toBeDefined()

  const errors: unknown[][] = []
  const location = { href: '', origin: 'http://localhost:8085', pathname: '/' }
  const context = {
    window: { location },
    document: { getElementById: () => ({}) },
    localStorage: { getItem: () => stored },
    fetch: async () => ({ ok: true, json: async () => ({ login_path: '/login', env: {} }) }),
    console: { error: (...args: unknown[]) => errors.push(args) },
    URL,
  }
  const state = await runInNewContext(shell!, context)
  return { errors, location, state }
}

describe('facade pre-auth shell', () => {
  for (const entry of ['index.jet', 'public/index.html']) {
    it(`${entry} redirects an unauthenticated visitor without an initialization error`, async () => {
      const { errors, location, state } = await navigateWithoutToken(entry)
      expect(location.href).toBe('/login')
      expect(errors).toEqual([])
      expect(state).toMatchObject({ kind: 'unauthenticated', reason: 'missing_token' })
    })

    it(`${entry} classifies an invalid stored token before redirecting`, async () => {
      const { errors, location, state } = await navigateWithoutToken(entry, '{broken')
      expect(location.href).toBe('/login')
      expect(errors).toEqual([])
      expect(state).toMatchObject({ kind: 'unauthenticated', reason: 'invalid_token' })
    })
  }
})
