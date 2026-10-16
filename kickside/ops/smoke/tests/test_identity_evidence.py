import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from PIL import Image

from browser import Browser
from harness import Evidence, Redactor


def identity_instance(directory):
    redactor = Redactor()
    evidence = Evidence(Path(directory), redactor)
    evidence.label = 'identity'
    return SimpleNamespace(root=Path(directory), email='owner@example.invalid',
                           evidence=evidence, redactor=redactor)


class IdentityEvidenceTests(unittest.TestCase):
    def test_link_codes_and_instructions_are_masked_in_shadow_roots_and_frames(self):
        with tempfile.TemporaryDirectory() as directory:
            inst = identity_instance(directory)
            browser = Browser(inst)
            try:
                for code in ('123456', 'identity-link-code-123456789'):
                    with self.subTest(code_length=len(code)):
                        inst.redactor.add(code)
                        browser.page.set_content('<iframe></iframe>')
                        frame = browser.page.frames[1]
                        frame.set_content('<kickside-identity-links></kickside-identity-links>')
                        frame.locator('kickside-identity-links').evaluate('''(el, code) => {
                            el.attachShadow({mode: 'open'}).innerHTML =
                                '<div class="ks-code">' + code + '</div>' +
                                '<p class="ks-hint">Send <code>' + code + '</code> to link</p>';
                        }''', code)
                        fields = frame.locator('.ks-code, .ks-hint code')
                        self.assertEqual(fields.count(), 2)
                        centers = [field.evaluate('''el => {
                            const box = el.getBoundingClientRect();
                            const host = window.frameElement.getBoundingClientRect();
                            return [host.x + 2 + box.x + box.width / 2,
                                    host.y + 2 + box.y + box.height / 2];
                        }''') for field in fields.all()]
                        path = browser.screenshot('link-code', full_page=False, mask_color='#e5e7eb')
                        with Image.open(path) as picture:
                            for x, y in centers:
                                self.assertEqual(picture.getpixel((int(x), int(y))), (229, 231, 235))
                browser.clean(0)
            finally:
                browser.close()


if __name__ == '__main__':
    unittest.main()
