import { open, login, api } from './lib.mjs';
const WID = '019f4f8a-e2fd-7860-a188-82291331858a';
const RUN = '1777f016-2a2f-4591-8efd-afe9f916f171';
const { ctx, page } = await open();
try {
  await login(page);
  const d = await api(page, `/api/v1/workflows/${WID}/runs/${RUN}`);
  const rr = d.body.run || d.body;
  console.log('PARENT_STATUS', JSON.stringify({ status: rr.status, error: rr.error, output: rr.output, finished_at: rr.finished_at }).slice(0, 400));
} finally { await ctx.close(); }
