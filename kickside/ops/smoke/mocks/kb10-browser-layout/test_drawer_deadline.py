import json
from pathlib import Path
import subprocess
import sys
import unittest


SCRIPT = Path(__file__).with_name('drawer_layout_test.py')
WORKER = r'''
import runpy
import sys
import threading
import time
from types import ModuleType

phase = sys.argv[2]
original_timer = threading.Timer
def accelerated_timer(seconds, callback, *args, **kwargs):
    assert seconds == 120, seconds
    return original_timer(0.2, callback, *args, **kwargs)
threading.Timer = accelerated_timer

def stall(stage):
    if phase == stage:
        while True:
            time.sleep(1)

class Page:
    def set_content(self, content):
        assert 'transform:translateZ(0)' in content
    def evaluate(self, expression):
        stall('evaluate')
        return {'viewport': 1440, 'width': 1440, 'mask': {}, 'drawer': {}}
class Browser:
    def new_page(self, **kwargs):
        return Page()
    def close(self):
        stall('browser-close')
class Chromium:
    def launch(self, **kwargs):
        stall('launch')
        return Browser()
class Playwright:
    chromium = Chromium()
    def __enter__(self):
        return self
    def __exit__(self, *args):
        stall('driver-stop')

package = ModuleType('playwright')
api = ModuleType('playwright.sync_api')
api.sync_playwright = Playwright
sys.modules['playwright'] = package
sys.modules['playwright.sync_api'] = api
runpy.run_path(sys.argv[1], run_name='__main__')
'''


class DrawerDeadlineTests(unittest.TestCase):
    def worker(self, phase):
        try:
            return subprocess.run([sys.executable, '-c', WORKER, str(SCRIPT), phase],
                                  capture_output=True, text=True, timeout=3)
        except subprocess.TimeoutExpired as error:
            self.fail(f'{phase} holds the layout gate without a deadline: {error}')

    def test_lost_browser_or_driver_fails_with_phase_and_traceback(self):
        for phase in ('launch', 'evaluate', 'browser-close', 'driver-stop'):
            with self.subTest(phase=phase):
                result = self.worker(phase)
                self.assertEqual(result.returncode, 124, result.stderr)
                evidence = json.loads(result.stderr.splitlines()[0])
                self.assertEqual(evidence['phase'], phase)
                self.assertEqual(evidence['deadline_seconds'], 120)
                self.assertEqual(evidence['error'], 'Playwright layout deadline exceeded')
                self.assertIn('stall', result.stderr)
                self.assertIn('drawer_layout_test.py', result.stderr)

    def test_success_retains_the_layout_assertion_and_cancels_the_deadline(self):
        result = self.worker('success')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)['width'], 1440)
        self.assertEqual(result.stderr, '')


if __name__ == '__main__':
    unittest.main()
