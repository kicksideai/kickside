import os
from pathlib import Path
import tempfile
import unittest

from ops.compat.inventory import discover


class InventoryTests(unittest.TestCase):
    def test_standalone_module_uses_its_manifest_and_embedded_resources(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'wippy.yaml').write_text("organization: sample\nmodule: studio\ntype: plugin\nembed: [sample.studio:ui_fs]\n")
            self.assertEqual(discover([root]), {'sample/studio': {'root': root, 'directory': root, 'embed': ['sample.studio:ui_fs'], 'released': True}})

    def test_missing_inventory_and_manifest_fails(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with self.assertRaises(ValueError):
                discover([Path(directory)])


    def test_release_manifest_marks_never_released_modules(self):
        import json
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            for name in ('core/fresh', 'core/shipped'):
                (root / name).mkdir(parents=True)
                (root / name / 'wippy.yaml').write_text(f"organization: sample\nmodule: {name.split('/')[1]}\ntype: library\n")
            (root / '.github').mkdir()
            (root / '.github/modules.json').write_text(json.dumps({'modules': {'core/fresh': {'embed': []}, 'core/shipped': {'embed': []}}}))
            (root / '.release-please-manifest.json').write_text(json.dumps({'core/fresh': '0.0.0', 'core/shipped': '0.2.0'}))
            modules = discover([root])
            self.assertFalse(modules['sample/fresh']['released'])
            self.assertTrue(modules['sample/shipped']['released'])
