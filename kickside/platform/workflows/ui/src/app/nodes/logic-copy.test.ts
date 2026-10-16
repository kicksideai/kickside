import { describe, expect, it } from 'vitest'
import {
  FLOW_HINT,
  FOR_EACH_BATCH_HINT,
  FOR_EACH_CONTINUE_OFF_HINT,
  FOR_EACH_CONTINUE_ON_HINT,
  FOR_EACH_USE_HINT,
  LOOP_CONDITION_HINT,
  LOOP_MAX_ITER_HINT,
} from './logic-copy'
import { KINDS, outPortsFor } from '../domain/node-policy'

// The port-label + hint data is the W15 deliverable: a first-timer must be able to wire
// each logic node from the canvas alone, and no copy may reference a variable out of
// scope or contradict what the node does today.

describe('logic node port labels are directional', () => {
  it('Loop names the loop body apart from the exit', () => {
    expect(outPortsFor('cycle').map((p) => p.id)).toEqual(['body', 'done'])
    expect(outPortsFor('cycle').map((p) => p.label)).toEqual(['each pass →', '→ when done'])
  })

  it('For-each names the per-item body apart from the collected-results port', () => {
    expect(outPortsFor('for_each').map((p) => p.id)).toEqual(['body', 'done'])
    // The continuation label reflects the array-output truth (a source-ordered results array).
    expect(outPortsFor('for_each').map((p) => p.label)).toEqual(['each item →', '→ all results'])
  })
})

describe('logic node copy is engine-honest', () => {
  it('the Loop condition placeholder is in scope (never the absent output.*)', () => {
    expect(LOOP_CONDITION_HINT).toContain('result')
    // The out-of-scope accessor `output.` never appears; "output" as an English noun is fine.
    expect(LOOP_CONDITION_HINT).not.toContain('output.')
  })

  it('the max-iterations cap says the step fails and offers the routable Failed port', () => {
    expect(LOOP_MAX_ITER_HINT).toContain('fails')
    expect(LOOP_MAX_ITER_HINT.toLowerCase()).not.toContain('stops')
    // Cap exhaustion is now routable via the Failed port (MAX_ITERATIONS_EXCEEDED).
    expect(LOOP_MAX_ITER_HINT).toContain('MAX_ITERATIONS_EXCEEDED')
    expect(LOOP_MAX_ITER_HINT).toContain('Failed port')
  })

  it('the for-each copy names both ports and the batch-size default of 8', () => {
    expect(FOR_EACH_USE_HINT.toLowerCase()).not.toContain('all at once')
    expect(FOR_EACH_USE_HINT).toContain('each item')
    expect(FOR_EACH_USE_HINT).toContain('all results')
    expect(FOR_EACH_USE_HINT).toContain('batch size')
    expect(FOR_EACH_BATCH_HINT).toContain('8')
  })

  it('the continue-on-error copy states each honest outcome', () => {
    // Off: first failure becomes the step failure, routable via the Failed port.
    expect(FOR_EACH_CONTINUE_OFF_HINT).toContain('Failed port')
    // On: every item attempted, each entry carries its result or a { code, message } error.
    expect(FOR_EACH_CONTINUE_ON_HINT).toContain('{ code, message }')
  })

  it('the For-each blurb drops the "all at once" concurrency claim', () => {
    expect(KINDS.for_each.blurb.toLowerCase()).not.toContain('all at once')
  })

  it('the Flow copy states exact composition and the blocking + Failed { code, message } contract', () => {
    expect(KINDS.flow.blurb.toLowerCase()).toContain('exact published workflow')
    expect(FLOW_HINT).toContain('waits')
    expect(FLOW_HINT).toContain('Finished')
    expect(FLOW_HINT).toContain('{ code, message }')
  })
})
