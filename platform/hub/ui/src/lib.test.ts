import { describe, it, expect } from 'vitest'
import { relativeTime } from '@widgets/app/datetime'
import {
  fmtNum, fmtBytes, moduleAccent, moduleIcon, isAppModule, isInstallableCatalogModule, renderMarkdown,
  moduleComponent, moduleIdentityKeys, moduleLabel, moduleKey, moduleMatchesComponent,
  filterCatalog, sortCatalog, sortInstalled,
  resolvedDependencyVersion, requirementKey, buildPlanTree, planNodeBadges,
  isTransitiveRequirement, dependencyRoleLabel, dependencyUsedByLabel, requiredByList,
  executionSteps, executionStepLabel, isHubAuthUsable, errorMessage,
} from './lib.ts'

describe('fmtNum', () => {
  it('formats zero and falsy as "0"', () => {
    expect(fmtNum(0)).toBe('0')
    expect(fmtNum(undefined)).toBe('0')
  })
  it('passes small numbers through', () => {
    expect(fmtNum(7)).toBe('7')
    expect(fmtNum(999)).toBe('999')
  })
  it('abbreviates thousands and millions', () => {
    expect(fmtNum(1500)).toBe('1.5k')
    expect(fmtNum(2_400_000)).toBe('2.4M')
  })
})

describe('fmtBytes', () => {
  it('returns empty for falsy', () => {
    expect(fmtBytes(0)).toBe('')
    expect(fmtBytes(undefined)).toBe('')
  })
  it('formats B / KB / MB', () => {
    expect(fmtBytes(512)).toBe('512 B')
    expect(fmtBytes(2048)).toBe('2.0 KB')
    expect(fmtBytes(3_145_728)).toBe('3.0 MB')
  })
})

describe('timeAgo', () => {
  const now = Date.UTC(2026, 0, 10, 12, 0, 0)
  const ago = (ms: number) => new Date(now - ms).toISOString()
  it('returns empty for missing / unparseable', () => {
    expect(relativeTime(undefined, { maxUnit: 'year', now })).toBe('')
    expect(relativeTime('not-a-date', { maxUnit: 'year', now })).toBe('')
  })
  it('buckets seconds → years', () => {
    expect(relativeTime(ago(30_000), { maxUnit: 'year', now })).toBe('just now')
    expect(relativeTime(ago(5 * 60_000), { maxUnit: 'year', now })).toBe('5m ago')
    expect(relativeTime(ago(3 * 3600_000), { maxUnit: 'year', now })).toBe('3h ago')
    expect(relativeTime(ago(2 * 86400_000), { maxUnit: 'year', now })).toBe('2d ago')
    expect(relativeTime(ago(60 * 86400_000), { maxUnit: 'year', now })).toBe('2mo ago')
    expect(relativeTime(ago(800 * 86400_000), { maxUnit: 'year', now })).toBe('2y ago')
  })
})

describe('moduleIcon / isAppModule', () => {
  it('maps known types, falls back to package', () => {
    expect(moduleIcon({ type: 'library' } as any)).toBe('tabler:book-2')
    expect(moduleIcon({ type: 'APP' } as any)).toBe('tabler:apps')
    expect(moduleIcon({ type: 'mystery' } as any)).toBe('tabler:package')
    expect(moduleIcon({} as any)).toBe('tabler:package')
  })
  it('detects app / application case-insensitively', () => {
    expect(isAppModule({ type: 'app' } as any)).toBe(true)
    expect(isAppModule({ type: 'Application' } as any)).toBe(true)
    expect(isAppModule({ type: 'library' } as any)).toBe(false)
    expect(isAppModule(null)).toBe(false)
  })
  it('keeps applications discoverable while excluding deprecated rows', () => {
    expect(isInstallableCatalogModule({ type: 'application' } as any)).toBe(true)
    expect(isInstallableCatalogModule({ type: 'app' } as any)).toBe(true)
    expect(isInstallableCatalogModule({ type: 'plugin' } as any)).toBe(true)
    expect(isInstallableCatalogModule({ type: 'library', deprecated: true } as any)).toBe(false)
    expect(isInstallableCatalogModule(null)).toBe(false)
  })
})

