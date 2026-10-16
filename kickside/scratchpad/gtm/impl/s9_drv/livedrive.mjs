import { open, login, api, shot, sleep, SHOTS } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const WF = '019f4dc6-b44c-7426-b023-b710800cbbce'; // a workflow component
const PID = 's9.crm.enrich.v1';
const target = { kind: 'workflow_definition', id: '019f4d3b-f0c2-7b84-8728-f18d0b0ee2d0', version: 2 };
const { ctx, page } = await open();
const R = {};
try {
  await login(page);

  // ---- REST plane ----
  R.list_crm = await api(page, `/api/v1/components/${CRM}/flow-points`);
  R.customize = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/customize`, { method: 'POST', body: '{}' });
  R.bind = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({ target, expected_revision: 0 }) });
  R.bind_unauth = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'PUT', body: JSON.stringify({ target, expected_revision: 0 }) }, null);
  R.restore = await api(page, `/api/v1/components/${CRM}/flow-points/${PID}/binding`, { method: 'DELETE', body: JSON.stringify({ expected_revision: 1 }) });
  R.list_unauth = await api(page, `/api/v1/components/${CRM}/flow-points`, {}, null);

  // ---- workflows list non-leak ----
  const wf = await api(page, '/api/v1/workflows');
  const items = wf.body.workflows || wf.body.items || [];
  R.workflows = { status: wf.status, count: items.length, any_flowpoint: items.some((w) => (w.title || w.name || '').toLowerCase().includes('flow point') || w.impl_id === 'registry.entry') };

  for (const k of Object.keys(R)) {
    const v = R[k];
    console.log(k.toUpperCase(), v.status ?? '', JSON.stringify(v.body ?? v).slice(0, 260));
  }

  // ---- WC live mount against CRM ----
  const defined = await page.evaluate(() => !!customElements.get('kickside-flow-points'));
  console.log('WC_DEFINED_BEFORE', defined);
  // try to trigger contribution load then mount
  const mount = await page.evaluate(async (crm) => {
    // wait for the custom element to be registered (auto_register view.component)
    for (let i = 0; i < 40 && !customElements.get('kickside-flow-points'); i++) await new Promise((r) => setTimeout(r, 250));
    const has = !!customElements.get('kickside-flow-points');
    if (!has) return { defined: false };
    document.querySelectorAll('#s9wc').forEach((e) => e.remove());
    const host = document.createElement('div'); host.id = 's9wc';
    host.style.cssText = 'position:fixed;inset:40px;z-index:99999;background:var(--surface-0,#fff);overflow:auto;padding:16px;border:2px solid #888';
    const el = document.createElement('kickside-flow-points');
    el.setAttribute('component-instance-id', crm);
    host.appendChild(el); document.body.appendChild(host);
    return { defined: true };
  }, CRM);
  console.log('WC_MOUNT', JSON.stringify(mount));
  await sleep(4000);
  await shot(page, 's9_wc_crm_nopoints');
  const wcText = await page.evaluate(() => (document.querySelector('#s9wc')?.innerText || '').slice(0, 400));
  console.log('WC_TEXT', JSON.stringify(wcText));
} catch (e) { console.log('ERR', e.message, e.stack); }
finally { await ctx.close(); }
console.log('SHOTS_DIR', SHOTS);
