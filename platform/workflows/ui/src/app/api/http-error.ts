// Shared reading of an HTTP status code off a caught request error. Axios shapes it
// as err.response.status; tolerant of an already-flat { status } error too.

export function httpStatus(e: unknown): number {
  const r = e as { response?: { status?: number }; status?: number } | null
  return Number(r?.response?.status ?? r?.status ?? 0)
}
