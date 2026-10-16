import { open, login, api } from './lib.mjs';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const { ctx, page } = await open();
try {
  await login(page);
  const st = await api(page, `/api/v1/workflows/${CLONE}/state`);
  const nodes = (st.body.state || {}).nodes || [];
  const arr = Array.isArray(nodes) ? nodes : Object.values(nodes);
  const start = arr.find((n) => n.kind === 'start');
  console.log('START_ID', start && start.id);
  const ap = await api(page, `/api/v1/workflows/${CLONE}/apply`, { method: 'POST', body: JSON.stringify({
    commands: [{ type: 'node.update', body: { id: start.id, config: { input_schema: { type: 'object', properties: {} } } } }],
  }) });
  console.log('APPLY', ap.status, JSON.stringify(ap.body).slice(0, 300));
  const pb = await api(page, `/api/v1/workflows/${CLONE}/publish`, { method: 'POST', body: '{}' });
  console.log('PUBLISH', pb.status, JSON.stringify(pb.body).slice(0, 400));
  // verify interface of new version
  const wf = await api(page, '/api/v1/workflows');
  const w = (wf.body.workflows || []).find((x) => x.id === CLONE);
  console.log('CLONE_ROW', JSON.stringify({ title: w.title, pub: w.published_version, input: (w.published_interface || {}).input_schema }));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
