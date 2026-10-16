export function sessionIdFromPath(path: string): string {
  if (!path.startsWith('/sessions/')) return ''
  const encoded = path.slice('/sessions/'.length).split('/')[0] || ''
  try { return decodeURIComponent(encoded) } catch { return '' }
}

export function sessionPath(sessionId: string): string {
  return `/sessions/${encodeURIComponent(sessionId)}`
}
