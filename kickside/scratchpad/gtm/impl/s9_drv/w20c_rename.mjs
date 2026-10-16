import { open, login, api } from './lib.mjs';
const DRAFT = '019f4fba-7f93-78cd-a2ae-01b14878f659';
const { ctx, page } = await open();
try {
  await login(page);
  const ap = await api(page, `/api/v1/workflows/${DRAFT}/apply`, { method: 'POST', body: JSON.stringify({ commands: [ { type: 'param.set', body: { key: 'title', value: 'W20C - Scenario 8 (customized CRM enrichment slot)' } } ] }) });
  console.log('RENAME', ap.status, JSON.stringify(ap.body).slice(0, 160));
  const all = await api(page, '/api/v1/workflows');
  const d = (all.body.workflows || all.body.items || []).find((w) => (w.id||'').startsWith('019f4fba-7f93'));
  console.log('NEW_TITLE', d && d.title, '| status', d && d.status);
} catch (e) { console.log('ERR', e.message); } finally { await ctx.close(); }
