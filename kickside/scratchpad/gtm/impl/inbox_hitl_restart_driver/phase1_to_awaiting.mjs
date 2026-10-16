import {
  BASE, openAuthenticated, sleep, assert, clickText, fillPlaceholder, fillLabeled,
  clickDialogAction,
  controlSnapshot, pickPrincipal, dropPalette, nodes, selectNode, connect, waitForText,
  deepText, shot, writeCheckpoint, appendReport, observeIds,
} from './common.mjs'

const observed = { runId: '', inboxItemId: '' }
const evidence = []
const title = `CODEX-HITL-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`
const intent = `Create an urgent finance approval for the restart proof. Ask "Approve invoice payment?".
Use context expression output.invoice. Collect a required text field named reason in a JSON form schema.
Label approve "Pay invoice" and reject "Hold invoice". Time out after 86400 seconds.`

const { context, page, consoleErrors } = await openAuthenticated()
let assistResponse = null
page.on('response', async (response) => {
  if (!response.url().includes('/assist/config')) return
  let body = null
  try { body = await response.json() } catch {}
  assistResponse = { status: response.status(), body }
})
observeIds(page, observed)
try {
  await page.goto(`${BASE}/c/app.views:main/workflows`, { waitUntil: 'domcontentloaded' }); await sleep(2500)
  assert(await clickText(page, 'New workflow'), 'New workflow action missing')
  assert(await fillPlaceholder(page, 'Name your workflow', title), 'Workflow name control missing')
  assert(await clickText(page, 'Create'), 'Create workflow action missing'); await sleep(3500)
  const workflowId = page.url().match(/workflows\/([0-9a-f-]{20,})/)?.[1]
  assert(workflowId, 'Workflow id was not visible in the editor URL')
  evidence.push(await shot(page, '01-created-workflow'))

  const dropped = await dropPalette(page, 'Inbox review', 0.48, 0.5)
  assert(dropped.ok, `Inbox review palette item could not be dropped: ${JSON.stringify(dropped)}`); await sleep(1800)
  let graph = await nodes(page)
  const review = graph.find((node) => /Inbox review/i.test(node.text))
  const start = graph.find((node) => /Start/i.test(node.text))
  const finish = graph.find((node) => /Finish/i.test(node.text))
  assert(review && start && finish, 'Start, Inbox review, and Finish must all be visible on the canvas')
  assert(await selectNode(page, review.id), 'Inbox review node could not be selected'); await sleep(700)

  assert(await fillPlaceholder(page, 'Explain how this step should behave', intent), 'Describe-this-step input missing')
  assert(await clickText(page, 'Draft with AI'), 'Draft with AI action missing')
  if (!await waitForText(page, 'Review drafted settings', 65_000)) {
    evidence.push(await shot(page, '02-ai-draft-failure'))
    const visible = (await deepText(page, 4000)).replace(/\s+/g, ' ')
    throw new Error(`AI draft preview did not appear; response=${JSON.stringify(assistResponse)} visible=${visible}`)
  }
  const preview = (await deepText(page)).toLowerCase()
  for (const label of ['prompt', 'context expression', 'form schema', 'approve label', 'reject label', 'priority', 'timeout seconds']) {
    assert(preview.includes(label), `AI preview omitted ${label}`)
  }
  evidence.push(await shot(page, '02-ai-draft-preview'))
  assert(await clickText(page, 'Accept'), 'AI draft Accept action missing'); await sleep(1200)

  const principalLabel = await pickPrincipal(page, 'admin')
  await sleep(900)
  assert(await fillLabeled(page, 'Approve label', 'Pay invoice now'), 'Accepted approve label was not editable')
  await sleep(900)
  const controlsBeforeReload = await controlSnapshot(page)
  const controlText = JSON.stringify(controlsBeforeReload).toLowerCase()
  const panelTextBeforeReload = (await deepText(page, 6000)).toLowerCase()
  for (const label of ['prompt', 'context expression', 'form schema', 'assignee', 'approve label', 'reject label', 'priority', 'timeout seconds']) {
    assert(controlText.includes(label) || panelTextBeforeReload.includes(label), `Declared control not inspectable: ${label}`)
  }
  assert(controlText.includes('pay invoice now'), 'Manual edit did not remain visible')
  assert(controlText.includes('urgent'), 'Priority control does not show urgent')
  assert(controlText.includes('86400'), 'Timeout control does not show 86400')
  evidence.push(await shot(page, '03-all-eight-controls'))

  for (const surface of [
    { width: 520, colorScheme: 'light', name: '03a-compact-light' },
    { width: 360, colorScheme: 'dark', name: '03b-compact-dark' },
  ]) {
    await page.setViewportSize({ width: surface.width, height: 820 })
    await page.emulateMedia({ colorScheme: surface.colorScheme })
    await sleep(500)
    const compactControls = JSON.stringify(await controlSnapshot(page)).toLowerCase()
    const compactPanelText = (await deepText(page, 6000)).toLowerCase()
    for (const label of ['prompt', 'context expression', 'form schema', 'assignee', 'approve label', 'reject label', 'priority', 'timeout seconds']) {
      assert(compactControls.includes(label) || compactPanelText.includes(label), `${surface.width}px ${surface.colorScheme} lost control: ${label}`)
    }
    evidence.push(await shot(page, surface.name))
  }
  await page.setViewportSize({ width: 1560, height: 1000 })
  await page.emulateMedia({ colorScheme: 'light' }); await sleep(500)

  await page.reload({ waitUntil: 'domcontentloaded' }); await sleep(3200)
  assert(await selectNode(page, review.id), 'Inbox review node missing after reload'); await sleep(800)
  const controlsAfterReload = await controlSnapshot(page)
  const persisted = JSON.stringify(controlsAfterReload).toLowerCase()
  const persistedPanelText = (await deepText(page, 6000)).toLowerCase()
  for (const expected of ['approve invoice payment?', 'pay invoice now', 'hold invoice', 'urgent', '86400']) {
    assert(persisted.includes(expected), `Reload lost visible setting: ${expected}`)
  }
  evidence.push(await shot(page, '04-reload-persistence'))
  assert(`${persisted}\n${persistedPanelText}`.includes(principalLabel.toLowerCase()), `Assignee did not hydrate after reload: ${principalLabel}`)

  // Every graph mutation remains a user gesture: real handle drags, no command/API writes.
  graph = await nodes(page)
  await connect(page, start.id, 'out-bottom', review.id, 'in-top')
  await connect(page, review.id, 'then', finish.id, 'in')
  await connect(page, review.id, 'else', finish.id, 'in')
  evidence.push(await shot(page, '05-wired-review'))

  assert(await clickText(page, 'Publish'), 'Publish action missing'); await sleep(800)
  if (await waitForText(page, 'Publish version', 3000)) assert(await clickText(page, 'Publish version', true), 'Publish confirmation missing')
  else assert(await clickText(page, 'Publish', true), 'Publish confirmation missing')
  await sleep(3500)
  evidence.push(await shot(page, '06-published'))

  assert(await clickText(page, 'Run'), 'Run action missing'); await sleep(700)
  // The toolbar opens Run-with-input; this workflow has no required Start input.
  assert(await clickDialogAction(page, 'Run with input', 'Run'), 'Run confirmation missing'); await sleep(1800)
  // The semantic run state is Awaiting; the canvas deliberately renders it in user voice
  // as "Waiting for approval". Assert the text people actually see, not an internal state
  // label that never appears in the product.
  if (!await waitForText(page, 'Waiting for approval', 30_000)) {
    evidence.push(await shot(page, '07-run-not-waiting'))
    throw new Error(`Run never showed Waiting for approval; run=${observed.runId || 'unobserved'} visible=${(await deepText(page, 4000)).replace(/\s+/g, ' ')}`)
  }
  evidence.push(await shot(page, '07-run-waiting-for-approval'))

  await page.goto(`${BASE}/c/app.views:main/inbox`, { waitUntil: 'domcontentloaded' }); await sleep(3000)
  assert(await waitForText(page, 'Approve invoice payment?', 15_000), 'Pending restart-proof Inbox item is not visible')
  evidence.push(await shot(page, '08-inbox-pending-before-restart'))
  assert(observed.runId, 'Run id was not observed from the UI launch response')
  assert(observed.inboxItemId, 'Inbox item id was not observed from the UI list response')

  const checkpoint = {
    phase: 'awaiting-before-restart', createdAt: new Date().toISOString(),
    workflowId, workflowTitle: title, reviewNodeId: review.id,
    runId: observed.runId, inboxItemId: observed.inboxItemId,
    selectedPrincipalLabel: principalLabel, controlsBeforeReload, controlsAfterReload,
    evidence, consoleErrors,
  }
  writeCheckpoint(checkpoint)
  appendReport(`## Phase 1 — ready for coordinated restart\n\n- Workflow: \`${workflowId}\` — ${title}\n- Inbox review node: \`${review.id}\`\n- Awaiting run: \`${observed.runId}\`\n- Pending Inbox item: \`${observed.inboxItemId}\`\n- Assignee selected through \`wc-principal-picker\`: ${principalLabel}\n- UI-only authoring: PASS\n- AI preview + explicit Accept: PASS\n- All eight controls inspectable; manual edit persisted across reload: PASS\n- Screenshots: ${evidence.map((file) => `\`${file}\``).join(', ')}\n- Console errors: ${consoleErrors.length ? consoleErrors.join('; ') : 'none'}\n\n**Checkpoint:** stop here. Restart has not been performed by this driver.`)
  console.log(`RESTART_READY workflow=${workflowId} run=${observed.runId} inbox=${observed.inboxItemId}`)
} finally {
  await context.close()
}
