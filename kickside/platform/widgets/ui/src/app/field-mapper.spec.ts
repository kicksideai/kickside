import { describe, it, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import FieldMapper from './FieldMapper.vue'
import {
  buildSourceTree, rootSourceField, targetFields, defaultMappingFields, mappingFieldExpr,
  buildObjectExpression, unmappedRequired, completenessLine, typeCompatible, pillCompat,
  parseObjectExpression, seedRows, decodeSchema, mappingExprText, renameRootVar,
  passThroughMapping, type MappingField,
} from './field-mapper'

const SRC = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    amount: { type: 'number', description: 'total in cents' },
    customer: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        name: { type: 'string' },
      },
    },
    tags: { type: 'array' },
  },
}

const TGT = {
  type: 'object',
  required: ['email', 'total'],
  properties: {
    email: { type: 'string', title: 'Email' },
    total: { type: 'number', title: 'Total' },
    note: { type: 'string' },
  },
}

describe('buildSourceTree — pills, nesting, root prefix', () => {
  it('renders top-level fields with the root-prefixed expression and declared type', () => {
    const t = buildSourceTree(SRC, 'output')
    const id = t.find(f => f.name === 'id')
    expect(id?.expr).toBe('output.id')
    expect(id?.type).toBe('string')
    const amount = t.find(f => f.name === 'amount')
    expect(amount?.type).toBe('number')
    expect(amount?.description).toBe('total in cents')
  })

  it('nests object fields with dotted paths and honors the source root', () => {
    const t = buildSourceTree(SRC, 'input')
    const customer = t.find(f => f.name === 'customer')!
    expect(customer.type).toBe('object')
    expect(customer.expandable).toBe(true)
    const email = customer.children.find(c => c.name === 'email')!
    expect(email.path).toBe('customer.email')
    expect(email.expr).toBe('input.customer.email')
    expect(email.depth).toBe(1)
  })

  it('treats a property-only field as an object and an untyped one as any', () => {
    const t = buildSourceTree({ properties: { a: {}, b: { properties: { c: {} } } } })
    expect(t.find(f => f.name === 'a')?.type).toBe('any')
    expect(t.find(f => f.name === 'b')?.type).toBe('object')
  })

  it('is empty for an absent or scalar schema; rootSourceField names the whole value', () => {
    expect(buildSourceTree(undefined)).toEqual([])
    expect(buildSourceTree({ type: 'string' })).toEqual([])
    expect(rootSourceField({ type: 'string' }, 'output')?.expr).toBe('output')
    expect(rootSourceField({ type: 'string' }, 'output')?.type).toBe('string')
    // An object-with-fields has no whole-value root pill (its fields are the pills).
    expect(rootSourceField(SRC)).toBeNull()
    expect(rootSourceField(undefined)).toBeNull()
  })

  it('parses a stringified schema', () => {
    expect(buildSourceTree(JSON.stringify(SRC)).map(f => f.name)).toContain('customer')
  })
})

describe('targetFields', () => {
  it('reads keys in order with title/type/required/description', () => {
    const fields = targetFields(TGT)
    expect(fields.map(f => f.key)).toEqual(['email', 'total', 'note'])
    expect(fields.find(f => f.key === 'email')?.required).toBe(true)
    expect(fields.find(f => f.key === 'email')?.title).toBe('Email')
    expect(fields.find(f => f.key === 'note')?.required).toBe(false)
  })

  it('is empty for a non-object schema', () => {
    expect(targetFields('not json')).toEqual([])
    expect(targetFields({ type: 'string' })).toEqual([])
  })
})

