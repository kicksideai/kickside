import { open, login, api } from './lib.mjs';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const { ctx, page } = await open();
try {
  await login(page);
  const st = await api(page, `/api/v1/workflows/${CLONE}/state`);
  const s = st.body.state || {};
  const nodes = Array.isArray(s.nodes) ? s.nodes : Object.values(s.nodes || {});
  const edges = Array.isArray(s.edges) ? s.edges : Object.values(s.edges || {});
  console.log('NODES', nodes.map((n) => `${n.id}:${n.kind}`).join(' '));
  console.log('EDGES', edges.map((e) => `${e.id}(${e.source_id}->${e.target_id})`).join(' '));
  const boundary = new Set(nodes.filter((n) => ['start', 'finish', 'error'].includes(n.kind)).map((n) => n.id));
  const finish = nodes.find((n) => n.kind === 'finish');
  const cmds = [];
  for (const e of edges) cmds.push({ type: 'edge.remove', body: { id: e.id } });
  for (const n of nodes) if (!boundary.has(n.id)) cmds.push({ type: 'node.remove', body: { id: n.id } });
  cmds.push({ type: 'edge.add', body: { id: 's9-pass', source_id: 'start', target_id: finish.id, source_port: 'out-bottom', target_port: 'in-top', transform: [] } });
  const ap = await api(page, `/api/v1/workflows/${CLONE}/apply`, { method: 'POST', body: JSON.stringify({ commands: cmds }) });
  console.log('APPLY', ap.status, JSON.stringify(ap.body).slice(0, 220));
  const pb = await api(page, `/api/v1/workflows/${CLONE}/publish`, { method: 'POST', body: '{}' });
  console.log('PUBLISH', pb.status, JSON.stringify(pb.body).slice(0, 300));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
