import { describe, expect, it } from 'vitest'
import { CMD } from '../types'
import { boundaryScaffold } from './boundary-scaffold'

describe('new workflow boundary scaffold', () => {
  it('starts with required Start and Finish while leaving Error as an optional drop-in exit', () => {
    const commands = boundaryScaffold()
    const nodes = commands.filter((command) => command.type === CMD.NODE_ADD).map((command) => command.body)
    expect(nodes.map((node) => node.kind)).toEqual(['start', 'finish'])
    expect(nodes.some((node) => node.kind === 'error')).toBe(false)
  })
})
