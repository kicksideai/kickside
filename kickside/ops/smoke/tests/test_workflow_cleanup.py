import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock
from types import SimpleNamespace
from unittest.mock import patch

from cleanup_evidence import delete_workflow, workflow_publication_ready
from harness import Cleanup, load_registry
from runtime import RuntimePool
from scenarios_providers import research_workflow_fixture


class WorkflowCleanupTests(unittest.TestCase):
    def test_visible_workflow_guard_reuses_the_live_provider_fixture_context(self):
        registry = {scenario.name: scenario for scenario in load_registry(Path(__file__).resolve().parents[1])}
        guard = registry['regression_visible_workflow_teardown']
        fixture = registry['providers_phantombuster_origin_connect']
        with tempfile.TemporaryDirectory() as directory:
            pool = RuntimePool({'model': {}, 'host': '127.0.0.1', 'email': 'fixture@example.invalid',
                                'password': 'fixture-password'}, 'sqlite', Path(directory))
            origin = pool.context(fixture.owner)
            origin.state['provider_bases'] = {'phantombuster': 'http://127.0.0.1:12345'}
            context = pool.context(guard.owner)
            self.assertIs(context, origin, 'The guard loses its live provider fixture and browser owner')
            self.assertEqual(context.state['provider_bases'], origin.state['provider_bases'])

    def test_visible_workflow_cleanup_releases_its_browser_before_deletion(self):
        inst = Mock(cleanup=Cleanup())
        ctx = SimpleNamespace(inst=inst, browser=Mock())
        calls = []
        def request(method, path, *args, **kwargs):
            if method == 'DELETE':
                self.assertIsNone(ctx.browser, 'Workflow deletion leaves its browser polling the removed resource')
                calls.append('delete')
            if path == '/api/v1/workflows':
                return {'flow_id': 'owned-flow'}
            if path.startswith('/api/v1/keeper/registry/entry'):
                return {'entry': {'data': {'block': {'input': {'type': 'object'}}}}}
            return {'version': 1}
        def release(context):
            self.assertIs(context, ctx)
            calls.append('release')
            context.browser = None
        ctx.browser.clean.side_effect = lambda start: calls.append('clean')
        inst.request.side_effect = request
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        with patch('cleanup_evidence.workflow_publication_ready', return_value=True), \
                patch('cleanup_evidence.Browser.release', side_effect=release):
            research_workflow_fixture(ctx, 'example', {})
            self.assertEqual(inst.cleanup.run(scope='scenario'), [])
        self.assertEqual(calls, ['clean', 'release', 'delete'])

    def test_waits_for_every_terminal_publication_before_deleting(self):
        with tempfile.TemporaryDirectory() as directory:
            inst = Mock(engine='sqlite', root=Path(directory))
            (inst.root / 'data').mkdir()
            with sqlite3.connect(inst.root / 'data' / 'app.db') as db:
                db.execute('CREATE TABLE workflow_runs (workflow_id TEXT, status TEXT, terminal_event_pending BOOLEAN)')
                db.execute("INSERT INTO workflow_runs VALUES ('flow', 'failed', TRUE)")
                db.execute("INSERT INTO workflow_runs VALUES ('other', 'running', TRUE)")
                db.commit()
                def wait(predicate, *args, **kwargs):
                    self.assertFalse(predicate())
                    inst.request.assert_not_called()
                    db.execute("UPDATE workflow_runs SET terminal_event_pending=FALSE WHERE workflow_id='flow'")
                    db.commit()
                    self.assertTrue(predicate())
                inst.wait.side_effect = wait
                delete_workflow(SimpleNamespace(inst=inst, browser=None), 'flow')
                inst.request.assert_called_once_with('DELETE', '/api/v1/workflows/flow')
                for status in ('pending', 'running'):
                    db.execute("UPDATE workflow_runs SET status=? WHERE workflow_id='flow'", (status,))
                    db.commit()
                    self.assertFalse(workflow_publication_ready(inst, 'flow'))
                for status in ('completed', 'failed', 'cancelled', 'terminated'):
                    db.execute("UPDATE workflow_runs SET status=? WHERE workflow_id='flow'", (status,))
                    db.commit()
                    self.assertTrue(workflow_publication_ready(inst, 'flow'))
