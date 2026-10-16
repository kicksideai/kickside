import { BASE, openAuthenticated, sleep, assert, clickText, clickDialogAction, waitForText, deepText } from './common.mjs'

const workflowId = process.argv[2]
assert(workflowId, 'workflow id is required')
const { context, page } = await openAuthenticated()
try {
  await page.goto(`${BASE}/c/app.views:main/workflows/${workflowId}`, { waitUntil: 'domcontentloaded' })
  await sleep(3000)
  assert(await clickText(page, 'Run'), 'Run action missing')
  await sleep(500)
  assert(await clickDialogAction(page, 'Run with input', 'Run'), 'Run confirmation missing')
  const waiting = await waitForText(page, 'Waiting for approval', 20_000)
  console.log(JSON.stringify({ waiting, visible: (await deepText(page, 2500)).replace(/\s+/g, ' ') }))
} finally {
  await context.close()
}
