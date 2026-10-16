from pathlib import Path
import re
import unittest


class TagGeometryContract(unittest.TestCase):
    def test_shared_tag_geometry_targets_project_classes(self):
        css = (Path(__file__).resolve().parents[1] / 'package' / 'kx-tag.css').read_text()
        css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
        selectors = re.findall(r'([^{}]+)\{', css)
        self.assertTrue(selectors)
        for selector in selectors:
            self.assertNotRegex(selector, r'\.p-[\w-]+', 'Host selectors belong to facade customization')
            self.assertRegex(selector, r'\.kx-tag-(sm|caps)', 'Tag geometry stays under shared project classes')
