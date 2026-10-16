import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))
from ops.compat.compare import compare


class RegistryIdentityGuardTests(unittest.TestCase):
    def test_constructed_removal_is_red(self):
        published = {'module.api:list.endpoint': {'Kind': 'http.endpoint',
            'Meta': {}, 'Data': {'path': '/items', 'method': 'GET'}}}
        findings = compare('example/module', '1.0.0', published, {})
        self.assertEqual([(row['id'], row['code']) for row in findings],
                         [('module.api:list.endpoint', 'removed_id')])

    def test_unchanged_identity_is_green(self):
        published = {'module.api:list.endpoint': {'Kind': 'http.endpoint',
            'Meta': {}, 'Data': {'path': '/items', 'method': 'GET'}}}
        self.assertEqual(compare('example/module', '1.0.0', published, published), [])
