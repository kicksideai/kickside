export const NOTE_COLORS = [
  { key: 'amber', hue: 'var(--wf-amber)' },
  { key: 'teal', hue: 'var(--wf-teal)' },
  { key: 'blue', hue: 'var(--wf-blue)' },
  { key: 'violet', hue: 'var(--wf-violet)' },
  { key: 'rose', hue: 'var(--wf-rose)' },
  { key: 'slate', hue: 'var(--wf-muted)' },
] as const

export function noteHue(color?: string): string {
  return NOTE_COLORS.find((candidate) => candidate.key === color)?.hue || 'var(--wf-amber)'
}

export function noteColorClass(color?: string): string {
  const key = NOTE_COLORS.find((candidate) => candidate.key === color)?.key || 'amber'
  return `wf-note--${key}`
}
