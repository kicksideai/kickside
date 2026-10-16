import { open, login, api } from './lib.mjs';
const PARENT = '019f4efd-157f-74fa-8c64-e08441643c76';
const { ctx, page } = await open();
try {
  await login(page);
  const st = await api(page, `/api/v1/workflows/${PARENT}/state`);
  console.log('STATE_STATUS', st.status);
  const s = st.body.state || st.body;
  console.log('STATE_KEYS', Object.keys(st.body));
  const nodes = s.nodes || {};
  for (const [id, n] of Object.entries(nodes)) {
    console.log('NODE', id.slice(0, 8), JSON.stringify({ kind: n.kind, title: n.title, config: n.config }).slice(0, 700));
  }
  const edges = s.edges || {};
  for (const [id, e] of Object.entries(edges)) {
    console.log('EDGE', id.slice(0, 8), JSON.stringify(e).slice(0, 300));
  }
  console.log('PARAMS', JSON.stringify(s.params).slice(0, 300));
  // runnables catalog leak check
  const rn = await api(page, '/api/v1/workflows/runnables');
  const list = rn.body.runnables || rn.body.items || [];
  console.log('RUNNABLES', rn.status, Array.isArray(list) ? list.length : typeof list, JSON.stringify(list).includes('s9.crm') ? 'S9_LEAK' : 'no-s9');
  if (Array.isArray(list) && list[0]) console.log('RUNNABLE0', JSON.stringify(list[0]).slice(0, 300));
} finally { await ctx.close(); }
