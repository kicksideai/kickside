import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const OUT_EMAIL = 's9-outsider@wippy.local';
const OUT_PASS = 'Outsider12345!';
const { ctx, page } = await open();
try {
  await login(page);
  // 1. published workflows (find W20 published ones for share target)
  const wf = await api(page, '/api/v1/workflows?filter=published');
  const list = (wf.body.workflows || wf.body.items || wf.body || []);
  console.log('WF_STATUS', wf.status);
  for (const w of (Array.isArray(list) ? list : [])) {
    console.log('WF', w.id, '|', (w.title || '').slice(0, 40), '| state=', w.state || w.status, '| pubv=', w.published_version);
  }
  // full list too (to see all W20)
  const wall = await api(page, '/api/v1/workflows');
  const alllist = (wall.body.workflows || wall.body.items || []);
  console.log('ALL_COUNT', Array.isArray(alllist) ? alllist.length : 'n/a');
  for (const w of (Array.isArray(alllist) ? alllist : [])) {
    if (/W20|S9/i.test(w.title || '')) console.log('ALLWF', w.id, '|', (w.title || '').slice(0, 45), '| st=', w.state || w.status, '| pubv=', w.published_version);
  }
  // 2. CRM flow-points current state
  const fp = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('FLOWPOINTS_STATUS', fp.status);
  console.log('FLOWPOINTS', JSON.stringify(fp.body.points || fp.body));
  // 3. outsider exists? ensure + token
  const mk = await api(page, '/api/v1/users', { method: 'POST', body: JSON.stringify({ email: OUT_EMAIL, password: OUT_PASS, full_name: 'S9 Outsider' }) });
  console.log('OUTSIDER_ENSURE', mk.status, JSON.stringify(mk.body).slice(0, 160));
  const tk = await api(page, '/api/public/user/token', { method: 'POST', body: JSON.stringify({ email: OUT_EMAIL, password: OUT_PASS }) }, null);
  const token = tk.body.token || (tk.body.data && tk.body.data.token);
  console.log('OUTSIDER_TOKEN', tk.status, token ? token.slice(0, 12) + '...' : 'NONE');
  // 4. principals search for outsider (what the share widget sees)
  const ps = await api(page, `/api/v1/principals/search?q=outsider&limit=8`);
  console.log('PRINCIPAL_SEARCH', ps.status, JSON.stringify(ps.body.principals || ps.body).slice(0, 400));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
