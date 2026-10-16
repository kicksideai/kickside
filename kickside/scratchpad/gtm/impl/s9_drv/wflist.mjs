import { open, login, shot, sleep, BASE } from './lib.mjs';
const { ctx, page } = await open();
try {
  await login(page);
  await page.goto(BASE + '/c/app.views:main/workflows', { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await shot(page, 's9_workflows_list_no_flowpoint');
  console.log('captured workflows list');
} catch (e) { console.log('ERR', e.message); }
finally { await ctx.close(); }