describe('moduleAccent', () => {
  it('is deterministic and a valid hsl()', () => {
    const a = moduleAccent({ full_name: 'kickside/core' } as any)
    expect(a).toBe(moduleAccent({ full_name: 'kickside/core' } as any))
    expect(a).toMatch(/^hsl\(\d+ 70% 56%\)$/)
  })
  it('falls back through name/id and never throws on empty', () => {
    expect(moduleAccent({} as any)).toMatch(/^hsl\(/)
    expect(moduleAccent({ name: 'x' } as any)).toMatch(/^hsl\(/)
  })
})

describe('renderMarkdown — sanitization (security)', () => {
  it('strips <script> blocks', () => {
    const out = renderMarkdown('hi\n\n<script>alert(1)</script>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert(1)')
  })
  it('strips style and iframe blocks', () => {
    expect(renderMarkdown('<style>x{}</style>')).not.toContain('<style')
    expect(renderMarkdown('<iframe src="evil"></iframe>')).not.toContain('<iframe')
  })
  it('strips inline event handlers', () => {
    const out = renderMarkdown('<div onclick="steal()">x</div>')
    expect(out).not.toContain('onclick')
  })
  it('neutralizes javascript: urls', () => {
    const out = renderMarkdown('[click](javascript:alert(1))')
    expect(out.toLowerCase()).not.toContain('javascript:')
  })
  it('escapes html inside fenced code', () => {
    // Non-stripped tags inside a fence are escaped, not rendered live.
    const out = renderMarkdown('```\n<b>x</b>\n```')
    expect(out).toContain('&lt;b&gt;')
    expect(out).not.toContain('<b>x</b>')
  })
  it('removes script even when it appears inside a code fence (safe, not shown live)', () => {
    // The script-strip runs before fence extraction, so a <script> in a code
    // block is dropped entirely; either way no live script can survive.
    const out = renderMarkdown('```\n<script>x</script>\n```')
    expect(out).not.toContain('<script>')
  })
})

describe('renderMarkdown — formatting', () => {
  it('empty input → empty string', () => {
    expect(renderMarkdown('')).toBe('')
  })
  it('renders headings, bold, and links', () => {
    expect(renderMarkdown('# Title')).toContain('<h1>Title</h1>')
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>')
    const link = renderMarkdown('[docs](https://example.com)')
    expect(link).toContain('href="https://example.com"')
    expect(link).toContain('rel="noopener"')
  })
  it('groups bullet lines into a list', () => {
    const out = renderMarkdown('- one\n- two')
    expect(out).toContain('<ul>')
    expect(out).toContain('<li>one</li>')
    expect(out).toContain('<li>two</li>')
  })
  it('wraps loose paragraphs', () => {
    expect(renderMarkdown('just text')).toContain('<p>just text</p>')
  })
})

describe('moduleComponent / moduleLabel / moduleKey', () => {
  it('moduleComponent prefers full_name, then component, then org/name, then namespace/name', () => {
    expect(moduleComponent({ full_name: 'a/b' } as any)).toBe('a/b')
    expect(moduleComponent({ component: 'c/d' } as any)).toBe('c/d')
    expect(moduleComponent({ org: 'o', name: 'n' } as any)).toBe('o/n')
    expect(moduleComponent({ namespace: 'ns', name: 'n' } as any)).toBe('ns/n')
    expect(moduleComponent({} as any)).toBe('')
  })
  it('moduleLabel prefers display_name, falls back to component then id then dash', () => {
    expect(moduleLabel({ display_name: 'Nice' } as any)).toBe('Nice')
    expect(moduleLabel({ full_name: 'a/b' } as any)).toBe('a/b')
    expect(moduleLabel({ id: 'x' } as any)).toBe('x')
    expect(moduleLabel({} as any)).toBe('—')
  })
  it('moduleKey is stable per identity', () => {
    expect(moduleKey({ full_name: 'a/b' } as any)).toBe('a/b')
    expect(moduleKey({ id: 'z' } as any)).toBe('z')
  })
  it('moduleIdentityKeys includes every stable module identity but not a bare ambiguous name', () => {
    expect(moduleIdentityKeys({
      full_name: 'kickside/core',
      component: 'kickside/component',
      org: 'wippy',
      namespace: 'kickside',
      name: 'agents',
      id: 'hub:123',
    } as any).sort()).toEqual([
      'kickside/agents',
      'kickside/component',
      'kickside/core',
      'wippy/agents',
    ])
  })
  it('moduleMatchesComponent bridges catalog org/name rows to installed dependency components', () => {
    expect(moduleMatchesComponent({ org: 'kickside', name: 'core' } as any, 'kickside/core')).toBe(true)
    expect(moduleMatchesComponent({ organization: 'kickside', name: 'core' } as any, 'kickside/core')).toBe(true)
    expect(moduleMatchesComponent({ organization: { slug: 'kickside' }, name: 'core' } as any, 'kickside/core')).toBe(true)
    expect(moduleMatchesComponent({ namespace: 'kickside', name: 'core' } as any, 'kickside/core')).toBe(true)
    expect(moduleMatchesComponent({ name: 'core' } as any, 'kickside/core')).toBe(false)
  })
})

describe('filterCatalog', () => {
  const items = [
    { full_name: 'kickside/core', display_name: 'KickSide Core', description: 'engine root' },
    { full_name: 'acme/tools', display_name: 'Tools', description: 'helpers' },
  ] as any[]
  it('returns all when filter is blank', () => {
    expect(filterCatalog(items, '   ')).toHaveLength(2)
  })
  it('matches label, slug, and description (case-insensitive)', () => {
    expect(filterCatalog(items, 'CORE').map(m => m.full_name)).toEqual(['kickside/core'])
    expect(filterCatalog(items, 'acme').map(m => m.full_name)).toEqual(['acme/tools'])
    expect(filterCatalog(items, 'helpers').map(m => m.full_name)).toEqual(['acme/tools'])
    expect(filterCatalog(items, 'zzz')).toEqual([])
  })
})

describe('sortCatalog', () => {
  const items = [
    { display_name: 'Beta', total_downloads: 10, update_time: '2026-01-01' },
    { display_name: 'Alpha', total_downloads: 99, update_time: '2026-03-01' },
  ] as any[]
  it('sorts by downloads desc (default) without mutating input', () => {
    const out = sortCatalog(items, 'downloads')
    expect(out.map(m => m.display_name)).toEqual(['Alpha', 'Beta'])
    expect(items[0].display_name).toBe('Beta') // original order preserved
  })
  it('sorts by name asc', () => {
    expect(sortCatalog(items, 'name').map(m => m.display_name)).toEqual(['Alpha', 'Beta'])
  })
  it('sorts by recency desc', () => {
    expect(sortCatalog(items, 'recent').map(m => m.display_name)).toEqual(['Alpha', 'Beta'])
  })
})

describe('sortInstalled / installedTier', () => {
  const lookup = (c: string) => (c === 'sandbox/app' ? ({ type: 'app' } as any) : undefined)
  const deps = [
    { id: '1', component: 'userspace/plumbing' },
    { id: '2', component: 'kickside/core' },
    { id: '3', component: 'sandbox/app' },
    { id: '4', component: 'kickside/agents' },
  ] as any[]
  it('orders app → kickside/* → other, alphabetical within tier', () => {
    expect(sortInstalled(deps, lookup).map(d => d.component)).toEqual([
      'sandbox/app', 'kickside/agents', 'kickside/core', 'userspace/plumbing',
    ])
  })
  it('does not mutate the input array', () => {
    const before = deps.map(d => d.component)
    sortInstalled(deps, lookup)
    expect(deps.map(d => d.component)).toEqual(before)
  })
})

describe('dependency roles', () => {
  it('distinguishes roots from transitives and formats used_by', () => {
    expect(dependencyRoleLabel({ is_root: true })).toBe('root')
    expect(dependencyRoleLabel({ is_root: false, used_by: ['acme/root'] })).toBe('transitive')
    expect(dependencyUsedByLabel({ used_by: ['acme/root', 'acme/other'] })).toBe('used by acme/root, acme/other')
    expect(dependencyUsedByLabel({ used_by_count: 2 })).toBe('used by 2 roots')
  })
})

describe('resolvedDependencyVersion', () => {
  it('prefers the lock resolved_modules version', () => {
    const dep = { component: 'a/b', version: '>=1.0.0', meta: { hub: { resolved_modules: [{ name: 'a/b', version: '1.4.2' }] } } } as any
    expect(resolvedDependencyVersion(dep)).toBe('1.4.2')
  })
  it('uses installed entry module_version before wildcard dependency constraints', () => {
    const dep = { component: 'wippy/bootloader', version: '*', entries: [{ module: 'wippy/bootloader', module_version: '0.3.13' }] } as any
    expect(resolvedDependencyVersion(dep)).toBe('0.3.13')
  })
  it('strips a leading range operator from the constraint when unresolved', () => {
    expect(resolvedDependencyVersion({ component: 'a/b', version: '>=v2.1.0' } as any)).toBe('2.1.0')
    expect(resolvedDependencyVersion({ component: 'a/b', version: '^0.3.0' } as any)).toBe('0.3.0')
    expect(resolvedDependencyVersion({ component: 'a/b', version: '*' } as any)).toBe('')
    expect(resolvedDependencyVersion({ component: 'a/b' } as any)).toBe('')
  })
})

describe('requirementKey', () => {
  it('prefers parameter_name → full_id → id → name, trimmed', () => {
    expect(requirementKey({ parameter_name: ' pn ' } as any)).toBe('pn')
    expect(requirementKey({ full_id: 'fi' } as any)).toBe('fi')
    expect(requirementKey({ id: 'id1' } as any)).toBe('id1')
    expect(requirementKey({ name: 'nm' } as any)).toBe('nm')
    expect(requirementKey({} as any)).toBe('')
  })
})

describe('install plan helpers', () => {
  it('builds a parent/path tree while preserving input order', () => {
    const tree = buildPlanTree([
      { module: 'root/a', path: 'root/a', direct: true },
      { module: 'dep/b', path: 'root/a/dep/b', parent: 'root/a' },
      { module: 'dep/c', path: 'root/a/dep/b/dep/c', parent: 'root/a/dep/b' },
    ] as any)
    expect(tree).toHaveLength(1)
    expect(tree[0].children[0].module).toBe('dep/b')
    expect(tree[0].children[0].children[0].module).toBe('dep/c')
  })

  it('derives badges without inventing upgrade claims for transitives', () => {
    expect(planNodeBadges({ module: 'root/a', version: '2.0.0', direct: true } as any, { targetModule: 'root/a', currentVersion: '1.0.0' }).map(b => b.label)).toEqual(['upgrade from 1.0.0', 'new'])
    expect(planNodeBadges({ module: 'dep/b', version: '2.0.0', installed: true } as any, { targetModule: 'root/a', currentVersion: '1.0.0' }).map(b => b.label)).toEqual(['installed'])
    expect(planNodeBadges({ module: 'dep/c', shared: true } as any).map(b => b.label)).toEqual(['shared'])
  })

  it('marks transitive requirements by flag, depth, or non-root module', () => {
    expect(isTransitiveRequirement({ transitive: true } as any, 'root/a')).toBe(true)
    expect(isTransitiveRequirement({ depth: 1 } as any, 'root/a')).toBe(true)
    expect(isTransitiveRequirement({ module: 'dep/b' } as any, 'root/a')).toBe(true)
    expect(isTransitiveRequirement({ module: 'root/a' } as any, 'root/a')).toBe(false)
  })
})

describe('refusal and execution helpers', () => {
  it('extracts required_by roots from object or text details', () => {
    expect(requiredByList({ required_by: { 1: 'root/a', 2: 'root/b' } })).toEqual(['root/a', 'root/b'])
    expect(requiredByList({ required_by_text: 'root/a, root/b' })).toEqual(['root/a', 'root/b'])
  })

  it('extracts and labels ordered execution steps', () => {
    const payload = { payload: { execution: [{ step: 'remove.entries', status: 'ok' }, { step: 'rollback_failed', status: 'rollback_failed' }] } }
    expect(executionSteps(payload)).toHaveLength(2)
    expect(executionStepLabel(executionSteps(payload)[0])).toBe('remove entries')
  })
})

describe('isHubAuthUsable', () => {
  it('true only when authenticated and not expired', () => {
    expect(isHubAuthUsable({ authenticated: true } as any)).toBe(true)
    expect(isHubAuthUsable({ authenticated: true, expired: true } as any)).toBe(false)
    expect(isHubAuthUsable({ authenticated: false } as any)).toBe(false)
    expect(isHubAuthUsable(null)).toBe(false)
    expect(isHubAuthUsable(undefined)).toBe(false)
  })
})

describe('errorMessage', () => {
  it('reads Error.message, raw strings, axios response error, then falls back', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
    expect(errorMessage('plain')).toBe('plain')
    expect(errorMessage({ response: { data: { error: 'server said no' } } })).toBe('server said no')
    expect(errorMessage({ message: 'mid' })).toBe('mid')
    expect(errorMessage(42, 'fallback')).toBe('fallback')
  })
})
