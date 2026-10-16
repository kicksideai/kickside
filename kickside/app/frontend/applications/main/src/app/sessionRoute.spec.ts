import { describe, expect, it } from 'vitest'
import { sessionIdFromPath, sessionPath } from './sessionRoute'

describe('sessions route synchronization', () => {
  it('round-trips session ids used by selection and Back/Forward', () => {
    const path = sessionPath('session/with spaces')
    expect(path).toBe('/sessions/session%2Fwith%20spaces')
    expect(sessionIdFromPath(path)).toBe('session/with spaces')
  })

  it('clears the active id on the new-chat route', () => {
    expect(sessionIdFromPath('/sessions')).toBe('')
  })
})
