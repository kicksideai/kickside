import { open, login, api } from './lib.mjs';
const { ctx, page } = await open();
try {
  await login(page);
  const me = await api(page, '/api/v1/user/me');
  console.log('ME', me.status, JSON.stringify(me.body).slice(0, 300));
  const wf = await api(page, '/api/v1/workflows');
  console.log('WORKFLOWS', wf.status);
  const items = (wf.body && (wf.body.workflows || wf.body.items || wf.body.components || wf.body.data || [])) || [];
  console.log('COUNT', items.length);
  console.log('KEYS0', items[0] ? Object.keys(items[0]) : 'none');
  for (const w of items.slice(0, 8)) {
    console.log('WF', JSON.stringify({ id: w.id || w.component_id, name: w.name || w.title, impl: w.impl_id || w.impl, published: w.published_version || w.version || w.latest_version, state: w.state }));
  }
  const cid = items[0] ? (items[0].id || items[0].component_id) : null;
  if (cid) {
    const fp = await api(page, `/api/v1/components/${cid}/flow-points`);
    console.log('FLOWPOINTS', cid, fp.status, JSON.stringify(fp.body).slice(0, 600));
    // unauth check
    const un = await api(page, `/api/v1/components/${cid}/flow-points`, {}, null);
    console.log('FLOWPOINTS_UNAUTH', un.status, JSON.stringify(un.body).slice(0, 300));
  }
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
