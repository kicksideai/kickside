import json
from pathlib import Path
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[1]


class ReleasePaths(unittest.TestCase):
    def test_pack_excluded_directories_do_not_trigger_module_releases(self):
        packages = json.loads((ROOT / 'release-please-config.json').read_text())['packages']
        for package, config in packages.items():
            manifest = yaml.safe_load((ROOT / package / 'wippy.yaml').read_text())
            excluded = config.get('exclude-paths', [])
            for pattern in manifest.get('exclude', []):
                if not pattern.endswith('/**') or any(char in pattern[:-3] for char in '*?:['):
                    continue
                path = package + '/' + pattern[:-3]
                with self.subTest(package=package, excluded=pattern):
                    self.assertTrue(any(path == prefix or path.startswith(prefix + '/') for prefix in excluded), path)
            for path in excluded:
                with self.subTest(package=package, path=path):
                    self.assertTrue(path.startswith(package + '/'))
                    relative = path[len(package) + 1:]
                    self.assertIn(relative + '/**', manifest['exclude'])
                    self.assertNotIn(path, (package + '/src', package + '/static'))
