import { open, login, api, shot, sleep } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const SANDWICH = '019f4a4e-5724-7594-adc5-31dbd69f7964';
const PID = 's9.crm.enrich.v1';
const { ctx, page } = await open();
try {
  await login(page);
  // CAS against the real revision (current = 1)
  const cas = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({ target: { kind: 'workflow_definition', id: CLONE, version: 3 }, expected_revision: 0 }) });
  console.log('CAS_REAL', cas.status, JSON.stringify(cas.body));
  // Envelope reject while bound (revision correct, target incompatible)
  const env = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({ target: { kind: 'workflow_definition', id: SANDWICH, version: 3 }, expected_revision: 1 }) });
  console.log('ENVELOPE_WHILE_BOUND', env.status, JSON.stringify(env.body));
  // Restore default WITH a binding (revision 1)
  const rs = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'DELETE', body: JSON.stringify({ expected_revision: 1 }) });
  console.log('RESTORE_WITH_BINDING', rs.status, JSON.stringify(rs.body));
  // List: back to Default
  const l = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('LIST_AFTER_RESTORE', l.status, JSON.stringify(l.body.points));
  // WC shot after restore
  await page.evaluate(async (crm) => {
    for (let i = 0; i < 40 && !customElements.get('kickside-flow-points'); i++) await new Promise((r) => setTimeout(r, 250));
    document.querySelectorAll('#s9wc').forEach((e) => e.remove());
    const host = document.createElement('div'); host.id = 's9wc';
    host.style.cssText = 'position:fixed;left:200px;top:80px;width:900px;max-height:800px;z-index:99999;background:#fff;overflow:auto;padding:24px;border:1px solid #d0d5dd;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.2)';
    const title = document.createElement('div'); title.textContent = 'S9 — CRM component workflow settings (kickside-flow-points)'; title.style.cssText = 'font:600 14px sans-serif;margin-bottom:12px;color:#111';
    host.appendChild(title);
    const el = document.createElement('kickside-flow-points');
    el.setAttribute('component-instance-id', crm);
    host.appendChild(el); document.body.appendChild(host);
  }, CRM);
  await sleep(4000);
  await shot(page, 's9_wc_5_restored_default');
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
