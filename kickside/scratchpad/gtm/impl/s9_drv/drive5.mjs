import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const PID = 's9.crm.enrich.v1';
const { ctx, page } = await open();
try {
  await login(page);
  // create a second (non-owner) user as admin
  const mk = await api(page, '/api/v1/users', { method: 'POST', body: JSON.stringify({ email: 's9-outsider@wippy.local', password: 'Outsider12345!', full_name: 'S9 Outsider' }) });
  console.log('CREATE_USER', mk.status, JSON.stringify(mk.body).slice(0, 300));
  // login as the outsider
  const tk = await api(page, '/api/public/user/token', { method: 'POST', body: JSON.stringify({ email: 's9-outsider@wippy.local', password: 'Outsider12345!' }) }, null);
  console.log('LOGIN_OUTSIDER', tk.status, JSON.stringify(tk.body).slice(0, 200));
  const token = tk.body.token || (tk.body.data && tk.body.data.token);
  if (!token) throw new Error('no outsider token');
  // outsider attempts to bind on the CRM component
  const bind = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({
    target: { kind: 'workflow_definition', id: CLONE, version: 3 }, expected_revision: 0,
  }) }, token);
  console.log('OUTSIDER_BIND', bind.status, JSON.stringify(bind.body));
  // outsider attempts restore
  const rs = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'DELETE', body: JSON.stringify({ expected_revision: 0 }) }, token);
  console.log('OUTSIDER_RESTORE', rs.status, JSON.stringify(rs.body));
  // outsider lists the CRM's points (READ access filter)
  const l = await api(page, `/api/v1/components/${CRM}/flow-points`, {}, token);
  console.log('OUTSIDER_LIST', l.status, JSON.stringify(l.body).slice(0, 300));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
