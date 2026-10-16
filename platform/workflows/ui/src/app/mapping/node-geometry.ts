import type { OutPort } from '../domain/node-policy'

export interface NodeDimensions {
  width: number
  height: number
  columns: number
  rows: number
  cellWidth: number
}

export const BASE_NODE_WIDTH = 216
export const BASE_NODE_HEIGHT = 76
export const PORT_LABEL_MIN_WIDTH = 64
export const PORT_GAP = 6
export const PORT_SIDE_INSET = 10
export const PORT_ROW_GUTTER = PORT_SIDE_INSET * 2
export const FAILED_PORT_GUTTER = 34
export const PORT_MAX_COLUMNS = 4
export const PORT_ROW_HEIGHT = 26
export const PORT_NODE_MAX_WIDTH = 304
export const PORT_BASE_BOTTOM_PADDING = 20

// One capacity rule for rendering and every graph-geometry consumer. Named outcomes are
// never squeezed or allowed to turn one node into a page-wide bar. Common one/two-way
// outcomes keep the compact card. Larger declarations use a bounded four-column grid and
// grow downward one row at a time. A generalized Failed face owns a right gutter; its grid
// drops to three columns when needed so every outcome still gets a readable 64px cell.
export function nodeDimensionsForPorts(outPorts: OutPort[], failedPort = false): NodeDimensions {
  const named = outPorts.length > 1 || (outPorts[0]?.id ?? '') !== ''
  const count = named ? Math.max(outPorts.length, 1) : 0
  const failedGutter = failedPort ? FAILED_PORT_GUTTER : 0
  const capacity = Math.max(1, Math.floor((PORT_NODE_MAX_WIDTH - PORT_ROW_GUTTER - failedGutter + PORT_GAP) / (PORT_LABEL_MIN_WIDTH + PORT_GAP)))
  const columns = count ? Math.min(count, PORT_MAX_COLUMNS, capacity) : 0
  const rows = count ? Math.ceil(count / columns) : 0
  const idealWidth = count <= 2
    ? BASE_NODE_WIDTH
    : PORT_ROW_GUTTER + failedGutter + columns * PORT_LABEL_MIN_WIDTH + (columns - 1) * PORT_GAP
  const width = Math.min(PORT_NODE_MAX_WIDTH, Math.max(BASE_NODE_WIDTH, idealWidth))
  const cellWidth = columns
    ? Math.floor((width - PORT_ROW_GUTTER - failedGutter - (columns - 1) * PORT_GAP) / columns)
    : 0
  return {
    width,
    height: BASE_NODE_HEIGHT + Math.max(0, rows - 1) * PORT_ROW_HEIGHT,
    columns,
    rows,
    cellWidth,
  }
}
