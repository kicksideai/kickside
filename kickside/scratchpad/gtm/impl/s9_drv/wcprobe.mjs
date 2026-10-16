import { open, login, sleep, BASE } from './lib.mjs';
const CRM = 'fa70ff13-f02a-54bf-893d-f56802db964b';
const { ctx, page } = await open();
const calls = [];
page.on('request', (r) => { const u = r.url(); if (u.includes('flow-points')) calls.push({ m: r.method(), u: u.replace(BASE, '') }); });
try {
  await login(page);
  const info = await page.evaluate(async (crm) => {
    for (let i = 0; i < 40 && !customElements.get('kickside-flow-points'); i++) await new Promise((r) => setTimeout(r, 250));
    const el = document.createElement('kickside-flow-points');
    el.setAttribute('component-instance-id', crm);
    el.id = 's9wc2';
    document.body.appendChild(el);
    await new Promise((r) => setTimeout(r, 3500));
    return { hasShadow: !!el.shadowRoot, shadowHTML: (el.shadowRoot ? el.shadowRoot.innerHTML : el.innerHTML).slice(0, 900) };
  }, CRM);
  console.log('SHADOW_PRESENT', info.hasShadow);
  console.log('SHADOW_HTML', info.shadowHTML);
  console.log('FLOWPOINT_CALLS', JSON.stringify(calls));
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
