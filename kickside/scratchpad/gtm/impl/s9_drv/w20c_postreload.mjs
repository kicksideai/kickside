import { open, login, api } from './lib.mjs';
const WID = '019f4efd-157f-74fa-8c64-e08441643c76';
const { ctx, page } = await open();
try {
  await login(page);
  const acc = await api(page, `/api/v1/component-access/grants/${WID}`);
  console.log('ACCESS', acc.status, JSON.stringify((acc.body.access||[]).map(a=>({s:a.subject_id,mask:a.access_mask,owner:a.owner}))));
  const tk = await api(page, '/api/public/user/token', { method: 'POST', body: JSON.stringify({ email: 's9-outsider@wippy.local', password: 'Outsider12345!' }) }, null);
  const token = tk.body.token || (tk.body.data && tk.body.data.token);
  const st = await api(page, `/api/v1/workflows/${WID}/state`, {}, token);
  console.log('OUTSIDER_STATE_POSTRELOAD', st.status);
} catch (e) { console.log('ERR', e.message); } finally { await ctx.close(); }
