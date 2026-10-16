import { api } from '@wippy-fe/proxy'
import { isDriveStatusResponse, type DriveStatus } from './drive-status'

// Every status reader uses the same validated, complete projection.
export async function readDriveStatus(id: string): Promise<DriveStatus> {
  const drives: DriveStatus['drives'] = []
  const pages = new Set<string>()
  let token: string | undefined
  let failures: DriveStatus['delivery_failures']
  do {
    const query = token ? `?page_token=${encodeURIComponent(token)}` : ''
    const { data } = await api.get<unknown>(`/api/v1/automations/${encodeURIComponent(id)}/status${query}`)
    if (!isDriveStatusResponse(data)) throw new Error('Invalid automation status response')
    drives.push(...data.drives)
    failures = data.delivery_failures
    token = data.next_page_token || undefined
    if (token && pages.has(token)) throw new Error('Automation status repeated a page token')
    if (token) pages.add(token)
  } while (token)
  return { drives, delivery_failures: failures }
}
