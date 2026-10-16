import { open, login, api } from './lib.mjs';
const { ctx, page } = await open();
try {
  await login(page);
  const wf = await api(page, '/api/v1/workflows');
  const items = wf.body.workflows || wf.body.items || [];
  for (const name of ['ICP list-build', 'Inline Agent Smoke', 'W20 — Parent (calls child)', 'UX Audit Sandwich', 'W20 — Wedge (template install)', 'Inbound lead pre-call wedge']) {
    const w = items.find((x) => (x.title || x.name) === name);
    if (!w) continue;
    const pi = w.published_interface || w.interface || {};
    console.log('===', name, w.id, 'pub', w.published_version);
    console.log('  input_schema:', JSON.stringify(pi.input_schema));
    console.log('  output_schema:', JSON.stringify(pi.output_schema));
    console.log('  error_schema:', JSON.stringify(pi.error_schema));
  }
} finally { await ctx.close(); }
