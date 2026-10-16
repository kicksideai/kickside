from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Cleanup, Failure
from runtime import Instance, SourceSnapshot
from runtime_fixtures import isolated_fixture


class IsolatedRuntimeTests(unittest.TestCase):
    def context(self):
        parent = Mock()
        parent.evidence.root, parent.evidence.label = Path('evidence'), 'scenario'
        return SimpleNamespace(inst=parent, browser_session=None)

    def test_cleanup_runs_after_scenario_failure_and_saves_child_evidence(self):
        ctx = self.context()
        inst = Mock(cleanup=Cleanup())
        cleanup = Mock()
        inst.cleanup.add('owned resources', cleanup)
        with patch('runtime.Instance', return_value=inst):
            with self.assertRaisesRegex(ValueError, 'scenario fails'):
                with isolated_fixture(ctx) as fixture:
                    self.assertIs(fixture.inst, inst)
                    raise ValueError('scenario fails')
        cleanup.assert_called_once()
        ctx.inst.evidence.save.assert_called_once_with('isolated-fixture',
            {'root': str(inst.root), 'paths': inst.evidence.paths})

    def test_cleanup_error_fails_the_scenario(self):
        inst = Mock()
        inst.cleanup.run.return_value = ['owned cleanup fails']
        with patch('runtime.Instance', return_value=inst):
            with self.assertRaisesRegex(Failure, 'owned cleanup fails'):
                with isolated_fixture(self.context()):
                    pass

    def test_restart_uses_the_isolated_fixture_pause_lifecycle(self):
        from contextlib import contextmanager
        inst = Mock(cleanup=Cleanup())
        events = []
        @contextmanager
        def pause(context, hard=False):
            events.append(('pause', context, hard))
            yield
            events.append(('resume', context))
        with patch('runtime.Instance', return_value=inst):
            with isolated_fixture(self.context()) as fixture:
                fixture.pause_runtime = pause
                self.assertIsNone(fixture.restart(hard=True))
                self.assertEqual(events, [('pause', fixture, True), ('resume', fixture)])


class DatabaseNamespaceTests(unittest.TestCase):
    def test_instance_names_database_in_the_declared_lane_namespace(self):
        config = {'host': '127.0.0.1', 'email': 'e', 'password': 'p', 'model': {},
                  'database_prefix': 'gf_smoke_fixtures'}
        inst = Instance(config, 'postgres', Path('evidence'))
        self.assertRegex(inst.db, r'^gf_smoke_fixtures_[a-f0-9]{32}$')

    def test_database_namespace_rejects_invalid_identifiers(self):
        config = {'host': '127.0.0.1', 'email': 'e', 'password': 'p', 'model': {},
                  'database_prefix': 'invalid-prefix'}
        with self.assertRaisesRegex(Failure, 'database prefix'):
            Instance(config, 'postgres', Path('evidence'))

    def test_attached_runtime_restarts_when_its_database_namespace_changes(self):
        config = {'binary': '/bin/true', 'host': '127.0.0.1', 'pg': {}, 'model': {},
                  'source': '', 'published': 'latest', 'replace': {}, 'database_prefix': 'first_lane'}
        before = SourceSnapshot(config, 'postgres')
        after = SourceSnapshot(dict(config, database_prefix='second_lane'), 'postgres')
        self.assertEqual(before.changes(after)['restart'], ['runtime configuration or replacement mapping'])
