import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const { ctx, page } = await open();
try {
  await login(page);
  const fp = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('CRM_FLOWPOINTS', fp.status, JSON.stringify(fp.body));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
