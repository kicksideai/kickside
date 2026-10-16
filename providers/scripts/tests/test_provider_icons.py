import json
from pathlib import Path
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[2]
CATALOG = json.loads((ROOT / 'tests/provider_icons.json').read_text())


def entries(module):
    result = {}
    for path in (ROOT / module / 'src').rglob('_index.yaml'):
        declaration = yaml.safe_load(path.read_text())
        for entry in declaration.get('entries', []):
            result[declaration['namespace'] + ':' + entry['name']] = entry
    return result


class ProviderIcons(unittest.TestCase):
    def test_catalog_covers_every_provider_descriptor(self):
        covered = {row['entry'] for row in CATALOG}
        discovered = set()
        for module in ROOT.iterdir():
            if not (module / 'wippy.yaml').exists():
                continue
            for identity, entry in entries(module.name).items():
                meta = entry.get('meta', {})
                if meta.get('oauth_provider') or meta.get('type') in ('sso.provider', 'kickside.webscout:search_provider') or any(
                        contract['contract'] == 'kickside.connection:connection' for contract in entry.get('contracts', [])):
                    discovered.add(identity)
        self.assertEqual(discovered, covered)


def provider_test(row):
    def check(self):
        entry = entries(row['module'])[row['entry']]
        meta = entry.get('meta', {})
        icon = meta.get('icon') or meta.get('component', {}).get('icon') or entry.get('icon')
        self.assertEqual(row['icon'], icon)
        if entry['kind'] == 'contract.binding' or meta.get('oauth_provider'):
            for identity, binding in entries(row['module']).items():
                if binding['kind'] == 'contract.binding' and binding.get('meta', {}).get('provider') == row['provider']:
                    self.assertEqual(row['icon'], binding['meta'].get('icon'), identity)
    return check


for row in CATALOG:
    setattr(ProviderIcons, 'test_' + row['module'].replace('-', '_') + '_' + row['entry'].split(':')[1], provider_test(row))

if __name__ == '__main__':
    unittest.main()
