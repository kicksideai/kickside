// Handles bare string, nested {message}, axios shapes. Pure — the 401 auth-expired
// side-effect some callers add stays at those call sites, so this never reaches into a host.
interface ApiErrorShape {
  response?: { data?: { error?: unknown } }
  message?: string
}

export function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const ax = e as ApiErrorShape
    const apiErr = ax.response?.data?.error
    if (typeof apiErr === 'string') return apiErr
    if (apiErr && typeof apiErr === 'object' && typeof (apiErr as { message?: unknown }).message === 'string') {
      return (apiErr as { message: string }).message
    }
    if (typeof ax.message === 'string' && ax.message) return ax.message
  }
  return fallback
}
