// Generated from platform/workflows/src/types.lua. Run scripts/generate-vocabulary.mjs to update.
export const CMD = {
  NODE_ADD: 'node.add',
  NODE_UPDATE: 'node.update',
  NODE_REMOVE: 'node.remove',
  EDGE_ADD: 'edge.add',
  EDGE_UPDATE: 'edge.update',
  EDGE_REMOVE: 'edge.remove',
  NOTE_ADD: 'note.add',
  NOTE_UPDATE: 'note.update',
  NOTE_REMOVE: 'note.remove',
  LAYOUT_SET_POSITION: 'layout.set-position',
  LAYOUT_CLEAR_POSITION: 'layout.clear-position',
  LAYOUT_SET_VIEWPORT: 'layout.set-viewport',
  LAYOUT_SET_DIRECTION: 'layout.set-direction',
  PARAM_SET: 'param.set',
  LABELS_SET: 'labels.set',
} as const

export const EVENT = {
  NODE_ADDED: 'kickside.workflows.events:node.added',
  NODE_UPDATED: 'kickside.workflows.events:node.updated',
  NODE_REMOVED: 'kickside.workflows.events:node.removed',
  EDGE_ADDED: 'kickside.workflows.events:edge.added',
  EDGE_UPDATED: 'kickside.workflows.events:edge.updated',
  EDGE_REMOVED: 'kickside.workflows.events:edge.removed',
  NOTE_ADDED: 'kickside.workflows.events:note.added',
  NOTE_UPDATED: 'kickside.workflows.events:note.updated',
  NOTE_REMOVED: 'kickside.workflows.events:note.removed',
  LAYOUT_POSITION_SET: 'kickside.workflows.events:layout.position-set',
  LAYOUT_POSITION_CLEARED: 'kickside.workflows.events:layout.position-cleared',
  LAYOUT_VIEWPORT_SET: 'kickside.workflows.events:layout.viewport-set',
  LAYOUT_DIRECTION_SET: 'kickside.workflows.events:layout.direction-set',
  PARAM_SET: 'kickside.workflows.events:param.set',
  LABELS_SET: 'kickside.workflows.events:labels.set',
  VERSION_PUBLISHED: 'kickside.workflows.events:version.published',
  VERSION_RESTORED: 'kickside.workflows.events:version.restored',
} as const

export type CommandType = (typeof CMD)[keyof typeof CMD]
export type EventType = (typeof EVENT)[keyof typeof EVENT]

export const COMMAND_TO_EVENT = {
  [CMD.NODE_ADD]: EVENT.NODE_ADDED,
  [CMD.NODE_UPDATE]: EVENT.NODE_UPDATED,
  [CMD.NODE_REMOVE]: EVENT.NODE_REMOVED,
  [CMD.EDGE_ADD]: EVENT.EDGE_ADDED,
  [CMD.EDGE_UPDATE]: EVENT.EDGE_UPDATED,
  [CMD.EDGE_REMOVE]: EVENT.EDGE_REMOVED,
  [CMD.NOTE_ADD]: EVENT.NOTE_ADDED,
  [CMD.NOTE_UPDATE]: EVENT.NOTE_UPDATED,
  [CMD.NOTE_REMOVE]: EVENT.NOTE_REMOVED,
  [CMD.LAYOUT_SET_POSITION]: EVENT.LAYOUT_POSITION_SET,
  [CMD.LAYOUT_CLEAR_POSITION]: EVENT.LAYOUT_POSITION_CLEARED,
  [CMD.LAYOUT_SET_VIEWPORT]: EVENT.LAYOUT_VIEWPORT_SET,
  [CMD.LAYOUT_SET_DIRECTION]: EVENT.LAYOUT_DIRECTION_SET,
  [CMD.PARAM_SET]: EVENT.PARAM_SET,
  [CMD.LABELS_SET]: EVENT.LABELS_SET,
} as const satisfies Record<CommandType, EventType>
