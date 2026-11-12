"""Assignment roles expose display metadata in the shared security catalog."""
import unittest
from pathlib import Path

import yaml


class AssignmentScopeMetadataTest(unittest.TestCase):
    def test_default_assignment_scope_has_a_title_and_description(self):
        declaration = yaml.safe_load((Path(__file__).parents[1] / 'src/security/_index.yaml').read_text())
        entries = {entry['name']: entry for entry in declaration['entries']}
        scope_id = entries['assignment_security_scope']['default']
        scope = entries[scope_id.split(':')[1]]
        self.assertEqual(scope['kind'], 'security.scope')
        self.assertTrue(scope.get('meta', {}).get('title'))
        self.assertTrue(scope.get('meta', {}).get('comment'))
        self.assertNotEqual(scope['meta']['title'], scope_id)


if __name__ == '__main__':
    unittest.main()
