from pathlib import Path
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[3]

class AppFacadeResolutionTests(unittest.TestCase):
    def test_template_access_is_owned_by_the_facade(self):
        entries = yaml.safe_load((ROOT / 'app/src/app/security/_index.yaml').read_text())['entries']
        names = {entry['name'] for entry in entries}
        self.assertNotIn('facade.template_runtime', names)
        self.assertNotIn('facade_template_runtime_policy', names)

    def test_workspace_uses_the_declared_facade_dependency(self):
        config = yaml.safe_load((ROOT / 'app/.wippy.yaml').read_text())
        for name, profile in [('default', config), *config.get('profiles', {}).items()]:
            self.assertNotIn('wippy/facade', profile.get('workspace', {}).get('replacements', {}), name)
        dependencies = yaml.safe_load((ROOT / 'app/src/app/deps/_index.yaml').read_text())['entries']
        self.assertTrue(any(entry.get('component') == 'wippy/facade' for entry in dependencies))
        self.assertFalse((ROOT / 'app/replacements/wippy-facade-0.6.39').exists())

if __name__ == '__main__':
    unittest.main()
