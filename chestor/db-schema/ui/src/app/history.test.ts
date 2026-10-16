import { describe, expect, it } from 'vitest'
import { EV, inverseBatch, inverseOf } from './history'

const state = {
  tables: [
    {
      id: 't1', name: 'users', description: 'People',
      layout: { x: 100, y: 60 },
      columns: [
        { id: 'c1', table_id: 't1', name: 'id', col_type: 'UUID', primary_key: true },
        { id: 'c2', table_id: 't1', name: 'email', col_type: 'TEXT', unique_col: true },
      ],
    },
    { id: 't2', name: 'orders', columns: [{ id: 'c3', table_id: 't2', name: 'user_id', col_type: 'UUID' }] },
  ],
  relations: [
    { id: 'r1', from_table_id: 't2', to_table_id: 't1', from_column_id: 'c3', to_column_id: 'c1', relation_type: 'many_to_one' },
  ],
}

describe('inverse commands', () => {
  it('inverts an add with a remove', () => {
    expect(inverseOf({ type: EV.TABLE_ADDED, body: { id: 'x' } }, state)).toEqual([
      { type: EV.TABLE_REMOVED, body: { id: 'x' } },
    ])
  })

  it('restores a removed table with its position, columns, and relations', () => {
    const inv = inverseOf({ type: EV.TABLE_REMOVED, body: { id: 't1' } }, state)!
    const types = inv.map(c => c.type)
    expect(types[0]).toBe(EV.TABLE_ADDED)
    expect(inv[0].body.name).toBe('users')
    expect(types).toContain(EV.LAYOUT_POSITION_SET)
    expect(inv.filter(c => c.type === EV.COLUMN_ADDED)).toHaveLength(2)
    expect(inv.filter(c => c.type === EV.RELATION_ADDED)).toHaveLength(1)
  })

  it('restores only the touched fields on an update', () => {
    const inv = inverseOf({ type: EV.TABLE_UPDATED, body: { id: 't1', name: 'members' } }, state)!
    expect(inv).toEqual([{ type: EV.TABLE_UPDATED, body: { id: 't1', name: 'users' } }])
  })

  it('restores prior column flags on a column update', () => {
    const inv = inverseOf({ type: EV.COLUMN_UPDATED, body: { id: 'c2', unique_col: false, name: 'mail' } }, state)!
    expect(inv[0].body).toEqual({ id: 'c2', name: 'email', unique_col: true })
  })

  it('restores a removed relation verbatim', () => {
    const inv = inverseOf({ type: EV.RELATION_REMOVED, body: { id: 'r1' } }, state)!
    expect(inv[0].type).toBe(EV.RELATION_ADDED)
    expect(inv[0].body.relation_type).toBe('many_to_one')
  })

  it('restores the prior layout position', () => {
    const inv = inverseOf({ type: EV.LAYOUT_POSITION_SET, body: { table_id: 't1', x: 500, y: 500 } }, state)!
    expect(inv[0].body).toEqual({ table_id: 't1', x: 100, y: 60 })
  })

  it('refuses unknown commands instead of recording a lie', () => {
    expect(inverseOf({ type: 'mystery', body: {} }, state)).toBeNull()
    expect(inverseBatch([{ type: 'mystery', body: {} }], state)).toBeNull()
  })

  it('inverts a batch in reverse order', () => {
    const inv = inverseBatch([
      { type: EV.TABLE_ADDED, body: { id: 'x' } },
      { type: EV.LAYOUT_POSITION_SET, body: { table_id: 't1', x: 9, y: 9 } },
    ], state)!
    expect(inv[0].body).toEqual({ table_id: 't1', x: 100, y: 60 })
    expect(inv[1]).toEqual({ type: EV.TABLE_REMOVED, body: { id: 'x' } })
  })
})
