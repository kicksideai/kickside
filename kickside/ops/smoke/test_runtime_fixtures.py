"""Preboot fixture configuration preserves lifecycle ordering and cleanup."""
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from runtime_fixtures import isolated_fixture


class IsolatedFixtureTests(unittest.TestCase):
    def setUp(self):
        self.trace = []
        self.inst = Mock(root=Path('fixture'), config={}, engine='sqlite')
        self.inst.prepare.side_effect = lambda: self.trace.append('prepare')
        self.inst.boot.side_effect = lambda: self.trace.append('boot')
        self.inst.cleanup.run.side_effect = lambda: self.trace.append('cleanup') or []
        self.inst.evidence.paths = []
        self.ctx = SimpleNamespace(inst=Mock(config={}, engine='sqlite'), browser_session=None)
        self.ctx.inst.evidence.root = Path('evidence')
        self.ctx.inst.evidence.label = 'scenario'
        self.fixture = SimpleNamespace(inst=self.inst, browser=None)

    def test_preboot_configuration_runs_after_prepare_before_boot(self):
        def configure(fixture):
            self.assertIs(fixture.inst, self.inst)
            self.trace.append('configure')
        with patch('runtime.Instance', return_value=self.inst), patch('runtime_fixtures.Context', return_value=self.fixture):
            with isolated_fixture(self.ctx, prepare=configure):
                self.trace.append('body')
        self.assertEqual(self.trace, ['prepare', 'configure', 'boot', 'body', 'cleanup'])

    def test_preboot_failure_propagates_and_cleans_the_prepared_runtime(self):
        cause = RuntimeError('configuration fails')
        def configure(fixture):
            raise cause
        with patch('runtime.Instance', return_value=self.inst), patch('runtime_fixtures.Context', return_value=self.fixture):
            with self.assertRaises(RuntimeError) as caught:
                with isolated_fixture(self.ctx, prepare=configure):
                    self.fail('failed configuration reaches the body')
        self.assertIs(caught.exception, cause)
        self.inst.boot.assert_not_called()
        self.assertEqual(self.trace, ['prepare', 'cleanup'])

    def test_default_fixture_keeps_boot_owned_preparation(self):
        with patch('runtime.Instance', return_value=self.inst), patch('runtime_fixtures.Context', return_value=self.fixture):
            with isolated_fixture(self.ctx):
                self.trace.append('body')
        self.inst.prepare.assert_not_called()
        self.assertEqual(self.trace, ['boot', 'body', 'cleanup'])