describe('pill -> expression generation and static literals', () => {
  it('emits a raw expression right-hand side (the pill path) verbatim', () => {
    expect(mappingFieldExpr({ key: 'email', mode: 'expr', value: 'output.customer.email' }))
      .toBe('output.customer.email')
  })

  it('emits typed static literals', () => {
    expect(mappingFieldExpr({ key: 'note', mode: 'static', value: 'hi', type: 'string' })).toBe('"hi"')
    expect(mappingFieldExpr({ key: 'total', mode: 'static', value: '5', type: 'integer' })).toBe('5')
    expect(mappingFieldExpr({ key: 'live', mode: 'static', value: 'true', type: 'boolean' })).toBe('true')
    expect(mappingFieldExpr({ key: 'total', mode: 'static', value: 'abc', type: 'number' })).toBe('0')
  })

  it('contributes nothing when skipped or empty', () => {
    expect(mappingFieldExpr({ key: 'note', mode: 'skip', value: 'x' })).toBeNull()
    expect(mappingFieldExpr({ key: 'note', mode: 'static', value: '' })).toBeNull()
    expect(mappingFieldExpr({ key: 'note', mode: 'expr', value: '  ' })).toBeNull()
  })

  it('compiles the rows into one object expression, or empty when nothing contributes', () => {
    const rows: MappingField[] = [
      { key: 'email', mode: 'expr', value: 'output.customer.email' },
      { key: 'total', mode: 'static', value: '10', type: 'number' },
      { key: 'note', mode: 'skip', value: '' },
    ]
    expect(buildObjectExpression(rows)).toBe('{ email: output.customer.email, total: 10 }')
    expect(buildObjectExpression([{ key: 'a', mode: 'skip', value: '' }])).toBe('')
    expect(buildObjectExpression([])).toBe('')
  })
})

describe('required tracking + completeness', () => {
  it('lists required targets with nothing mapped', () => {
    const fields = targetFields(TGT)
    const mapping: MappingField[] = [
      { key: 'email', mode: 'expr', value: 'output.id' },
      { key: 'total', mode: 'static', value: '' },
    ]
    expect(unmappedRequired(fields, mapping)).toEqual(['Total'])
    expect(completenessLine(fields, mapping)).toBe('1 required field unmapped')
  })

  it('recognizes same-name compatible fields carried by an unchanged payload', () => {
    const source = {
      type: 'object',
      properties: { email: { type: 'string' }, total: { type: 'integer' }, other: { type: 'string' } },
    }
    expect(passThroughMapping(source, TGT)).toEqual([
      { key: 'email', mode: 'expr', value: 'output.email', type: 'string' },
      { key: 'total', mode: 'expr', value: 'output.total', type: 'number' },
    ])
    expect(unmappedRequired(targetFields(TGT), passThroughMapping(source, TGT))).toEqual([])
  })

  it('does not claim pass-through for missing or incompatible source fields', () => {
    const source = { type: 'object', properties: { email: { type: 'number' } } }
    expect(passThroughMapping(source, TGT)).toEqual([])
  })

  it('is complete once every required field is mapped', () => {
    const fields = targetFields(TGT)
    const mapping: MappingField[] = [
      { key: 'email', mode: 'expr', value: 'output.customer.email' },
      { key: 'total', mode: 'static', value: '9', type: 'number' },
    ]
    expect(unmappedRequired(fields, mapping)).toEqual([])
    expect(completenessLine(fields, mapping)).toBe('')
  })

  it('defaults required fields to static (still unmapped) and optionals to skip', () => {
    const d = defaultMappingFields(targetFields(TGT))
    expect(d.find(f => f.key === 'email')?.mode).toBe('static')
    expect(d.find(f => f.key === 'note')?.mode).toBe('skip')
    // A blank required default still reads as unmapped.
    expect(unmappedRequired(targetFields(TGT), d)).toEqual(['Email', 'Total'])
  })
})

describe('type compatibility', () => {
  it('matches equal types and numeric widening, admits any', () => {
    expect(typeCompatible('string', 'string')).toBe(true)
    expect(typeCompatible('integer', 'number')).toBe(true)
    expect(typeCompatible('any', 'object')).toBe(true)
    expect(typeCompatible('string', 'number')).toBe(false)
  })

  it('gives a neutral verdict when a side is absent or any', () => {
    expect(pillCompat('string', 'string')).toBe('ok')
    expect(pillCompat('string', 'number')).toBe('mismatch')
    expect(pillCompat('any', 'string')).toBe('neutral')
    expect(pillCompat(undefined, 'string')).toBe('neutral')
  })
})

