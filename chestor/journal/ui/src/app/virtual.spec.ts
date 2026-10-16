import { describe, expect, it } from 'vitest'
import { indexAt, offsetOf, scrollToShow, windowFor } from './virtual'

const rows = 40
const height = 400

describe('list window', () => {
  it('draws what the viewport resolves plus the overscan margin', () => {
    const view = windowFor(0, height, rows, 500, 4)
    expect(view.start).toBe(0)
    expect(view.end).toBe(14)
    const scrolled = windowFor(4000, height, rows, 500, 4)
    expect(scrolled.start).toBe(96)
    expect(scrolled.end).toBe(114)
  })

  it('pads the rows it leaves out, so the scrollbar measures the whole list', () => {
    const view = windowFor(4000, height, rows, 500)
    const drawn = (view.end - view.start) * rows
    expect(view.padTop).toBe(view.start * rows)
    expect(view.padBottom).toBe((500 - view.end) * rows)
    expect(view.padTop + drawn + view.padBottom).toBe(500 * rows)
  })

  it('answers nothing for an empty list', () => {
    expect(windowFor(0, height, rows, 0)).toEqual({ start: 0, end: 0, padTop: 0, padBottom: 0 })
  })

  it('returns the whole range when the viewport is taller than the list', () => {
    const view = windowFor(0, 2000, rows, 12)
    expect(view).toEqual({ start: 0, end: 12, padTop: 0, padBottom: 0 })
  })

  it('holds both ends when the scroll position runs past the list', () => {
    const above = windowFor(-900, height, rows, 500)
    expect(above.start).toBe(0)
    expect(above.padTop).toBe(0)
    const below = windowFor(99_000, height, rows, 500)
    expect(below.start).toBeLessThan(500)
    expect(below.end).toBe(500)
    expect(below.padBottom).toBe(0)
    expect(below.padTop + (below.end - below.start) * rows).toBe(500 * rows)
  })

  it('keeps at least one row in the window while the list has any', () => {
    expect(windowFor(0, 0, rows, 500, 0)).toMatchObject({ start: 0, end: 1 })
  })

  it('reads a row from an offset and an offset from a row', () => {
    expect(indexAt(0, rows, 500)).toBe(0)
    expect(indexAt(rows * 3 + 5, rows, 500)).toBe(3)
    expect(indexAt(-40, rows, 500)).toBe(0)
    expect(indexAt(rows * 900, rows, 500)).toBe(499)
    expect(indexAt(100, rows, 0)).toBe(0)
    expect(offsetOf(3, rows)).toBe(120)
    expect(offsetOf(-2, rows)).toBe(0)
  })
})

describe('scrolling a row into view', () => {
  it('leaves the reader where they are when the row is already whole on screen', () => {
    expect(scrollToShow(12, 480, height, rows)).toBe(480)
    expect(scrollToShow(12, 300, height, rows)).toBe(300)
  })

  it('moves the shortest distance that shows the row', () => {
    // A row above the viewport comes to the top edge, one below to the bottom.
    expect(scrollToShow(4, 800, height, rows)).toBe(160)
    expect(scrollToShow(30, 0, height, rows)).toBe(31 * rows - height)
  })

  it('never asks for a scroll position above the first row', () => {
    expect(scrollToShow(0, 0, height, rows)).toBe(0)
    expect(scrollToShow(2, -50, height, rows)).toBe(0)
  })
})
