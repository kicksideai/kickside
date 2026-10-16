import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock

from browser import Browser
from .test_identity_evidence import identity_instance


class IdentityCrashEvidenceTests(unittest.TestCase):
    def test_crash_callback_records_the_failure_using_the_real_identity_fixture(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = identity_instance(directory)
            browser = Browser.__new__(Browser)
            browser.inst = inst
            browser.errors, browser.pending, browser.navigation_urls = [], {}, {}
            browser.page_crashed(Mock(url='about:blank'))
            self.assertEqual(browser.errors, ['Page crashed: about:blank'])
            saved = json.loads((Path(directory) / 'identity/browser-page-crash.json').read_text())
            self.assertEqual(saved['crashes'], [{'url': 'about:blank', 'pending': []}])
