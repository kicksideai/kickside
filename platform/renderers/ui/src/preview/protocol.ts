export const ROWS_PER_PAGE = 25
export const COLUMNS_PER_PAGE = 20
export interface TableSize { name: string; rows: number; columns: number }
export interface TablePage { row: number; column: number }
export function pageNumber(value: number, total: number, size: number): number {
  return Math.max(0, Math.min(Number.isFinite(value) ? Math.floor(value) : 0, Math.max(0, Math.ceil(total / size) - 1)))
}
export type PreviewRequest =
  | { id: number; action: 'markdown'; source: string }
  | { id: number; action: 'workbook'; bytes: ArrayBuffer }
  | { id: number; action: 'page'; table: number; page: TablePage }
export type PreviewResult =
  | { kind: 'markdown'; tables: TableSize[]; pages: TablePage[]; html: string }
  | { kind: 'workbook'; tables: TableSize[]; pages: TablePage[]; active: number; cells: string[][] }
export type PreviewReply = { id: number; result: PreviewResult } | { id: number; error: string }
