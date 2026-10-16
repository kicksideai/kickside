import { open, login, api } from './lib.mjs';
const WID = '019f4efd-157f-74fa-8c64-e08441643c76'; // W20 — Parent (calls child), published v1
const OUT_EMAIL = 's9-outsider@wippy.local';
const OUT_PASS = 'Outsider12345!';
const { ctx, page } = await open();
try {
  await login(page);
  // access-model caps (know READ bit)
  const am = await api(page, '/api/v1/components/access-model');
  console.log('ACCESS_MODEL', am.status, JSON.stringify(am.body.capabilities || am.body).slice(0, 300));
  // owner's access list for the target (baseline)
  const acc = await api(page, `/api/v1/component-access/grants/${WID}`);
  console.log('OWNER_ACCESS', acc.status, JSON.stringify(acc.body).slice(0, 400));
  // outsider token
  const tk = await api(page, '/api/public/user/token', { method: 'POST', body: JSON.stringify({ email: OUT_EMAIL, password: OUT_PASS }) }, null);
  const token = tk.body.token || (tk.body.data && tk.body.data.token);
  console.log('OUTSIDER_TOKEN', tk.status, token ? 'ok' : 'NONE');
  // outsider pre-grant reads
  for (const p of [`/api/v1/workflows/${WID}`, `/api/v1/workflows/${WID}/state`, `/api/v1/workflows/${WID}/export`, `/api/v1/component-access/grants/${WID}`]) {
    const r = await api(page, p, {}, token);
    console.log('OUT_PRE', p.replace(`/${WID}`, '/{WID}'), '->', r.status, JSON.stringify(r.body).slice(0, 120));
  }
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