describe('parseObjectExpression + seedRows (round-trip)', () => {
  it('decomposes a flat object literal, keeping later ternary colons in the rhs', () => {
    const pairs = parseObjectExpression('{ topic: "Weekly digest", count: input.type == "cron" ? 10 : 1 }')
    expect(pairs).toEqual([
      { key: 'topic', rhs: '"Weekly digest"' },
      { key: 'count', rhs: 'input.type == "cron" ? 10 : 1' },
    ])
  })

  it('returns null for anything that is not a flat object literal', () => {
    expect(parseObjectExpression('output.id')).toBeNull()
    expect(parseObjectExpression('{ 1bad: x }')).toBeNull()
    expect(parseObjectExpression('{ unbalanced: (a }')).toBeNull()
    expect(parseObjectExpression('{}')).toEqual([])
  })

  it('round-trips a generated expression back into rows against the target schema', () => {
    const expr = buildObjectExpression([
      { key: 'email', mode: 'expr', value: 'output.customer.email' },
      { key: 'total', mode: 'static', value: '10', type: 'number' },
    ])
    const seeded = seedRows(TGT, expr)
    expect(seeded.raw).toBe('')
    expect(seeded.rows.find(r => r.key === 'email')).toMatchObject({ mode: 'expr', value: 'output.customer.email' })
    // Recompiling the seeded rows yields the same expression.
    expect(buildObjectExpression(seeded.rows)).toBe(expr)
  })

  it('preserves a complex or extra-key expression verbatim as raw', () => {
    const complex = 'someFunc(output)'
    expect(seedRows(TGT, complex).raw).toBe(complex)
    const extra = '{ email: output.a, unknown: output.b }'
    expect(seedRows(TGT, extra).raw).toBe(extra)
  })

  it('opens default rows for a blank expression', () => {
    const seeded = seedRows(TGT, '')
    expect(seeded.raw).toBe('')
    expect(seeded.rows.map(r => r.key)).toEqual(['email', 'total', 'note'])
  })
})

describe('mappingExprText — stored transform to expression text', () => {
  it('extracts the expr from the backend mapping-spec object', () => {
    expect(mappingExprText({ v: 1, mode: 'expr', expr: '{ query: input.data_ids[1] }' }))
      .toBe('{ query: input.data_ids[1] }')
  })
  it('passes a bare string through', () => {
    expect(mappingExprText('{ query: output.topic }')).toBe('{ query: output.topic }')
  })
  it('reads an empty spec, array or null as no transform, never "[object Object]"', () => {
    expect(mappingExprText({})).toBe('')
    expect(mappingExprText([])).toBe('')
    expect(mappingExprText(null)).toBe('')
    expect(mappingExprText({ v: 1, mode: 'llm_runtime' })).toBe('')
    expect(mappingExprText('  ')).toBe('')
    expect(mappingExprText('{}')).toBe('{}')
    expect(mappingExprText('{   }')).toBe('{   }')
    expect(mappingExprText('[]')).toBe('[]')
    expect(mappingExprText('[   ]')).toBe('[   ]')
    expect(mappingExprText('input')).toBe('')
    expect(mappingExprText({ v: 1, mode: 'expr', expr: ' output ' })).toBe('')
    // The regression guard: the object form must not stringify to the placeholder text.
    expect(mappingExprText({ v: 1, mode: 'expr', expr: '{ a: input.b }' })).not.toContain('[object Object]')
  })
})

