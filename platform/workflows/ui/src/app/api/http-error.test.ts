import { describe, expect, it } from 'vitest'
import { httpStatus } from './http-error'

describe('httpStatus', () => {
  it('reads an axios-shaped response.status', () => {
    expect(httpStatus({ response: { status: 404 } })).toBe(404)
  })

  it('reads an already-flat status', () => {
    expect(httpStatus({ status: 500 })).toBe(500)
  })

  it('prefers response.status over a flat status when both are present', () => {
    expect(httpStatus({ response: { status: 404 }, status: 500 })).toBe(404)
  })

  it('reads 0 for an error with no status', () => {
    expect(httpStatus(new Error('boom'))).toBe(0)
    expect(httpStatus(null)).toBe(0)
    expect(httpStatus(undefined)).toBe(0)
  })
})
