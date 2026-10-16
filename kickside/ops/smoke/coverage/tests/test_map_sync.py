import unittest

import export_map
from pathlib import Path


class MapSyncTests(unittest.TestCase):
    def test_committed_map_matches_registry_declarations(self):
        committed = (Path(export_map.HERE) / 'scenario_map.json').read_text()
        self.assertEqual(committed, __import__('json').dumps(export_map.export(), indent=2, sort_keys=True) + '\n')
