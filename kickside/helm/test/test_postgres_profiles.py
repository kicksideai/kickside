from pathlib import Path
import subprocess
import unittest
import yaml


class HelmHistoryProfiles(unittest.TestCase):
    def test_helm_uses_the_postgres_profile_and_shared_connection_vars(self):
        chart = Path(__file__).resolve().parents[1]
        for profile in ('postgres', 'postgres_large', 'postgres_enterprise'):
            rendered = subprocess.run(['helm', 'template', 'history-test', str(chart), '--set', 'wippy.profile=' + profile], check=True, capture_output=True, text=True).stdout
            deployment = next(doc for doc in yaml.safe_load_all(rendered) if doc and doc.get('kind') == 'Deployment')
            args = deployment['spec']['template']['spec']['containers'][0]['args']
            selected = [args[i + 1] for i, arg in enumerate(args) if arg == '--profile']
            self.assertEqual(selected, ['postgres'] if profile == 'postgres' else ['postgres', profile])
            self.assertFalse(any('postgres_history_dsn' in arg for arg in args))
            for name in ('host', 'database', 'username', 'password'):
                self.assertIn('vars.postgres_' + name + '=$(KICKSIDE_PG_' + name.upper() + ')', args)


if __name__ == '__main__':
    unittest.main()
