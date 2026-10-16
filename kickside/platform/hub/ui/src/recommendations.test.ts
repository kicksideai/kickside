import { describe, expect, it } from 'vitest'
import type { HubModuleListItem } from './keeper-hub.ts'
import {
  availableRecommendationModules,
  boundedAssistCandidates,
  configuredComponentContext,
  deterministicRecommendationIds,
  groupRecommendations,
  installedModuleKeys,
  intersectRecommendedIds,
  moduleOrganization,
  recommendationScore,
  searchTokens,
} from './recommendations.ts'

function module(fullName: string, extra: Partial<HubModuleListItem> = {}): HubModuleListItem {
  return {
    full_name: fullName,
    display_name: fullName.split('/').pop(),
    type: 'plugin',
    description: '',
    keywords: [],
    ...extra,
  }
}

describe('onboarding module recommendations', () => {
  it('normalizes organization variants without guessing from display text', () => {
    expect(moduleOrganization({ org: 'kickside', name: 'agents' })).toBe('kickside')
    expect(moduleOrganization({ organization: { slug: 'acme' }, name: 'private' })).toBe('acme')
    expect(moduleOrganization({ full_name: 'community/tools' })).toBe('community')
  })

  it('grounds prompt and intent matching in declared catalog terms', () => {
    const tokens = searchTokens('I want customer reports in this workspace', ['crm'])
    expect(tokens).toContain('crm')
    expect(tokens).toContain('customers')
    expect(tokens).toContain('reports')
    expect(tokens).not.toContain('workspace')

    const crm = module('acme/crm', {
      display_name: 'CRM',
      description: 'Customer and company records',
      keywords: ['kickside', 'crm'],
    })
    const unrelated = module('kickside/sso', { description: 'Single sign-on', keywords: ['kickside', 'sso'] })
    expect(recommendationScore(crm, tokens)).toBeGreaterThan(0)
    expect(recommendationScore(unrelated, tokens)).toBe(0)
  })

  it('keeps specific provider searches ahead of deterministic intent expansions', () => {
    const forward = searchTokens('Connect Google and GitHub', ['connections', 'automation'])
    const reversed = searchTokens('Connect Google and GitHub', ['automation', 'connections'])

    expect(forward).toEqual([
      'connect',
      'google',
      'github',
      'connection',
      'integration',
      'oauth',
      'provider',
      'automation',
      'workflow',
      'sync',
      'webhook',
    ])
    expect(reversed).toEqual(forward)
    expect(forward.slice(0, 6)).toEqual([
      'connect', 'google', 'github', 'connection', 'integration', 'oauth',
    ])
  })

  it('filters installed roots and transitives plus incomplete, app, and deprecated rows', () => {
    const installed = installedModuleKeys([
      { id: 'app.deps:core', namespace: 'app.deps', name: 'core', component: 'kickside/core', version: '*', installed: true },
      { id: 'app.deps:dangling', namespace: 'app.deps', name: 'dangling', component: 'acme/dangling', version: '*', installed: false },
    ], [
      { name: 'chestor/workspace' },
      { name: 'acme/dangling' },
    ])
    const available = availableRecommendationModules([
      module('kickside/core'),
      module('chestor/workspace'),
      module('acme/dangling'),
      module('kickside/kickside', { type: 'application' }),
      module('kickside/old', { deprecated: true }),
      module('kickside/knowledge'),
      module('kickside/knowledge', { id: 'duplicate' }),
    ], installed)

    expect(available.map(row => row.full_name)).toEqual(['acme/dangling', 'kickside/knowledge'])
  })

  it('orders public KickSide first, separates each authenticated private org, then public community', () => {
    const groups = groupRecommendations([
      module('community/tools', { keywords: ['agents'], total_downloads: 100 }),
      module('kickside/agents', { keywords: ['agents'], total_downloads: 10 }),
      module('acme/private-crm', { visibility: 'private', keywords: ['agents'] }),
      module('beta/private-tools', { visibility: 'private', keywords: ['agents'] }),
      module('hidden/private', { visibility: 'private', keywords: ['agents'] }),
    ], ['agents'], [
      { name: 'beta', display_name: 'Beta Team' },
      { name: 'acme', display_name: 'Acme' },
    ])

    expect(groups.map(group => group.id)).toEqual([
      'official',
      'private:acme',
      'private:beta',
      'community',
    ])
    expect(groups[0].modules.map(row => row.full_name)).toEqual(['kickside/agents'])
    expect(groups[1].title).toBe('Private modules from Acme')
    expect(groups[2].title).toBe('Private modules from Beta Team')
    expect(groups[3].title).toBe('Other available modules')
    expect(groups.flatMap(group => group.modules).some(row => row.full_name === 'hidden/private')).toBe(false)
  })

  it('retains grounded provider browse hits without synthesizing private packages or versions', () => {
    // These rows represent direct authenticated Hub browse responses for the
    // user terms `google` and `github`. Sparse keywords must not prevent an
    // exact returned catalog row from reaching recommendation grouping.
    const browseRows = [
      module('kickside/github', {
        display_name: 'GitHub',
        description: 'Connect repositories',
        keywords: [],
        latest_version: '4.5.6',
      }),
      module('acme/google-policy', {
        display_name: 'Google Policy',
        visibility: 'private',
        description: 'Internal Google controls',
        keywords: [],
        latest_version: '2.0.0',
      }),
      module('kickside/google', {
        display_name: 'Google',
        description: 'Gmail, Drive, and Calendar provider',
        keywords: ['oauth'],
        latest_version: '1.2.3',
      }),
    ]
    const available = availableRecommendationModules(browseRows, new Set())
    const groups = groupRecommendations(
      available,
      searchTokens('Connect Google and GitHub', ['connections']),
      [
        { name: 'unused-private-org', display_name: 'Not Returned' },
        { name: 'acme', display_name: 'Acme' },
      ],
    )

    expect(groups.map(group => group.id)).toEqual(['official', 'private:acme'])
    expect(groups[0].modules.map(row => row.full_name)).toEqual([
      'kickside/google',
      'kickside/github',
    ])
    expect(groups[1].modules.map(row => row.full_name)).toEqual(['acme/google-policy'])
    expect(groups.some(group => group.id === 'private:unused-private-org')).toBe(false)

    const assistCandidates = boundedAssistCandidates(groups.flatMap(group => group.modules))
    expect(assistCandidates.every(candidate => !('version' in candidate))).toBe(true)
    expect(intersectRecommendedIds(
      ['kickside/google@9.9.9', 'KICKSIDE/GITHUB', 'acme/google-policy', 'invented/provider'],
      assistCandidates.map(candidate => candidate.component),
    )).toEqual(['kickside/github', 'acme/google-policy'])
  })

  it('describes existing root and transitive components only from Keeper inventory', () => {
    const context = configuredComponentContext([
      { id: 'app.deps:crm', namespace: 'app.deps', name: 'crm', component: 'acme/private-crm', version: '>=1.0.0', installed: true, is_root: true },
      { id: 'app.deps:absent', namespace: 'app.deps', name: 'absent', component: 'acme/not-installed', version: '*', installed: false, is_root: true },
    ], [
      { name: 'acme/private-crm', version: '1.2.3', is_root: true, transitive: false },
      { name: 'acme/private-crm', version: '1.2.3', is_root: false, transitive: true, used_by: ['other'] },
      { name: 'kickside/core', version: '0.1.18', is_root: false, transitive: true, used_by: ['acme/private-crm'] },
      { name: 'acme/not-installed', version: '9.9.9', installed: false, is_root: true, transitive: false },
      { name: 'acme/orphan', version: '0.0.1', is_root: false, transitive: true, used_by_count: 0 },
    ], [
      module('kickside/core', { display_name: 'KickSide Core' }),
      module('acme/private-crm', { display_name: 'Private CRM', visibility: 'private' }),
      module('invented/not-installed', { display_name: 'Catalog only' }),
    ])

    expect(context).toEqual([
      { component: 'acme/private-crm', title: 'Private CRM', version: '1.2.3', relationship: 'root' },
      { component: 'kickside/core', title: 'KickSide Core', version: '0.1.18', relationship: 'transitive' },
    ])
    expect(context.some(row => row.component === 'invented/not-installed')).toBe(false)
    expect(context.some(row => row.component === 'acme/not-installed')).toBe(false)
    expect(context.some(row => row.component === 'acme/orphan')).toBe(false)
  })

  it('uses module identity as the deterministic final ranking tie-breaker', () => {
    const rows = [
      module('kickside/zeta', { display_name: 'Tools', keywords: ['agents'], total_downloads: 10 }),
      module('kickside/alpha', { display_name: 'Tools', keywords: ['agents'], total_downloads: 10 }),
    ]

    const forward = groupRecommendations(rows, ['agents'], [])[0].modules.map(row => row.full_name)
    const reversed = groupRecommendations([...rows].reverse(), ['agents'], [])[0].modules.map(row => row.full_name)
    expect(forward).toEqual(['kickside/alpha', 'kickside/zeta'])
    expect(reversed).toEqual(forward)
  })

  it('deduplicates and classifies the same catalog snapshot independently of response order', () => {
    const rows = [
      module('kickside/google', { display_name: 'Google', keywords: ['provider'], total_downloads: Number.NaN }),
      module('kickside/google', { display_name: 'Google Provider', keywords: ['provider'], total_downloads: Number.NaN }),
      module('kickside/github', { display_name: 'GitHub', keywords: ['provider'], total_downloads: Number.NaN }),
      module('acme/private-provider', { display_name: 'Private Provider', visibility: 'private', keywords: ['provider'] }),
    ]
    const classify = (input: HubModuleListItem[]) => groupRecommendations(
      availableRecommendationModules(input, new Set()),
      ['provider'],
      [
        { name: 'ACME', display_name: 'Acme Team' },
        { name: 'acme', display_name: 'Acme' },
      ],
    ).map(group => ({
      id: group.id,
      title: group.title,
      components: group.modules.map(row => row.full_name),
    }))

    expect(classify(rows)).toEqual(classify([...rows].reverse()))
    expect(classify(rows)).toEqual([
      {
        id: 'official',
        title: 'Recommended by KickSide',
        components: ['kickside/github', 'kickside/google'],
      },
      {
        id: 'private:acme',
        title: 'Private modules from Acme',
        components: ['acme/private-provider'],
      },
    ])
  })

  it('strictly intersects model suggestions with stable real candidate IDs', () => {
    expect(intersectRecommendedIds([
      'KICKSIDE/KNOWLEDGE',
      'invented/module',
      'kickside/knowledge',
      123,
      'community/tools',
    ], ['kickside/knowledge', 'community/tools'])).toEqual([
      'kickside/knowledge',
      'community/tools',
    ])
    expect(intersectRecommendedIds({ ids: ['kickside/knowledge'] }, ['kickside/knowledge'])).toEqual([])
  })

  it('bounds catalog metadata before it reaches model assistance', () => {
    const rows = Array.from({ length: 70 }, (_, index) => module(`acme/tool-${index}`, {
      display_name: ` ${'T'.repeat(120)} `,
      description: ` ${'D'.repeat(300)} `,
      keywords: Array.from({ length: 12 }, () => ` ${'K'.repeat(60)} `),
    }))
    const bounded = boundedAssistCandidates(rows)

    expect(bounded).toHaveLength(60)
    expect(bounded[0].title).toHaveLength(100)
    expect(bounded[0].description).toHaveLength(240)
    expect(bounded[0].keywords).toHaveLength(8)
    expect(bounded[0].keywords.every(keyword => keyword.length === 48)).toBe(true)
  })

  it('uses the deterministic grouped order as the no-model fallback', () => {
    const groups = groupRecommendations([
      module('community/tools', { total_downloads: 100 }),
      module('kickside/zeta', { total_downloads: 1 }),
      module('kickside/alpha', { total_downloads: 2 }),
    ], [], [])
    expect(deterministicRecommendationIds(groups)).toEqual([
      'kickside/alpha',
      'kickside/zeta',
      'community/tools',
    ])
  })
})
