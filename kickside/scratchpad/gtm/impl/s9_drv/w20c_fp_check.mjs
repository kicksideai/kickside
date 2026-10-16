import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const { ctx, page } = await open();
try {
  await login(page);
  const fp = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('STATUS', fp.status, 'COUNT', (fp.body.points||[]).length);
  for (const p of (fp.body.points||[])) {
    console.log('POINT', p.point_id, '| state=', p.state, '| title=', p.title, '| default=', p.default_runnable&&p.default_runnable.id, 'v'+(p.default_runnable&&p.default_runnable.version), '| binding=', p.binding&&p.binding.target&&(p.binding.target.id+' v'+p.binding.target.version), '| err=', p.error||'');
  }
} catch (e) { console.log('ERR', e.message); } finally { await ctx.close(); }
