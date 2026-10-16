import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const PID = 's9.crm.enrich.v1';
const WID = '019f4f8a-e2fd-7860-a188-82291331858a';
const { ctx, page } = await open();
try {
  await login(page);
  const ap = await api(page, `/api/v1/workflows/${WID}/apply`, { method: 'POST', body: JSON.stringify({ commands: [
    { type: 'node.add', body: { id: 'start', kind: 'start', title: 'Start', config: { input_schema: { type: 'object', properties: {} } } } },
    { type: 'node.add', body: { id: 'finish', kind: 'finish', title: 'Finish', config: { output_schema: { type: 'object', properties: {} } } } },
    { type: 'node.add', body: { id: 'error', kind: 'error', title: 'Error', config: { error_schema: { type: 'object', properties: {} } } } },
    { type: 'node.add', body: { id: 's9_call', kind: 'call_workflow', title: 'Run enrichment point', config: {
      target: { kind: 'flow_point', point_id: PID, component_instance: CRM }, mode: 'spawned_child_run',
    } } },
    { type: 'edge.add', body: { id: 'e1', source_id: 'start', target_id: 's9_call', source_port: 'out-bottom', target_port: 'in-top', transform: [] } },
    { type: 'edge.add', body: { id: 'e2', source_id: 's9_call', target_id: 'finish', source_port: 'result', target_port: 'in-top', transform: [] } },
    { type: 'edge.add', body: { id: 'e3', source_id: 's9_call', target_id: 'error', source_port: 'failed', transform: [] } },
  ] }) });
  console.log('APPLY', ap.status, JSON.stringify(ap.body).slice(0, 200));
  const pb = await api(page, `/api/v1/workflows/${WID}/publish`, { method: 'POST', body: '{}' });
  console.log('PUBLISH', pb.status, JSON.stringify(pb.body).slice(0, 400));
  const run = await api(page, `/api/v1/workflows/${WID}/run`, { method: 'POST', body: JSON.stringify({ input: {} }) });
  console.log('RUN', run.status, JSON.stringify(run.body).slice(0, 250));
  const runId = run.body.run_id;
  for (let i = 0; i < 25 && runId; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const d = await api(page, `/api/v1/workflows/${WID}/runs/${runId}`);
    const rr = d.body.run || d.body;
    if (rr.status && rr.status !== 'running' && rr.status !== 'pending') {
      console.log('RUN_FINAL', JSON.stringify({ status: rr.status, error: rr.error, output: rr.output }).slice(0, 600));
      break;
    }
    if (i === 24) console.log('RUN_TIMEOUT', JSON.stringify(rr).slice(0, 300));
  }
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
