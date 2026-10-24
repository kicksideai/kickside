from pathlib import Path
import faulthandler
import json
import os
import sys
import threading
from playwright.sync_api import sync_playwright

# A transformed host establishes the fixed-position containing block, as an
# embedded component host can. The drawer must stay out of its page's layout.
css = (Path(__file__).resolve().parents[1] / 'src/styles.css').read_text()
phase = 'driver-start'


def deadline_exceeded():
    print(json.dumps({'error': 'Playwright layout deadline exceeded',
                      'phase': phase, 'deadline_seconds': 120}), file=sys.stderr, flush=True)
    faulthandler.dump_traceback(file=sys.stderr, all_threads=True)
    # Playwright transport teardown can also block after browser loss.
    os._exit(124)


deadline = threading.Timer(120, deadline_exceeded)
deadline.daemon = True
deadline.start()
try:
    with sync_playwright() as p:
        phase = 'launch'
        browser = p.chromium.launch(headless=True)
        phase = 'page-create'
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        phase = 'content'
        page.set_content('<style>' + css + '</style><main style="height:900px;width:calc(100% - 224px);margin-left:224px;transform:translateZ(0)">Reader<div class="kc-drawer-mask kc-drawer-enter-from"><aside class="kc-drawer"><div class="kc-drawer-h">Add to library</div><div class="kc-drawer-b">Upload files</div></aside></div></main>')
        phase = 'evaluate'
        result = page.evaluate('''() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth,
          mask: document.querySelector('.kc-drawer-mask').getBoundingClientRect().toJSON(),
          drawer: document.querySelector('.kc-drawer').getBoundingClientRect().toJSON() })''')
        print(json.dumps(result, indent=2), flush=True)
        phase = 'browser-close'
        browser.close()
        assert result['width'] == result['viewport'], 'Drawer motion must not widen the document'
        phase = 'driver-stop'
finally:
    deadline.cancel()
    deadline.join()
