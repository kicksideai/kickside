import { open, login, api } from './lib.mjs';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const { ctx, page } = await open();
try {
  await login(page);
  const ap = await api(page, `/api/v1/workflows/${CLONE}/apply`, { method: 'POST', body: JSON.stringify({ commands: [
    { type: 'edge.remove', body: { id: 's9-pass' } },
    { type: 'node.add', body: { id: 's9_gate', kind: 'branch', title: 'S9 gate', config: { predicate: 'true' } } },
    { type: 'edge.add', body: { id: 's9-e1', source_id: 'start', target_id: 's9_gate', source_port: 'out-bottom', target_port: 'in-top', transform: [] } },
    { type: 'edge.add', body: { id: 's9-e2', source_id: 's9_gate', target_id: 'finish', source_port: 'true', target_port: 'in-top', transform: [] } },
    { type: 'edge.add', body: { id: 's9-e3', source_id: 's9_gate', target_id: 'error', source_port: 'false', target_port: 'in-top', transform: [] } },
  ] }) });
  console.log('APPLY', ap.status, JSON.stringify(ap.body).slice(0, 200));
  const pb = await api(page, `/api/v1/workflows/${CLONE}/publish`, { method: 'POST', body: '{}' });
  console.log('PUBLISH', pb.status, JSON.stringify(pb.body).slice(0, 400));
  // sanity: run the clone directly once
  const run = await api(page, `/api/v1/workflows/${CLONE}/run`, { method: 'POST', body: JSON.stringify({ input: {} }) });
  console.log('RUN', run.status, JSON.stringify(run.body).slice(0, 300));
  const runId = run.body.run_id || (run.body.run && run.body.run.run_id);
  for (let i = 0; i < 20 && runId; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const d = await api(page, `/api/v1/workflows/${CLONE}/runs/${runId}`);
    const rr = d.body.run || d.body;
    if (rr.status && rr.status !== 'running' && rr.status !== 'pending') { console.log('RUN_FINAL', JSON.stringify(rr).slice(0, 400)); break; }
    if (i === 19) console.log('RUN_TIMEOUT', JSON.stringify(rr).slice(0, 300));
  }
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
