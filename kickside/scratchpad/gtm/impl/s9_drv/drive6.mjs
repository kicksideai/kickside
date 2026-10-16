import { open, login, api } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const SMOKE = '019f4dc6-b44c-7426-b023-b710800cbbce';
const PID = 's9.crm.enrich.v1';
const { ctx, page } = await open();
try {
  await login(page);
  const bind = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({
    target: { kind: 'workflow_definition', id: SMOKE, version: 2 }, expected_revision: 0,
  }) });
  console.log('BIND_NEW_DEFAULT_PROBE', bind.status, JSON.stringify(bind.body));
} finally { await ctx.close(); }