describe('renameRootVar — input/output bridge', () => {
  it('renames the root identifier only at identifier boundaries', () => {
    expect(renameRootVar('{ query: input.data_ids[1] }', 'input', 'output'))
      .toBe('{ query: output.data_ids[1] }')
  })
  it('leaves a longer identifier and quoted contents intact', () => {
    // `inputs` is a distinct identifier; a quoted "input" is data, not a variable.
    expect(renameRootVar('{ content: input, source_url: inputs.default.content.url }', 'input', 'output'))
      .toBe('{ content: output, source_url: inputs.default.content.url }')
    expect(renameRootVar('{ label: "input", v: input.x }', 'input', 'output'))
      .toBe('{ label: "input", v: output.x }')
  })
  it('is its own inverse for the round-trip (output->input->output)', () => {
    const authored = '{ query: output.data_ids[1], note: output.topic }'
    const stored = renameRootVar(authored, 'output', 'input')
    expect(stored).toBe('{ query: input.data_ids[1], note: input.topic }')
    expect(renameRootVar(stored, 'input', 'output')).toBe(authored)
  })
})

describe('decodeSchema', () => {
  it('parses strings and passes objects through, rejecting arrays and junk', () => {
    expect(decodeSchema('{"type":"object"}')).toEqual({ type: 'object' })
    expect(decodeSchema({ type: 'object' })).toEqual({ type: 'object' })
    expect(decodeSchema('nope')).toBeNull()
    expect(decodeSchema([1, 2])).toBeNull()
  })
})

