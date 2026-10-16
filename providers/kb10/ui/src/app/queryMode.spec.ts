import { describe, expect, it } from 'vitest'
import { analysisModel, applyQueryModel, canGenerateAnswer } from './queryMode'

describe('KB query mode', () => {
  it('does not select query analysis from the summary model', () => {
    expect(analysisModel({ summary_model: 'class:fast' })).toBe('')
    expect(canGenerateAnswer({ summary_model: 'class:fast' })).toBe(false)
  })

  it('lets explicit false disable analysis without deleting the summary model', () => {
    const config = { analysis_model: false, summary_model: 'class:fast' }
    expect(analysisModel(config)).toBe('')
    expect(canGenerateAnswer(config)).toBe(false)
  })

  it('treats explicit false as authoritative even if stale retrieval config remains', () => {
    expect(canGenerateAnswer({ analysis_model: false, retrieval_model: 'model:answer' })).toBe(false)
  })

  it('serializes a blank answer model as an explicit raw-search choice', () => {
    const config = { summary_model: 'class:fast', retrieval_model: 'old', analysis_model: 'old' }
    applyQueryModel(config, '')
    expect(config).toEqual({ summary_model: 'class:fast', analysis_model: false })
  })

  it('uses one selected model for retrieval and analysis', () => {
    const config: Record<string, unknown> = { summary_model: 'class:fast' }
    applyQueryModel(config, ' model:answer ')
    expect(config.retrieval_model).toBe('model:answer')
    expect(config.analysis_model).toBe('model:answer')
  })
})
