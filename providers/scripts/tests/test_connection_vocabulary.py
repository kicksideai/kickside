import unittest
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]

class ConnectionVocabulary(unittest.TestCase):
    def test_provider_fields_have_one_owner_and_no_legacy_names(self):
        fields = 0
        def inspect(value):
            nonlocal fields
            if isinstance(value, dict):
                self.assertNotIn('connection_provider', value)
                self.assertNotIn('connection_label', value)
                if value.get('picker') == 'kickside-connection-trait-picker':
                    self.assertIsInstance(value.get('provider'), str)
                    self.assertTrue(value['provider'])
                if 'provider' in value:
                    if isinstance(value['provider'], dict):
                        self.assertEqual(value['provider'].get('type'), 'string')
                    else:
                        self.assertIsInstance(value['provider'], str)
                        self.assertTrue(value['provider'])
                    fields += 1
                for child in value.values(): inspect(child)
            elif isinstance(value, list):
                for child in value: inspect(child)
        for module in ROOT.iterdir():
            if (module/'wippy.yaml').exists():
                for declaration in (module/'src').rglob('_index.yaml'):
                    inspect(yaml.safe_load(declaration.read_text()))
        self.assertGreater(fields, 30)

    def test_gmail_sink_has_no_duplicate_provider_key(self):
        def inspect(node):
            if isinstance(node, yaml.MappingNode):
                keys = [key.value for key, value in node.value]
                self.assertLessEqual(keys.count('provider'), 1)
                for key, value in node.value: inspect(value)
            elif isinstance(node, yaml.SequenceNode):
                for value in node.value: inspect(value)
        inspect(yaml.compose((ROOT/'google/src/sink/_index.yaml').read_text()))

    def test_harnesses_do_not_redeclare_the_session_file_provider(self):
        for module in ('atlassian', 'discord', 'slack', 'telegram'):
            for declaration in (ROOT/module/'test').rglob('_index.yaml'):
                data = yaml.safe_load(declaration.read_text())
                if data.get('namespace') == 'wippy.session':
                    self.assertNotIn('file_provider', [entry.get('name') for entry in data.get('entries', [])])

if __name__ == '__main__': unittest.main()
