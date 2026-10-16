import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const PID = 's9.crm.enrich.v1';
const { ctx, page } = await open();
try {
  await login(page);
  // direct API bind of the clone v3
  const bind = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({
    target: { kind: 'workflow_definition', id: CLONE, version: 3 }, expected_revision: 0,
  }) });
  console.log('BIND', bind.status, JSON.stringify(bind.body).slice(0, 500));
  const l = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('LIST', l.status, JSON.stringify(l.body.points).slice(0, 700));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
