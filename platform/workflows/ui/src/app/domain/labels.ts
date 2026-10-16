export function looksLikeId(value: string): boolean {
  const text = value.trim()
  if (!text || /\s/.test(text)) return false
  if (text.includes(':')) return true
  return /^[a-z0-9_-]+(\.[a-z0-9_-]+){2,}$/i.test(text)
}

export function leafOf(ref: string): string {
  const afterColon = ref.split(':').pop() || ref
  const afterDot = afterColon.split('.').pop() || afterColon
  return afterDot.split('/').pop() || afterDot
}

export function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

export function humanTitle(title?: string, ref?: string): string {
  const candidate = (title || '').trim()
  if (candidate && !looksLikeId(candidate)) return candidate
  const raw = candidate || (ref || '').trim()
  if (!raw) return ''
  return titleCase(leafOf(raw)) || raw
}