describe('FieldMapper.vue — interaction', () => {
  function mountMapper(props: Record<string, unknown> = {}) {
    return mount(FieldMapper, {
      props: { sourceSchema: SRC, targetSchema: TGT, sourceRoot: 'output', resetKey: 'k1', ...props },
    })
  }

  it('renders source pills and target rows with a required-unmapped count', async () => {
    const w = mountMapper()
    await flushPromises()
    expect(w.findAll('.fm-pill').length).toBeGreaterThanOrEqual(4)
    expect(w.find('[data-test="fm-row-email"]').exists()).toBe(true)
    expect(w.find('.fm-status--warn').text()).toContain('2 required fields unmapped')
  })

  it('maps a clicked pill into a clicked target row and emits the object expression', async () => {
    const w = mountMapper()
    await flushPromises()
    // Select the id pill (first top-level), then activate the email row.
    const idPill = w.findAll('.fm-pill').find(p => p.text().includes('id'))!
    await idPill.trigger('click')
    expect(w.find('.fm-armbar').exists()).toBe(true)
    await w.find('[data-test="fm-row-email"] .fm-row-hd').trigger('click')
    const emitted = w.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1][0]).toBe('{ email: output.id }')
  })

  it('expands a nested object pill to reveal its children', async () => {
    const w = mountMapper()
    await flushPromises()
    expect(w.findAll('.fm-pill').some(p => p.text().includes('email') && p.text().includes('name'))).toBe(false)
    await w.find('.fm-twist').trigger('click')
    await flushPromises()
    // The nested customer.email pill is now visible.
    expect(w.findAll('.fm-pill').some(p => p.text().startsWith('email'))).toBe(true)
  })

  it('drops into the raw escape hatch and back, preserving the expression', async () => {
    const w = mountMapper({ modelValue: '{ email: output.customer.email }' })
    await flushPromises()
    // Seeded into rows (not raw) since it decomposes cleanly.
    expect(w.find('.fm-raw-input').exists()).toBe(false)
    await w.find('.fm-linkbtn').trigger('click')
    expect((w.find('.fm-raw-input').element as HTMLTextAreaElement).value).toContain('output.customer.email')
  })

  it('falls back to a single raw expression when the target declares no fields', async () => {
    const w = mountMapper({ targetSchema: { type: 'string' }, modelValue: 'makePayload(output)' })
    await flushPromises()
    expect(w.find('.fm-raw-input').exists()).toBe(true)
    expect(w.find('[data-test="fm-row-email"]').exists()).toBe(false)
  })

  it.each([
    ['a new edge', ''],
    ['a whitespace-only expression', '   '],
  ])('does not claim a custom mapping for empty Start -> Finish schemas on %s', async (_case, modelValue) => {
    const empty = { type: 'object', properties: {} }
    const w = mountMapper({
      sourceSchema: empty,
      targetSchema: empty,
      sourceTitle: 'From Start',
      targetTitle: 'Into Finish',
      modelValue,
      simple: true,
    })
    await flushPromises()

    expect(w.find('.fm-status--warn').exists()).toBe(false)
    expect(w.text()).toContain('This step takes no input fields')
    expect(w.text()).not.toContain('A custom mapping is configured')
    expect(w.find('.fm-raw-input').exists()).toBe(false)
    expect(w.find('.fm-linkbtn').exists()).toBe(false)
  })

  it('keeps the same calm no-mapping state when only the source declares fields', async () => {
    const w = mountMapper({ targetSchema: { type: 'object', properties: {} }, modelValue: '', simple: true })
    await flushPromises()

    expect(w.find('.fm-status--warn').exists()).toBe(false)
    expect(w.text()).toContain('No mapping needed')
    expect(w.text()).not.toContain('No fields are available from the previous step yet')
    expect(w.text()).not.toContain('A custom mapping is configured')
  })

  it('keeps a real transform inspectable when the target declares no fields', async () => {
    const empty = { type: 'object', properties: {} }
    const w = mountMapper({ sourceSchema: empty, targetSchema: empty, modelValue: 'makePayload(output)', simple: true })
    await flushPromises()

    expect(w.text()).toContain('A custom mapping is configured')
    await w.get('.fm-linkbtn').trigger('click')
    expect((w.get('.fm-raw-input').element as HTMLTextAreaElement).value).toBe('makePayload(output)')
  })

  it('keeps missing contracts out of raw-expression mode in the simple product surface', async () => {
    const w = mountMapper({ sourceSchema: undefined, targetSchema: undefined, simple: true, showAssist: true })
    await flushPromises()
    expect(w.text()).toContain('Input fields unavailable')
    expect(w.text()).toContain('input fields didn’t load')
    expect(w.find('.fm-raw-input').exists()).toBe(false)
    expect(w.find('.fm-ai').exists()).toBe(false)
    expect(w.text()).not.toContain('All required fields mapped')
  })

  it('hides technical row modes and expressions until Advanced mapping is opened', async () => {
    const w = mountMapper({ simple: true })
    await flushPromises()
    expect(w.find('.fm-mode').exists()).toBe(false)
    expect(w.find('.fm-input').exists()).toBe(false)
    expect(w.find('.fm-simple-value').exists()).toBe(true)
    await w.get('.fm-linkbtn').trigger('click')
    expect(w.find('.fm-mode').exists()).toBe(true)
    expect(w.find('.fm-input').exists()).toBe(true)
  })

  it('lets a target choose its source directly in simple mode without pre-arming a pill', async () => {
    const w = mountMapper({ simple: true })
    await flushPromises()
    const select = w.get('[data-test="fm-row-email"] .fm-simple-value')
    expect(select.element.tagName).toBe('SELECT')
    await select.setValue('output.id')
    const emitted = w.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]?.[0]).toBe('{ email: output.id }')
    expect((select.attributes('aria-label') ?? '').toLowerCase()).toContain('email')
  })

  it('shows compatible pass-through fields without materializing a transform', async () => {
    const schema = {
      type: 'object', required: ['code', 'message'],
      properties: { code: { type: 'string' }, message: { type: 'string' } },
    }
    const w = mountMapper({ sourceSchema: schema, targetSchema: schema, modelValue: '' })
    await flushPromises()
    expect(w.find('.fm-status--ok').text()).toContain('pass through unchanged')
    expect((w.find('[data-test="fm-row-code"] input').element as HTMLInputElement).value).toBe('output.code')
    const emitted = (w.emitted('update:modelValue') || []) as string[][]
    expect(emitted.every(([value]) => value === '')).toBe(true)
  })
})
