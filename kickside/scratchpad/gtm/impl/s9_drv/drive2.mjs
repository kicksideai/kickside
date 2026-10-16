import { open, login, api, shot, sleep } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const CLONE = '019f4f7f-bc7e-79d8-9ad5-e5f9de2fe6ab';
const { ctx, page } = await open();

async function mountWC() {
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
  await sleep(3500);
}
const wcText = () => page.evaluate(() => { const el = document.querySelector('#s9wc kickside-flow-points'); return el && el.shadowRoot ? el.shadowRoot.textContent.replace(/\s+/g, ' ').trim().slice(0, 700) : 'none'; });
const wcClick = (label) => page.evaluate((label) => {
  const el = document.querySelector('#s9wc kickside-flow-points'); if (!el || !el.shadowRoot) return 'no-el';
  const btns = [...el.shadowRoot.querySelectorAll('button')];
  const b = btns.find((x) => x.textContent.trim().toLowerCase().includes(label.toLowerCase()));
  if (!b) return 'no-btn:' + btns.map((x) => x.textContent.trim()).join('|');
  b.click(); return 'clicked:' + b.textContent.trim();
}, label);

try {
  await login(page);

  // WC pre-bind: honest directed copy for the incompatible default
  await mountWC();
  console.log('WC_PREBIND', await wcText());
  await shot(page, 's9_wc_1_prebind_directed');

  // Bind existing via the WC picker
  console.log('CLICK', await wcClick('Bind existing'));
  await sleep(2500);
  console.log('WC_PICKER', await wcText());
  await shot(page, 's9_wc_2_picker');
  // pick the S9 clone candidate
  const picked = await page.evaluate((cloneId) => {
    const el = document.querySelector('#s9wc kickside-flow-points');
    const cands = [...el.shadowRoot.querySelectorAll('.wf-flowpoints-candidate')];
    const c = cands.find((x) => x.textContent.includes('019f4d3b') || x.textContent.toLowerCase().includes('workflow'));
    if (!c) return 'no-candidate:' + cands.map((x) => x.textContent.trim().slice(0, 60)).join('|');
    c.click(); return 'picked:' + c.textContent.trim().slice(0, 80);
  }, CLONE);
  console.log('PICKED', picked);
  await sleep(4000);
  console.log('WC_AFTER_BIND', await wcText());
  await shot(page, 's9_wc_3_customized');

  // API truth: list state
  const l = await api(page, `/api/v1/components/${CRM}/flow-points`);
  console.log('LIST_AFTER_BIND', l.status, JSON.stringify(l.body.points).slice(0, 600));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
