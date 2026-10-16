import { describe, expect, it } from 'vitest'
import { buildDbml, buildSql } from './export'

const tables = [
  {
    id: 't1', name: 'users', description: 'People',
    columns: [
      { id: 'c1', table_id: 't1', name: 'id', col_type: 'UUID', primary_key: true },
      { id: 'c2', table_id: 't1', name: 'email', col_type: 'TEXT', unique_col: true, nullable: false },
    ],
  },
  {
    id: 't2', name: 'orders',
    columns: [{ id: 'c3', table_id: 't2', name: 'user_id', col_type: 'UUID' }],
  },
  { id: 't3', name: 'drafts', columns: [] },
]
const relations = [
  { id: 'r1', from_table_id: 't2', to_table_id: 't1', from_column_id: 'c3', to_column_id: 'c1', relation_type: 'many_to_one' },
  { id: 'r2', from_table_id: 't3', to_table_id: 't1', relation_type: 'one_to_many' },
]

describe('SQL export', () => {
  const sql = buildSql(tables, relations)

  it('emits full column constraints', () => {
    expect(sql).toContain('id UUID PRIMARY KEY')
    expect(sql).toContain('email TEXT NOT NULL UNIQUE')
  })

  it('emits a real FK when both column ends are known', () => {
    expect(sql).toContain('ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users (id);')
  })

  it('documents column-less tables and table-level relations as comments', () => {
    expect(sql).toContain('-- drafts: no columns yet')
    expect(sql).not.toContain('CREATE TABLE drafts')
    expect(sql).toContain('-- FK drafts -> users (1:N)')
  })
})

describe('DBML export', () => {
  const dbml = buildDbml(tables, relations)

  it('emits tables with settings and notes', () => {
    expect(dbml).toContain('Table users {')
    expect(dbml).toContain('  id uuid [pk]')
    expect(dbml).toContain('  email text [unique, not null]')
    expect(dbml).toContain("  Note: 'People'")
  })

  it('emits column-less tables as valid empty blocks', () => {
    expect(dbml).toContain('Table drafts {')
  })

  it('maps cardinality to the DBML ref operator', () => {
    expect(dbml).toContain('Ref orders.user_id > users.id')
  })

  it('keeps table-level relations as comments', () => {
    expect(dbml).toContain('// Ref drafts < users (column ends not set)')
  })

  it('quotes identifiers outside the bare set', () => {
    const out = buildDbml([{ id: 'x', name: 'my table', columns: [{ id: 'y', table_id: 'x', name: 'a b', col_type: 'TEXT' }] }], [])
    expect(out).toContain('Table "my table" {')
    expect(out).toContain('  "a b" text')
  })
})
