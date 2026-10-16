import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const SANDWICH = '019f4a4e-5724-7594-adc5-31dbd69f7964';
const ICP = '019f4d3b-f0c2-7b84-8728-f18d0b0ee2d0';
const PID = 's9.crm.enrich.v1';
const B = (id, v, rev) => JSON.stringify({ target: { kind: 'workflow_definition', id, version: v }, expected_revision: rev });
const { ctx, page } = await open();
try {
  await login(page);
  // CAS: stale expected_revision on a compatible target -> conflict BEFORE any write
  const cas = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: B(CLONE, 3, 5) });
  console.log('CAS_STALE', cas.status, JSON.stringify(cas.body));
  // Envelope: interface variance (sandwich requires topic+audience)
  const env1 = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: B(SANDWICH, 3, 0) });
  console.log('ENVELOPE_SANDWICH', env1.status, JSON.stringify(env1.body));
  // Envelope: the old default itself (requires session_id + contains an await node)
  const env2 = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: B(ICP, 2, 0) });
  console.log('ENVELOPE_ICP', env2.status, JSON.stringify(env2.body));
  // Target unavailable: unpublished version
  const env3 = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: B(CLONE, 99, 0) });
  console.log('TARGET_UNAVAILABLE', env3.status, JSON.stringify(env3.body).slice(0, 220));
  // Restore with no binding present
  const rs = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'DELETE', body: JSON.stringify({ expected_revision: 0 }) });
  console.log('RESTORE_NO_BINDING', rs.status, JSON.stringify(rs.body));
  // The schema-blocked compatible bind (defect record)
  const bind = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: B(CLONE, 3, 0) });
  console.log('BIND_COMPATIBLE_SCHEMA_BLOCKED', bind.status, JSON.stringify(bind.body));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
