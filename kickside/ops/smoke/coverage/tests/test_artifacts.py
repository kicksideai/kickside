import json
from pathlib import Path
import unittest
from report import calculate, planned

ROOT = Path(__file__).resolve().parents[1]


class ArtifactTests(unittest.TestCase):
    def test_committed_inventory_contains_required_modules(self):
        inventory = json.loads((ROOT / 'inventory.json').read_text())
        required = {'chestor/workspace', 'chestor/graph', 'chestor/journal', 'chestor/roadmap',
                    'chestor/db-schema', 'kickside/dashboard', 'kickside/research',
                    'kickside/agent-onboarding', 'kickside/crm', 'kickside/mcp',
                    'kickside/doc2md', 'kickside/html2pdf', 'kickside/pdf2image',
                    'kickside/google', 'kickside/slack'}
        self.assertFalse(required - inventory['components'].keys())
        self.assertTrue(all(c.split('/', 1)[0] in {'kickside', 'chestor'} for c in inventory['components']))
        self.assertNotIn('kickside/dxf2md', inventory['components'])
        ids = [f['id'] for c in inventory['components'].values() for f in c['features']]
        self.assertEqual(len(ids), inventory['feature_count'])
        self.assertEqual(len(ids), len(set(ids)))

    def test_seed_map_validates_and_does_not_pass_without_runs(self):
        inventory = json.loads((ROOT / 'inventory.json').read_text())
        mapping = json.loads((ROOT / 'scenario_map.json').read_text())
        import export_map
        self.assertEqual(export_map.export()['scenarios'].keys(), mapping['scenarios'].keys())
        empty = calculate(inventory, mapping, {'results': []})
        self.assertEqual(0, empty['overall']['covered'])
        self.assertFalse(empty['gate_passed'])
        quick, full = planned(inventory, mapping, 'quick'), planned(inventory, mapping, 'full')
        self.assertGreater(full['overall']['covered'], quick['overall']['covered'])
        self.assertIn('no execution evidence', full['basis'])


if __name__ == '__main__':
    unittest.main()
