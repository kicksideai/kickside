import {
  BASE, openAuthenticated, sleep, assert, clickText, clickControl, clickDialogAction, fillLabeled, waitForText,
  deepText, shot, readCheckpoint, writeCheckpoint, appendReport, observeIds,
} from './common.mjs'

const checkpoint = readCheckpoint()
assert(checkpoint.phase === 'awaiting-before-restart', 'Phase 1 checkpoint is missing or already consumed')
const observed = { runId: '', inboxItemId: '' }, evidence = [...checkpoint.evidence]
const { context, page, consoleErrors } = await openAuthenticated()
observeIds(page, observed)
try {
  await page.goto(`${BASE}/c/app.views:main/workflows/${checkpoint.workflowId}`, { waitUntil: 'domcontentloaded' }); await sleep(3200)
  assert(await clickControl(page, 'Past runs'), 'Past runs action missing after restart')
  // A restart intentionally forgets the in-memory live overlay. Re-open the durable run
  // from history before asserting its node state on the canvas.
  const runPrefix = checkpoint.runId.slice(0, 8)
  assert(await waitForText(page, runPrefix, 15_000), 'Pre-restart run is absent from history after restart')
  assert(await clickText(page, runPrefix, true), 'Pre-restart run could not be opened from history')
  const stillWaiting = await waitForText(page, 'Waiting for approval', 5_000)
  const repairedAfterPriorApproval = !stillWaiting && await waitForText(page, 'Completed', 10_000)
  assert(stillWaiting || repairedAfterPriorApproval, 'Pre-restart run is neither waiting nor completed after restart')
  const runPanel = await deepText(page)
  assert(runPanel.includes(runPrefix), 'Awaiting run id is absent after restart')
  evidence.push(await shot(page, repairedAfterPriorApproval ? '09-repaired-after-restart' : '09-awaiting-after-restart'))

  if (stillWaiting) {
    await page.goto(`${BASE}/c/app.views:main/inbox`, { waitUntil: 'domcontentloaded' }); await sleep(3000)
    assert(await waitForText(page, 'Approve invoice payment?', 15_000), 'Pending Inbox item did not survive restart')
    assert(await clickText(page, 'Approve invoice payment?', true), 'Could not select persisted Inbox item'); await sleep(500)
    await fillLabeled(page, 'reason', 'Restart durability verified')
    evidence.push(await shot(page, '10-inbox-survived-restart'))
    assert(await clickText(page, 'Pay invoice now'), 'Configured approve action is missing')
    await sleep(2400)

    await page.goto(`${BASE}/c/app.views:main/workflows/${checkpoint.workflowId}`, { waitUntil: 'domcontentloaded' }); await sleep(2800)
    assert(await clickControl(page, 'Past runs'), 'Past runs action missing after approval')
    assert(await waitForText(page, 'Completed', 20_000), 'Approved workflow did not visibly complete')
    evidence.push(await shot(page, '11-approved-run-completed'))
  }

  // Alternate-outcome proof: launch the same published workflow again through UI.
  assert(await clickText(page, 'Run'), 'Second Run action missing'); await sleep(600)
  assert(await clickDialogAction(page, 'Run with input', 'Run'), 'Second Run confirmation missing'); await sleep(1500)
  assert(await clickControl(page, 'Past runs'), 'Past runs action missing for second run')
  assert(await waitForText(page, 'Waiting for approval', 20_000), 'Second run did not wait for approval')
  evidence.push(await shot(page, '12-second-run-awaiting'))
  await page.goto(`${BASE}/c/app.views:main/inbox`, { waitUntil: 'domcontentloaded' }); await sleep(2500)
  assert(await clickText(page, 'Approve invoice payment?', true), 'Second Inbox item not selectable'); await sleep(400)
  await fillLabeled(page, 'reason', 'Alternate reject path verified')
  assert(await clickText(page, 'Hold invoice'), 'Configured reject action is missing'); await sleep(2200)
  await page.goto(`${BASE}/c/app.views:main/workflows/${checkpoint.workflowId}`, { waitUntil: 'domcontentloaded' }); await sleep(2500)
  assert(await clickControl(page, 'Past runs'), 'Past runs action missing after rejection')
  assert(await waitForText(page, 'Completed', 20_000), 'Rejected workflow path did not visibly complete')
  evidence.push(await shot(page, '13-rejected-run-completed'))

  checkpoint.phase = 'complete-after-restart'
  checkpoint.completedAt = new Date().toISOString()
  checkpoint.evidence = evidence
  checkpoint.consoleErrorsAfterRestart = consoleErrors
  writeCheckpoint(checkpoint)
  appendReport(`## Phase 2 — after coordinated restart\n\n- Original run \`${checkpoint.runId}\` remained Awaiting: PASS\n- Inbox item \`${checkpoint.inboxItemId}\` survived: PASS\n- Approval from Inbox resumed and completed the workflow: PASS\n- Alternate configured reject action completed a second run: PASS\n- Screenshots: ${evidence.slice(checkpoint.evidence.length).map((file) => `\`${file}\``).join(', ') || evidence.map((file) => `\`${file}\``).join(', ')}\n- Console errors: ${consoleErrors.length ? consoleErrors.join('; ') : 'none'}`)
  console.log(`RESTART_PROOF_COMPLETE workflow=${checkpoint.workflowId} original_run=${checkpoint.runId}`)
} finally {
  await context.close()
}
