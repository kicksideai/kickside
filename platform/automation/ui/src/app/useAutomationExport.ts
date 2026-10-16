import type { Ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { errMsg } from '@widgets/app/errMsg'
import type { Automation } from './automation-types'

export function useAutomationExport(exportId: Ref<string>, error: Ref<string>, pretty: (automation: Automation) => string) {
  async function exportAutomation(automation: Automation) {
    exportId.value = automation.id
    error.value = ''
    try {
      const { data } = await api.get(`/api/v1/automations/${encodeURIComponent(automation.id)}/export`)
      if (!data?.success || !data.artifact) {
        throw new Error(data?.error?.message || data?.error || 'Automation export failed.')
      }
      const base = pretty(automation).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'automation'
      const blob = new Blob([`${JSON.stringify(data.artifact, null, 2)}\n`], { type: 'application/json' })
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = `${base}.automation.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(href)
    } catch (cause) {
      error.value = errMsg(cause, 'Automation export failed.')
    } finally {
      exportId.value = ''
    }
  }

  return { exportAutomation }
}
