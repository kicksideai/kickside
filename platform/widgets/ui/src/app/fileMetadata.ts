// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
export function typeIcon(mime: string): string {
  const value = mime || ''
  if (value.startsWith('image/')) return 'tabler:photo'
  if (value === 'application/pdf') return 'tabler:file-type-pdf'
  if (value.includes('word') || value.includes('opendocument.text') || value === 'application/rtf') return 'tabler:file-type-doc'
  if (value.includes('sheet') || value.includes('excel') || value.includes('spreadsheet') || value === 'text/csv') return 'tabler:file-type-xls'
  if (value.includes('presentation') || value.includes('powerpoint')) return 'tabler:file-type-ppt'
  if (value === 'application/epub+zip') return 'tabler:book'
  if (value.startsWith('text/') || value === 'application/json' || value === 'application/xml') return 'tabler:file-text'
  return 'tabler:file'
}

export function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`
}
