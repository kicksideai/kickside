import { open, login, api } from './lib.mjs';
const { ctx, page } = await open();
try {
  await login(page);
  const wf = await api(page, '/api/v1/workflows');
  const w = (wf.body.workflows || []).find((x) => (x.title || '').includes('Conditional Branch'));
  console.log('WF', w && w.id);
  const st = await api(page, `/api/v1/workflows/${w.id}/state`);
  const s = st.body.state || {};
  const nodes = Array.isArray(s.nodes) ? s.nodes : Object.values(s.nodes || {});
  const edges = Array.isArray(s.edges) ? s.edges : Object.values(s.edges || {});
  for (const n of nodes) console.log('NODE', JSON.stringify({ id: n.id, kind: n.kind, title: n.title, config: n.config }).slice(0, 400));
  for (const e of edges) console.log('EDGE', JSON.stringify(e).slice(0, 250));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
