import { open, login, api, shot, sleep } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const PID = 's9.crm.enrich.v1';
const { ctx, page } = await open();
try {
  await login(page);

  // S1: point listed
  const l1 = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('S1_LIST', l1.status, JSON.stringify(l1.body.points));

  // WC shot A: pre-bind state
  await page.evaluate(async (crm) => {
    for (let i = 0; i < 40 && !customElements.get('kickside-flow-points'); i++) await new Promise((r) => setTimeout(r, 250));
    document.querySelectorAll('#s9wc').forEach((e) => e.remove());
    const host = document.createElement('div'); host.id = 's9wc';
    host.style.cssText = 'position:fixed;inset:60px;z-index:99999;background:#fff;overflow:auto;padding:20px;border:1px solid #ccc;border-radius:8px';
    const el = document.createElement('kickside-flow-points');
    el.setAttribute('component-instance-id', crm);
    host.appendChild(el); document.body.appendChild(host);
  }, CRM);
  await sleep(3500);
  await shot(page, 's9_wc_state_prebind');
  const wcA = await page.evaluate(() => (document.querySelector('#s9wc')?.innerText || document.querySelector('#s9wc kickside-flow-points')?.shadowRoot?.textContent || '').slice(0, 500));
  const wcA2 = await page.evaluate(() => { const el = document.querySelector('#s9wc kickside-flow-points'); return el && el.shadowRoot ? el.shadowRoot.textContent.replace(/\s+/g, ' ').trim().slice(0, 600) : 'no-shadow'; });
  console.log('WC_A_TEXT', JSON.stringify(wcA2));

  // S2: customize -> clone draft
  const cz = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/customize`, { method: 'POST', body: '{}' });
  console.log('S2_CUSTOMIZE', cz.status, JSON.stringify(cz.body).slice(0, 700));
  const draft = cz.body.draft || {};
  const cloneId = draft.id || draft.workflow_id || (draft.workflow && draft.workflow.id);
  console.log('CLONE_ID', cloneId);
  if (!cloneId) throw new Error('no clone id');

  // S3: clone state -> start node
  const st = await api(page, `/api/v1/workflows/${cloneId}/state`);
  const s = st.body.state || {};
  let startId = null, startNode = null;
  for (const [id, n] of Object.entries(s.nodes || {})) { if (n.kind === 'start') { startId = id; startNode = n; } }
  console.log('S3_START', startId, JSON.stringify(startNode).slice(0, 400));
  console.log('S3_NODECOUNT', Object.keys(s.nodes || {}).length);

  // S4: edit trivially — open the Start input schema (drop required session_id)
  const ap = await api(page, `/api/v1/workflows/${cloneId}/apply`, { method: 'POST', body: JSON.stringify({
    commands: [{ type: 'node.update', body: { id: startId, config: { input_schema: { type: 'object', properties: {} } } } }],
  }) });
  console.log('S4_APPLY', ap.status, JSON.stringify(ap.body).slice(0, 300));

  // S5: publish clone
  const pb = await api(page, `/api/v1/workflows/${cloneId}/publish`, { method: 'POST', body: '{}' });
  console.log('S5_PUBLISH', pb.status, JSON.stringify(pb.body).slice(0, 300));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
