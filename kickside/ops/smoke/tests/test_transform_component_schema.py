import json
from pathlib import Path
import unittest

import yaml


class TransformComponentSchemaTests(unittest.TestCase):
    def test_packaged_component_preserves_declared_property_types_and_defaults(self):
        module = Path(__file__).resolve().parents[3] / 'platform/transform'
        package = json.loads((module / 'ui/package.json').read_text())['wippy']
        entries = []
        for path in (module / 'src').rglob('_index.yaml'):
            entries.extend(yaml.safe_load(path.read_text()).get('entries', []))
        declarations = [entry for entry in entries if entry.get('meta', {}).get('tag_name') == package['tagName']]
        self.assertEqual(len(declarations), 1)
        declared = declarations[0]['props']['properties']
        packaged = package['props']['properties']
        for name, schema in declared.items():
            with self.subTest(property=name):
                self.assertIn(name, packaged)
                for field in ('type', 'default'):
                    self.assertEqual(packaged[name].get(field), schema.get(field))


if __name__ == '__main__':
    unittest.main()
