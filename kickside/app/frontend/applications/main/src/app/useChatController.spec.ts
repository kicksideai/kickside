import { describe, expect, it } from 'vitest'
import { isKicksideChatOpenDetail, useChatController } from './useChatController'

describe('useChatController', () => {
  it('switches between existing sessions and fresh starts', () => {
    const chat = useChatController()
    chat.openSession('session-1')
    expect(chat.sessionId.value).toBe('session-1')
    expect(chat.open.value).toBe(true)

    chat.startChat('agent:one')
    expect(chat.sessionId.value).toBe('')
    expect(chat.startToken.value).toBe('agent:one')
    expect(chat.generation.value).toBe(1)

    chat.newChat()
    expect(chat.startToken.value).toBe('')
    expect(chat.generation.value).toBe(2)
  })

  it('accepts only the two app-owned intent shapes', () => {
    expect(isKicksideChatOpenDetail({ kind: 'session', sessionId: 's1' })).toBe(true)
    expect(isKicksideChatOpenDetail({ kind: 'start', startToken: 'a1' })).toBe(true)
    expect(isKicksideChatOpenDetail({ kind: 'session', sessionId: '' })).toBe(false)
    expect(isKicksideChatOpenDetail({ kind: 'other' })).toBe(false)
  })

  it('reopens without clearing the current session or start intent', () => {
    const chat = useChatController()
    chat.openSession('session-1')
    chat.close()
    chat.show()
    expect(chat.open.value).toBe(true)
    expect(chat.sessionId.value).toBe('session-1')
    expect(chat.startToken.value).toBe('')

    chat.startChat('agent:one')
    chat.close()
    chat.show()
    expect(chat.open.value).toBe(true)
    expect(chat.sessionId.value).toBe('')
    expect(chat.startToken.value).toBe('agent:one')
  })
})
