import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { statusLabel } from './presenters.ts'
import ProviderRow from './ProviderRow.vue'
import type { Profile } from '../types.ts'

describe('statusLabel', () => {
  it('maps the discovery statuses to human labels', () => {
    expect(statusLabel('healthy')).toBe('Healthy')
    expect(statusLabel('unhealthy')).toBe('Unhealthy')
    expect(statusLabel('degraded')).toBe('Degraded')
  })

  it('reads absent or unknown values as Unknown, never a raw token', () => {
    expect(statusLabel(undefined)).toBe('Unknown')
    expect(statusLabel('')).toBe('Unknown')
    expect(statusLabel('provisioning')).toBe('Unknown')
  })
})

function makeProfile(status?: string): Profile {
  return { id: 'p1', name: 'My OpenAI', provider_id: 'wippy.llm.openai:provider', enabled: true, status }
}

describe('ProviderRow status dot', () => {
  it('titles the status dot with the human label, not the raw enum', () => {
    const wrapper = mount(ProviderRow, {
      props: {
        profile: makeProfile('healthy'),
        providerIcon: 'tabler:cpu',
        adapterTitle: 'OpenAI',
        selected: false,
        discoverable: true,
        discovering: false,
        busy: false,
      },
    })
    const dot = wrapper.get('.km-prow-dot')
    expect(dot.attributes('title')).toBe('Healthy')
    expect(dot.attributes('title')).not.toBe('healthy')
  })
})
