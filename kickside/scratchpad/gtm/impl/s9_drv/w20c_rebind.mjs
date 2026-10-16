import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const PID = 's9.crm.enrich.v1';
const { ctx, page } = await open();
try {
  await login(page);
  for (const rev of [1,2,3,4,5]) {
    const bind = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({ target: { kind: 'workflow_definition', id: CLONE, version: 3 }, expected_revision: rev }) });
    console.log('BIND rev', rev, '->', bind.status, JSON.stringify(bind.body).slice(0,120));
    if (bind.status === 200) break;
    if (!/UNIQUE constraint|binding_revision_conflict/.test(JSON.stringify(bind.body))) break;
  }
  const after = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('STATE', JSON.stringify((after.body.points||[]).map(p=>({id:p.point_id,state:p.state,rev:p.binding&&p.binding.revision,target:p.binding&&p.binding.target&&p.binding.target.id}))));
} catch (e) { console.log('ERR', e.message); } finally { await ctx.close(); }
