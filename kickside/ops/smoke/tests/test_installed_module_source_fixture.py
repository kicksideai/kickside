import unittest
from types import SimpleNamespace
from unittest.mock import patch

import scenarios_launch_module_source as scenario


class FixtureCaptured(Exception):
    pass


class InstalledModuleSourceFixtureTests(unittest.TestCase):
    def test_preserves_unrelated_replacements_while_resolving_compared_modules_from_hub(self):
        replacements = {
            scenario.HUB_COMPONENT: '/modules/hub-comparison',
            scenario.REPLACEMENT_COMPONENT: '/modules/replacement-comparison',
            'example/control': '/modules/control',
        }
        ctx = SimpleNamespace(inst=SimpleNamespace(config={'replace': replacements}))
        captured = []

        def fixture(context, *, config):
            captured.append(config)
            raise FixtureCaptured

        with patch.object(scenario, 'isolated_fixture', fixture):
            with self.assertRaises(FixtureCaptured):
                scenario.installed_module_source(ctx)

        self.assertEqual(captured[0]['replace'], {'example/control': '/modules/control'})
        self.assertEqual(ctx.inst.config['replace'], replacements)


if __name__ == '__main__':
    unittest.main()
