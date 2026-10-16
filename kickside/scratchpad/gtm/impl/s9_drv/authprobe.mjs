import { open, login, sleep, BASE } from './lib.mjs';
const { ctx, page } = await open();
const seen = [];
page.on('request', (r) => {
  const u = r.url();
  if (u.includes('/api/') && !u.includes('/views/')) {
    const h = r.headers();
    seen.push({ method: r.method(), url: u.replace(BASE, ''), auth: h['authorization'] ? h['authorization'].slice(0, 24) + '...' : null, cookie: h['cookie'] ? 'yes' : 'no' });
  }
});
try {
  await login(page);
  // navigate into workflows list to trigger real API calls
  await page.goto(BASE + '/c/app.views:main/workflows', { waitUntil: 'domcontentloaded' });
} catch (e) {}
await sleep(6000);
// dump storage
const store = await page.evaluate(() => {
  const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = (localStorage.getItem(k) || '').slice(0, 60); }
  const ss = {}; for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); ss[k] = (sessionStorage.getItem(k) || '').slice(0, 60); }
  return { ls, ss, cookie: document.cookie.slice(0, 200) };
});
console.log('STORAGE', JSON.stringify(store, null, 1));
console.log('APICALLS', JSON.stringify(seen.slice(0, 25), null, 1));
await ctx.close();
