import fs from 'node:fs'
import { BASE, ROOT, openAuthenticated, sleep } from './common.mjs'

const { context, page } = await openAuthenticated()
try {
  await page.goto(`${BASE}/c/app.views:main/workflows`, { waitUntil: 'domcontentloaded' })
  await sleep(1200)
  const result = await page.evaluate(async () => {
    let token = ''
    try { token = JSON.parse(localStorage.getItem('@wippy_token_info') || '{}').token || '' } catch {}
    const read = async (url) => {
      const response = await fetch(url, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} })
      let body = null
      try { body = await response.json() } catch {}
      return { status: response.status, body }
    }
    const listed = await read('/api/v1/workflows')
    const rows = listed.body?.workflows || listed.body?.items || listed.body?.data?.items || []
    // The list API is newest-first; inspect the newest proof fixtures rather than the
    // oldest tail (which silently excluded the run currently under verification).
    const matches = rows.filter((row) => String(row.title || row.name || '').startsWith('CODEX-HITL-')).slice(0, 12)
    const details = []
    for (const row of matches) {
      const id = row.id || row.workflow_id
      const runs = id ? await read(`/api/v1/workflows/${encodeURIComponent(id)}/runs`) : null
      const runDetails = []
      for (const run of (runs?.body?.runs || []).slice(0, 3)) {
        const runId = run.run_id
        runDetails.push({
          runId,
          detail: await read(`/api/v1/workflows/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}`),
          events: await read(`/api/v1/workflows/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}/events`),
        })
      }
      details.push({ id, title: row.title || row.name, runs, runDetails })
    }
    const inbox = await read('/api/v1/inbox')
    return { listed: { status: listed.status, count: rows.length }, details, inbox }
  })
  fs.writeFileSync(`${ROOT}/latest_inspection.json`, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 })
  console.log(`inspection workflows=${result.details.length} inbox_status=${result.inbox?.status}`)
} finally {
  await context.close()
}
