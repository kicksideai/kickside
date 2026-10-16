import unittest
from pathlib import Path
import yaml


class BrandingBindingTest(unittest.TestCase):
    def test_app_passes_its_branding_filesystem_to_the_ui_legacy_import(self):
        app = Path(__file__).resolve().parents[1]
        dependencies = yaml.safe_load((app / 'src/app/deps/registry/kickside_dependencies/_index.yaml').read_text())
        ui = next(entry for entry in dependencies['entries'] if entry.get('component') == 'kickside/ui')
        bindings = {param['name']: param['value'] for param in ui['parameters']}
        self.assertEqual(bindings.get('kickside.ui:branding_fs'), 'app:branding_fs')


if __name__ == '__main__':
    unittest.main()
