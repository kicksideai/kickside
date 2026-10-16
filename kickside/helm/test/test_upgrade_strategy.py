from pathlib import Path
import subprocess
import unittest

import yaml


class UpgradeStrategyTests(unittest.TestCase):
    def test_each_engine_profile_replaces_the_existing_writer_before_starting_another(self):
        chart = Path(__file__).resolve().parents[1]
        for profile in ('sqlite', 'postgres', 'postgres_large', 'postgres_enterprise'):
            for overrides in ([], ['-f', str(chart / 'values-prod-gen2.yaml.tpl')]):
                with self.subTest(profile=profile, production=bool(overrides)):
                    rendered = subprocess.run(['helm', 'template', 'upgrade-test', str(chart),
                        '--set', 'wippy.profile=' + profile, *overrides],
                        check=True, capture_output=True, text=True, timeout=30).stdout
                    deployment = next(doc for doc in yaml.safe_load_all(rendered)
                                      if doc and doc.get('kind') == 'Deployment')
                    self.assertEqual(deployment['spec']['strategy'], {'type': 'Recreate'})

    def test_values_expose_no_overlapping_rollout_controls(self):
        chart = Path(__file__).resolve().parents[1]
        for filename in ('values.yaml', 'values-prod-gen2.yaml.tpl'):
            with self.subTest(filename=filename):
                values = yaml.safe_load((chart / filename).read_text())
                self.assertNotIn('strategy', values)


if __name__ == '__main__':
    unittest.main()
