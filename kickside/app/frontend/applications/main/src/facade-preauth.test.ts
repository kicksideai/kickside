import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { parse, stringify } from 'yaml'

const appRoot = new URL('../../../../', import.meta.url)
let fixtureRoot: string

beforeAll(() => {
  const lock = parse(readFileSync(new URL('wippy.lock', appRoot), 'utf8'))
  const facade = lock.modules.find((module: { name: string }) => module.name === 'wippy/facade')
  expect(facade, 'app lock resolves wippy/facade').toBeDefined()
  fixtureRoot = mkdtempSync(fileURLToPath(new URL('.wippy/facade-preauth-', appRoot)))
  // Unpack the verified app dependency without changing the app's release lock.
  const fixtureLock = join(fixtureRoot, 'wippy.lock')
  writeFileSync(fixtureLock, stringify({
    directories: { modules: 'vendor', src: '.' },
    modules: [facade],
    options: { unpack_modules: true },
  }))
  execFileSync('wippy', ['install', 'wippy/facade', '--lock-file', fixtureLock],
    { cwd: fixtureRoot, stdio: 'pipe' })
})

afterAll(() => {
  if (fixtureRoot) rmSync(fixtureRoot, { recursive: true })
})

async function navigateWithoutToken(entry: string, stored: string | null = null) {
  const html = readFileSync(join(fixtureRoot, 'vendor', 'wippy', 'facade', entry), 'utf8')
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  const shell = scripts.at(-1)?.[1]
  expect(shell).toBeDefined()

  const errors: unknown[][] = []
  const location = { href: '', origin: 'http://localhost:8085', pathname: '/' }
  const getItem = vi.fn(() => stored)
  const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ login_path: '/login', env: {} }) }))
  const createElement = vi.fn()
  const context = {
    window: { location },
    document: { getElementById: () => ({}), createElement },
    localStorage: { getItem },
    fetch,
    console: { error: (...args: unknown[]) => errors.push(args) },
    URL,
  }
  await runInNewContext(shell!, context)
  expect(getItem).toHaveBeenCalledExactlyOnceWith('@wippy_token_info')
  expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/public/facade/config')
  expect(createElement).not.toHaveBeenCalled()
  return { errors, location }
}

describe('facade pre-auth shell', () => {
  for (const entry of ['index.jet', 'public_files/index.html']) {
    it(`${entry} redirects an unauthenticated visitor without an initialization error`, async () => {
      const { errors, location } = await navigateWithoutToken(entry)
      expect(location.href).toBe('/login')
      expect(errors).toEqual([])
    })

    it(`${entry} redirects an invalid stored token without an initialization error`, async () => {
      const { errors, location } = await navigateWithoutToken(entry, '{broken')
      expect(location.href).toBe('/login')
      expect(errors).toEqual([])
    })
  }
})
