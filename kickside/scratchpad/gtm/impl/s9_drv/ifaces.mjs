import { open, login, api } from './lib.mjs';
const { ctx, page } = await open();
try {
  await login(page);
  const wf = await api(page, '/api/v1/workflows');
  const items = (wf.body.workflows || wf.body.items || []) ;
  for (const w of items) {
    if (!w.published_version) continue;
    const pi = w.published_interface || w.interface || {};
    const has = (s) => pi && pi[s] ? Object.keys(pi[s]).length ? 'Y' : 'e' : '-';
    console.log(JSON.stringify({ id: w.id, name: w.title || w.name, pub: w.published_version, in: has('input_schema'), out: has('output_schema'), err: has('error_schema'), nodes: w.node_count }));
  }
  console.log('=== sample published_interface (first published) ===');
  const p = items.find((w) => w.published_version);
  console.log(JSON.stringify(p && (p.published_interface || p.interface), null, 1).slice(0, 1200));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
