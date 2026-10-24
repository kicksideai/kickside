from types import SimpleNamespace
import unittest
from unittest.mock import Mock

from harness import Cleanup
import scenarios_appearance_save_state as appearance


class AppearanceSaveStateTests(unittest.TestCase):
    def test_scenario_restores_the_full_navigation_config_when_its_editor_aborts(self):
        original = {'layout': 'sidebar', 'categories': [], 'overrides': {}, 'completed_splashes': ['welcome']}
        inst = SimpleNamespace(cleanup=Cleanup(), request=Mock(side_effect=[
            {'splash': None}, {'config': original}, {'success': True},
        ]))
        ctx = SimpleNamespace(inst=inst, browser_check=Mock(side_effect=RuntimeError('stop after fixture setup')))

        with self.assertRaisesRegex(RuntimeError, 'stop after fixture setup'):
            appearance.appearance_save_state(ctx)
        self.assertEqual(inst.cleanup.run(scope='scenario'), [])
        self.assertEqual(inst.request.call_args_list[2].args, ('PUT', '/api/v1/nav/config', original))
        self.assertEqual(inst.request.call_args_list[2].kwargs, {'label': 'appearance-restore-nav-config'})

    def test_navigation_fixture_does_not_ignore_a_failed_restore(self):
        inst = SimpleNamespace(cleanup=Cleanup(), request=Mock(side_effect=[
            {'config': {'layout': 'sidebar'}}, {'success': False},
        ]))

        appearance.preserve_navigation_config(inst)
        errors = inst.cleanup.run(scope='scenario')

        self.assertEqual(len(errors), 1)
        self.assertIn('does not restore', errors[0])
