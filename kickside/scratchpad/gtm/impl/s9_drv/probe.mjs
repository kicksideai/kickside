import { open, login, api, sleep } from './lib.mjs';
const { ctx, page } = await open();
try {
  const lg = await login(page);
  console.log('LOGIN', lg, 'url', page.url());
  // whoami
  const me = await api(page, '/api/v1/me');
  console.log('ME', JSON.stringify(me).slice(0, 500));
  // list workflow components to get a real component_id
  const wf = await api(page, '/api/v1/workflows');
  console.log('WORKFLOWS_STATUS', wf.status);
  const items = (wf.body && (wf.body.workflows || wf.body.items || wf.body.components || wf.body.data)) || [];
  console.log('WORKFLOWS_COUNT', Array.isArray(items) ? items.length : 'n/a');
  const first = Array.isArray(items) ? items.slice(0, 6).map((w) => ({ id: w.id || w.component_id, name: w.name || w.title, impl: w.impl_id })) : items;
  console.log('WORKFLOWS_SAMPLE', JSON.stringify(first, null, 1));
  // baseline flow-points on the first workflow component
  const cid = Array.isArray(items) && items[0] ? (items[0].id || items[0].component_id) : null;
  if (cid) {
    const fp = await api(page, `/api/v1/components/${cid}/flow-points`);
    console.log('FLOWPOINTS_ON', cid, '->', JSON.stringify(fp).slice(0, 800));
  }
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
