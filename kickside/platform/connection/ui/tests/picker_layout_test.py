from pathlib import Path
from playwright.sync_api import sync_playwright

css = (Path(__file__).resolve().parents[1] / 'src/styles.css').read_text()
with sync_playwright() as driver:
    browser = driver.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 1000})
    tiles = ''.join(f'<button class="kx-cat-card" style="height:72px;display:block" data-provider="{i}">Provider {i}</button>' for i in range(25))
    page.set_content(f'''<style>.p-dialog-content {{ overflow-y: auto; }} {css}</style>
      <section class="kx-modal kx-modal-2p" style="margin:30px auto">
        <header class="kx-modal-head">Connect an app</header>
        <div class="p-dialog-content kx-dialog-content"><div class="kx-2p">
          <div class="kx-2p-l"><input aria-label="Search apps">{tiles}</div>
          <div class="kx-2p-r"><div class="kx-2p-r-head">Configure</div><div class="kx-2p-r-body"><input aria-label="Connection name"></div></div>
        </div></div><footer class="kx-modal-foot">Cancel</footer>
      </section>''')
    page.locator('[data-provider="24"]').scroll_into_view_if_needed()
    page.locator('[data-provider="24"]').click()
    geometry = page.evaluate('''() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
      return { name: box('[aria-label="Connection name"]'), dialog: box('.kx-modal'),
        leftScroll: document.querySelector('.kx-2p-l').scrollTop,
        sharedScroll: document.querySelector('.kx-dialog-content').scrollTop };
    }''')
    browser.close()
    assert geometry['name']['y'] >= geometry['dialog']['y'], geometry
    assert geometry['name']['bottom'] < 1000, geometry
    assert geometry['leftScroll'] > 0, geometry
    assert geometry['sharedScroll'] == 0, geometry
