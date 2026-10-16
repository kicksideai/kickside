import { describe, expect, it } from 'vitest'
import { normalizeMode, parseInputProp, readEmbedProps } from './embed-props'

describe('normalizeMode', () => {
  it('defaults to run and only dispatch when explicitly asked', () => {
    expect(normalizeMode(undefined)).toBe('run')
    expect(normalizeMode('')).toBe('run')
    expect(normalizeMode('run')).toBe('run')
    expect(normalizeMode('DISPATCH')).toBe('dispatch')
    expect(normalizeMode(' dispatch ')).toBe('dispatch')
    expect(normalizeMode('fire')).toBe('run') // unrecognized falls back to the observable mode
  })
})

describe('parseInputProp', () => {
  it('reads a JSON-string attribute into an object', () => {
    expect(parseInputProp('{"topic":"x","audience":"y"}')).toEqual({ value: { topic: 'x', audience: 'y' }, error: '' })
  })

  it('passes a bound object property through', () => {
    const obj = { topic: 'x' }
    expect(parseInputProp(obj)).toEqual({ value: obj, error: '' })
  })

  it('treats absent or blank input as "show the form", not an error', () => {
    expect(parseInputProp(undefined)).toEqual({ value: null, error: '' })
    expect(parseInputProp('')).toEqual({ value: null, error: '' })
    expect(parseInputProp('   ')).toEqual({ value: null, error: '' })
  })

  it('rejects non-object JSON and unparseable strings with a directed error', () => {
    expect(parseInputProp('[1,2]').error).toBe('Input must be a JSON object.')
    expect(parseInputProp('"just a string"').error).toBe('Input must be a JSON object.')
    expect(parseInputProp('{ not json').error).toBe('Input is not valid JSON.')
    expect(parseInputProp(['a']).error).toBe('Input must be a JSON object.')
  })
})

describe('readEmbedProps', () => {
  it('reads host attributes camelCased, as the element runtime exposes them', () => {
    // The Wippy element camelCases host attributes: flow-id -> flowId.
    const cfg = readEmbedProps({ flowId: 'wf-123', input: '{"topic":"t"}', mode: 'dispatch', label: 'Send it' })
    expect(cfg.workflowId).toBe('wf-123')
    expect(cfg.input).toEqual({ topic: 't' })
    expect(cfg.mode).toBe('dispatch')
    expect(cfg.label).toBe('Send it')
    expect(cfg.inputError).toBe('')
  })

  it('defaults to a pickable, form-driven, run-mode embed', () => {
    const cfg = readEmbedProps({})
    expect(cfg.workflowId).toBe('')
    expect(cfg.input).toBeNull()
    expect(cfg.mode).toBe('run')
    expect(cfg.label).toBe('Run Workflow')
  })

  it('surfaces an invalid input attribute as inputError without a value', () => {
    const cfg = readEmbedProps({ flowId: 'wf-1', input: '{bad' })
    expect(cfg.input).toBeNull()
    expect(cfg.inputError).toBe('Input is not valid JSON.')
  })

  it('tolerates a null/undefined props object', () => {
    expect(readEmbedProps(null).mode).toBe('run')
    expect(readEmbedProps(undefined).workflowId).toBe('')
  })

  it('ignores the unsupported kebab key on the runtime props object', () => {
    const cfg = readEmbedProps({ 'flow-id': 'wf-kebab' })
    expect(cfg.workflowId).toBe('')
  })
})
