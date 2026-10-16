// The server's types.lua is the declaration. Fail on syntax we cannot derive;
// never guess wire names or silently omit an entry.
import { readFileSync, writeFileSync } from 'node:fs'
const source = readFileSync(new URL('../src/types.lua', import.meta.url), 'utf8')
const target = new URL('../ui/src/app/vocabulary.generated.ts', import.meta.url)
function table(name, pattern, value) {
  const body = source.match(new RegExp(`M\\.${name} = \\{([\\s\\S]*?)\\n\\}`))?.[1]
  if (!body) throw new Error(`Missing ${name} declaration`)
  const entries = body.replace(/--[^\n]*/g, '').split('\n').map(s => s.trim()).filter(Boolean)
  return entries.map(line => {
    const match = line.match(pattern)
    if (!match) throw new Error(`Unsupported ${name} declaration: ${line}`)
    return value(match)
  })
}
const namespace = source.match(/local EVENT_NS = "([^"]+)"/)?.[1]
if (!namespace) throw new Error('Missing EVENT_NS declaration')
const commands = table('COMMAND', /^(\w+) = "([^"]+)",$/, m => [m[1], m[2]])
const events = table('EVENT', /^(\w+) = EVENT_NS \.\. "([^"]+)",$/, m => [m[1], namespace + m[2]])
const mapping = table('COMMAND_TO_EVENT', /^\[M\.COMMAND\.(\w+)\] = M\.EVENT\.(\w+),$/, m => [m[1], m[2]])
if (mapping.length !== commands.length || new Set(mapping.map(([c]) => c)).size !== commands.length) throw new Error('Incomplete command/event mapping')
for (const [c, e] of mapping) {
  if (!commands.some(([key]) => key === c) || !events.some(([key]) => key === e)) throw new Error(`Invalid mapping ${c} -> ${e}`)
}
function constants(name, entries) {
  return `export const ${name} = {\n${entries.map(([k, v]) => `  ${k}: '${v}',`).join('\n')}\n} as const\n`
}
const output = '// Generated from platform/workflows/src/types.lua. Run scripts/generate-vocabulary.mjs to update.\n' +
  constants('CMD', commands) + '\n' + constants('EVENT', events) +
  '\nexport type CommandType = (typeof CMD)[keyof typeof CMD]\n' +
  'export type EventType = (typeof EVENT)[keyof typeof EVENT]\n' +
  '\nexport const COMMAND_TO_EVENT = {\n' + mapping.map(([c, e]) => `  [CMD.${c}]: EVENT.${e},`).join('\n') + '\n} as const satisfies Record<CommandType, EventType>\n'
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Workflow vocabulary is stale; run platform/workflows/scripts/generate-vocabulary.mjs')
} else writeFileSync(target, output)
