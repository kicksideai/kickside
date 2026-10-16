import { open, login, api } from './lib.mjs';
const { ctx, page } = await open();
try {
  await login(page);
  const all = await api(page, '/api/v1/workflows');
  const list = all.body.workflows || all.body.items || [];
  const d = list.find((w) => (w.id || '').startsWith('019f4fba-7f93'));
  console.log('DRAFT_ROW', JSON.stringify(d));
} catch (e) { console.log('ERR', e.message); } finally { await ctx.close(); }
