import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()
const post = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args) } }))

const { RoadmapApi, humanError } = await import('./api')

describe('humanError', () => {
  it('prefers the server copy, which is already written for a reader', () => {
    expect(humanError({ response: { data: { error: 'layer still referenced by 3 initiatives' } } }, 'fallback')).toBe('layer still referenced by 3 initiatives')
  })

  it('never leaks transport text', () => {
    expect(humanError(new Error('Request failed with status code 400'), 'Couldn’t save.')).toBe('Couldn’t save.')
    expect(humanError({ message: 'timeout of 5000ms exceeded' }, 'fallback')).toBe('timeout of 5000ms exceeded')
    expect(humanError(null, 'fallback')).toBe('fallback')
  })

  it('maps an exhausted history stack onto its own sentence', () => {
    expect(humanError({ data: { error: 'nothing to undo' } }, 'x')).toBe('Nothing to undo.')
    expect(humanError({ data: { error: 'nothing to redo' } }, 'x')).toBe('Nothing to redo.')
  })
})

describe('RoadmapApi', () => {
  beforeEach(() => { get.mockReset(); post.mockReset() })

  it('reads the snapshot from the workspace roadmap path', async () => {
    get.mockResolvedValue({ data: { success: true, roadmap: { entry_id: 'r1' } } })
    expect(await new RoadmapApi('r1').state()).toEqual({ entry_id: 'r1' })
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/roadmaps/r1')
  })

  it('sends one batch to apply and answers with the folded state', async () => {
    post.mockResolvedValue({ data: { success: true, roadmap: { entry_id: 'r1' } } })
    const commands = [{ type: 'chestor.roadmap.events:layer.added', body: { id: 'l1', title: 'Platform' } }]
    await new RoadmapApi('r1').apply(commands)
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/roadmaps/r1/apply', { commands })
  })

  it('raises the server sentence when the envelope says the call failed', async () => {
    post.mockResolvedValue({ data: { success: false, error: 'requires cycle refused: a → b → a' } })
    await expect(new RoadmapApi('r1').apply([])).rejects.toThrow('requires cycle refused: a → b → a')
  })

  it('posts undo and redo to their own endpoints', async () => {
    post.mockResolvedValue({ data: { success: true, roadmap: {} } })
    await new RoadmapApi('r1').undo()
    await new RoadmapApi('r1').redo()
    expect(post).toHaveBeenNthCalledWith(1, '/api/v1/workspace/roadmaps/r1/undo', {})
    expect(post).toHaveBeenNthCalledWith(2, '/api/v1/workspace/roadmaps/r1/redo', {})
  })

  it('humanizes an exhausted stack rather than repeating the transport', async () => {
    post.mockRejectedValue({ response: { data: { error: 'nothing to undo' } } })
    await expect(new RoadmapApi('r1').undo()).rejects.toThrow('Nothing to undo.')
  })
})
