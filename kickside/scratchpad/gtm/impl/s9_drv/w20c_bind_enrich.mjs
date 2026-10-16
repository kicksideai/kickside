import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const PID = 's9.crm.enrich.v1';
const { ctx, page } = await open();
try {
  await login(page);
  const before = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('BEFORE', JSON.stringify((before.body.points||[]).map(p=>({id:p.point_id,state:p.state}))));
  const bind = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({ target: { kind: 'workflow_definition', id: CLONE, version: 3 }, expected_revision: 0 }) });
  console.log('BIND', bind.status, JSON.stringify(bind.body).slice(0,200));
  const after = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('AFTER', JSON.stringify((after.body.points||[]).map(p=>({id:p.point_id,state:p.state,binding:p.binding}))));
} catch (e) { console.log('ERR', e.message); } finally { await ctx.close(); }
