import { describe, expect, it } from 'vitest'
import { READABLE_FIT_MIN_ZOOM, readableFitOptions } from './canvas-fit'

describe('readableFitOptions', () => {
  it('keeps fitted cards readable instead of shrinking a large graph into a thumbnail', () => {
    expect(readableFitOptions(180)).toEqual({ padding: 0.2, minZoom: READABLE_FIT_MIN_ZOOM, maxZoom: 1, duration: 180 })
    expect(readableFitOptions(180, 0.02)).toEqual({ padding: 0.02, minZoom: READABLE_FIT_MIN_ZOOM, maxZoom: 1, duration: 180 })
    expect(216 * READABLE_FIT_MIN_ZOOM).toBeGreaterThanOrEqual(150)
  })

  it('never magnifies a small graph past its designed card size', () => {
    expect(Number(readableFitOptions(0).maxZoom)).toBe(1)
  })

  it('preserves the same displayed floor and ceiling when the host applies 125% UI zoom', () => {
    const options = readableFitOptions(250, 0.2, 1.25)
    expect(Number(options.minZoom) * 1.25).toBeCloseTo(READABLE_FIT_MIN_ZOOM)
    expect(Number(options.maxZoom) * 1.25).toBeCloseTo(1)
  })
})
