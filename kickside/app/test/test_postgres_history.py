from pathlib import Path
import unittest
import yaml


class HistoryProfiles(unittest.TestCase):
    def setUp(self):
        self.app = Path(__file__).resolve().parents[1]
        self.config = yaml.safe_load((self.app / '.wippy.yaml').read_text())

    def test_base_opens_the_published_sqlite_history(self):
        registry = self.config['registry']
        self.assertEqual(registry['history_type'], 'sqlite')
        self.assertEqual(registry['history_path'], './.wippy/registry.db')

    def test_postgres_preserves_explicit_history_dsn_and_environment_bindings(self):
        self.assertIn('postgres_history_dsn', self.config['vars'])
        fields = {name: 'KICKSIDE_PG_' + name.upper() for name in ('host', 'port', 'database', 'username', 'password')}
        for profile_name in ('postgres', 'postgres_large', 'postgres_enterprise'):
            with self.subTest(profile=profile_name):
                profile = self.config['profiles'][profile_name]
                history = profile['registry']
                self.assertEqual(history['history_type'], 'postgres')
                self.assertEqual(history['history_dsn'], '${postgres_history_dsn}')
                self.assertEqual(history['history_schema'], '${postgres_history_schema}')
                for field, environment in fields.items():
                    self.assertEqual(profile['override']['app:db:' + field], '${postgres_' + field + '}')
                    self.assertEqual(profile['override']['app:db:' + field + '_env'], environment)

    def test_standalone_size_profiles_preserve_history_storage(self):
        for name in ('postgres_large', 'postgres_enterprise'):
            self.assertEqual(self.config['profiles'][name]['registry'], self.config['profiles']['postgres']['registry'])

    def test_published_application_delivers_profiles_and_registry_defaults(self):
        manifest = yaml.safe_load((self.app / 'wippy.yaml').read_text())
        publish = manifest['publish']
        self.assertIn('registry', publish['runtime']['sections'])
        profiles = publish.get('profiles', {})
        self.assertIsNot(profiles.get('enabled'), False)
        self.assertIn('postgres', profiles.get('include', self.config['profiles']))


if __name__ == '__main__':
    unittest.main()
