import { open, login, api } from './lib.mjs';
const WID = '019f4f8a-e2fd-7860-a188-82291331858a'; // S9 — Invoker
const { ctx, page } = await open();
try {
  await login(page);
  const run = await api(page, `/api/v1/workflows/${WID}/run`, { method: 'POST', body: JSON.stringify({ input: {} }) });
  console.log('RUN', run.status, JSON.stringify(run.body).slice(0, 200));
  const runId = run.body.run_id;
  for (let i = 0; i < 60 && runId; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const d = await api(page, `/api/v1/workflows/${WID}/runs/${runId}`);
    const rr = d.body.run || d.body;
    if (rr.status && rr.status !== 'running' && rr.status !== 'pending') {
      console.log('RUN_FINAL', JSON.stringify({ status: rr.status, error: rr.error, output: rr.output }).slice(0, 400));
      break;
    }
    if (i === 59) console.log('RUN_TIMEOUT_STATUS', JSON.stringify(rr).slice(0, 200));
  }
  console.log('PARENT_RUN_ID', runId);
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
