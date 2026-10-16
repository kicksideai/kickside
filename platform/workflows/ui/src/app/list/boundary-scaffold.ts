import * as C from '../api/commands'

const EMPTY_SCHEMA = { type: 'object', properties: {} }

// A new workflow starts with only its required callable contract. Error is an optional
// exit authors add from Structure when they need a typed failure result.
export function boundaryScaffold(): C.Command[] {
  const start = C.uid()
  const finish = C.uid()
  return [
    C.addNode({ id: start, kind: 'start', title: 'Start', config: { input_schema: EMPTY_SCHEMA } }),
    C.setPosition(start, 240, 80),
    C.addNode({ id: finish, kind: 'finish', title: 'Finish', config: { output_schema: EMPTY_SCHEMA } }),
    C.setPosition(finish, 240, 340),
  ]
}
