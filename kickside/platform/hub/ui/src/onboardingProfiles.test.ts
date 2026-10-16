import { describe, expect, it } from 'vitest'
import {
  ONBOARDING_PROFILE_TYPE,
  normalizeOnboardingProfiles,
  selectProfilePackages,
} from './onboardingProfiles.ts'

describe('registry onboarding profiles', () => {
  it('keeps typed profile parameters typed', () => {
    const profiles = normalizeOnboardingProfiles([
      {
        id: 'app.composition:onboarding_profile.typed',
        kind: 'registry.entry',
        meta: { type: ONBOARDING_PROFILE_TYPE },
        profile: 'typed',
        title: 'Typed',
        packages: [
          {
            component: 'acme/tools',
            parameters: [
              { name: 'acme.tools:retention', value: 30 },
              { name: 'acme.tools:strict', value: false },
              { name: 'acme.tools:router', value: 'app:api' },
              { name: 'acme.tools:dropped', value: '' },
            ],
          },
        ],
      },
    ])
    expect(profiles[0].packages[0].parameters).toEqual([
      { name: 'acme.tools:retention', value: 30 },
      { name: 'acme.tools:strict', value: false },
      { name: 'acme.tools:router', value: 'app:api' },
    ])
  })

  it('normalizes, orders, and de-duplicates declarative profiles and packages', () => {
    const profiles = normalizeOnboardingProfiles([
      {
        id: 'app.composition:onboarding_profile.engineering',
        kind: 'registry.entry',
        meta: { type: ONBOARDING_PROFILE_TYPE },
        profile: 'engineering',
        title: 'Engineering',
        order: 30,
        packages: [
          {
            component: 'chestor/graph',
            version: '>=0.1.16',
            parameters: [
              { name: 'chestor.graph:api_router', value: 'app:api' },
              { name: 'chestor.graph:api_router', value: 'ignored duplicate' },
              { name: '', value: 'ignored' },
              { name: 'ignored', value: '' },
            ],
          },
          { component: 'CHESTOR/GRAPH' },
          { component: 'not a module' },
        ],
      },
      {
        id: 'app.composition:onboarding_profile.core',
        kind: 'registry.entry',
        meta: { type: ONBOARDING_PROFILE_TYPE },
        profile: 'core',
        title: 'Core only',
        order: 10,
        packages: [],
      },
      { id: 'ignored', meta: { type: 'something.else' }, profile: 'ignored', title: 'Ignored' },
      { id: 'private', meta: { type: ONBOARDING_PROFILE_TYPE, private: true }, profile: 'private', title: 'Private' },
    ])

    expect(profiles.map(profile => profile.id)).toEqual(['core', 'engineering'])
    // Profile declarations select package identities only. Version hints are
    // deliberately discarded so onboarding can never create an exact pin.
    expect(profiles[1].packages).toEqual([{
      component: 'chestor/graph',
      parameters: [{ name: 'chestor.graph:api_router', value: 'app:api' }],
    }])
  })

  it('accepts registry payloads nested under data', () => {
    expect(normalizeOnboardingProfiles([{
      id: 'app:profile',
      data: {
        meta: { type: ONBOARDING_PROFILE_TYPE },
        profile: 'nested',
        title: 'Nested profile',
        icon: 'tabler:box',
        packages: ['acme/private-tools'],
      },
    }])).toEqual([{
      id: 'nested',
      title: 'Nested profile',
      description: '',
      icon: 'tabler:box',
      order: 500,
      required: false,
      packages: [{ component: 'acme/private-tools' }],
    }])
  })

  it('chooses duplicate profile declarations independently of registry response order', () => {
    const preferred = {
      id: 'app.composition:onboarding_profile.engineering',
      meta: { type: ONBOARDING_PROFILE_TYPE },
      profile: 'engineering',
      title: 'Engineering',
      order: 30,
      packages: ['chestor/workspace', 'chestor/graph'],
    }
    const duplicate = {
      id: 'other:onboarding_profile.engineering',
      meta: { type: ONBOARDING_PROFILE_TYPE },
      profile: 'ENGINEERING',
      title: 'Engineering duplicate',
      order: 90,
      packages: ['chestor/db-schema'],
    }

    const forward = normalizeOnboardingProfiles([duplicate, preferred])
    const reversed = normalizeOnboardingProfiles([preferred, duplicate])
    expect(forward).toEqual(reversed)
    expect(forward).toEqual([{
      id: 'engineering',
      title: 'Engineering',
      description: '',
      icon: 'tabler:packages',
      order: 30,
      required: false,
      packages: [{ component: 'chestor/workspace' }, { component: 'chestor/graph' }],
    }])
  })

  it('selects only live uninstalled catalog packages', () => {
    const profile = normalizeOnboardingProfiles([{
      meta: { type: ONBOARDING_PROFILE_TYPE },
      profile: 'team',
      title: 'Team',
      packages: ['chestor/workspace', 'chestor/graph', 'missing/package'],
    }])[0]
    const result = selectProfilePackages(
      profile,
      new Set(['chestor/workspace']),
      new Set(['chestor/graph']),
    )

    expect(result.installed.map(pkg => pkg.component)).toEqual(['chestor/workspace'])
    expect(result.selected.map(pkg => pkg.component)).toEqual(['chestor/graph'])
    expect(result.unavailable.map(pkg => pkg.component)).toEqual(['missing/package'])
  })
})
