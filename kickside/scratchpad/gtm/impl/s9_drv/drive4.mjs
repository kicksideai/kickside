import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const PID = 's9.crm.enrich.v1';
const { ctx, page } = await open();
try {
  await login(page);
  // create invoker workflow
  const cr = await api(page, '/api/v1/workflows', { method: 'POST', body: JSON.stringify({ title: 'S9 — Invoker (calls the CRM enrichment point)' }) });
  console.log('CREATE', cr.status, JSON.stringify(cr.body).slice(0, 250));
  const wid = cr.body.workflow_id || cr.body.id || (cr.body.workflow && cr.body.workflow.id);
  console.log('WID', wid);
  // inspect seeded state
  const st = await api(page, `/api/v1/workflows/${wid}/state`);
  const nodes = Array.isArray(st.body.state.nodes) ? st.body.state.nodes : Object.values(st.body.state.nodes || {});
  console.log('SEEDED', nodes.map((n) => `${n.id}:${n.kind}`).join(' '));
  const start = nodes.find((n) => n.kind === 'start');
  const finish = nodes.find((n) => n.kind === 'finish');
  const error = nodes.find((n) => n.kind === 'error');
  // add call node targeting the flow point + wire
  const ap = await api(page, `/api/v1/workflows/${wid}/apply`, { method: 'POST', body: JSON.stringify({ commands: [
    { type: 'node.add', body: { id: 's9_call', kind: 'call_workflow', title: 'Run enrichment point', config: {
      target: { kind: 'flow_point', point_id: PID, component_instance: CRM }, mode: 'spawned_child_run',
    } } },
    { type: 'edge.add', body: { id: 'e1', source_id: start.id, target_id: 's9_call', source_port: 'out-bottom', target_port: 'in-top', transform: [] } },
    { type: 'edge.add', body: { id: 'e2', source_id: 's9_call', target_id: finish.id, source_port: 'result', target_port: 'in-top', transform: [] } },
    { type: 'edge.add', body: { id: 'e3', source_id: 's9_call', target_id: error.id, source_port: 'failed', transform: [] } },
  ] }) });
  console.log('APPLY', ap.status, JSON.stringify(ap.body).slice(0, 160));
  const pb = await api(page, `/api/v1/workflows/${wid}/publish`, { method: 'POST', body: '{}' });
  console.log('PUBLISH', pb.status, JSON.stringify(pb.body).slice(0, 300));
  // run it: this drives Call -> kickside.runnable:launch -> flow_points.invoke LIVE
  const run = await api(page, `/api/v1/workflows/${wid}/run`, { method: 'POST', body: JSON.stringify({ input: {} }) });
  console.log('RUN', run.status, JSON.stringify(run.body).slice(0, 250));
  const runId = run.body.run_id;
  for (let i = 0; i < 25 && runId; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const d = await api(page, `/api/v1/workflows/${wid}/runs/${runId}`);
    const rr = d.body.run || d.body;
    if (rr.status && rr.status !== 'running' && rr.status !== 'pending') {
      console.log('RUN_FINAL', JSON.stringify({ status: rr.status, error: rr.error, output: rr.output }).slice(0, 500));
      break;
    }
    if (i === 24) console.log('RUN_TIMEOUT', JSON.stringify(rr).slice(0, 200));
  }
  console.log('INVOKER_ID', wid);
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
