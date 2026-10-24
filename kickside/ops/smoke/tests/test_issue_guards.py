import os
from pathlib import Path
from types import SimpleNamespace
import tempfile
import unittest
from unittest.mock import Mock, patch

from harness import Cleanup
from scenarios_issue_guards import install_keeps_sessions, member


class RestartFixtureLifetime(unittest.TestCase):
    def test_member_remains_until_instance_cleanup_after_runtime_pause(self):
        request = Mock(return_value={'user': {'user_id': 'restart-member'}})
        inst = SimpleNamespace(request=request, cleanup=Cleanup(), password='fixture-password')
        member(inst, 'restart-session')

        self.assertEqual(inst.cleanup.run(scope='scenario'), [])
        self.assertEqual(request.call_count, 1)

        self.assertEqual(inst.cleanup.run(), [])
        request.assert_called_with('DELETE', '/api/v1/users/restart-member',
                                   expect=(202,), label='restart-session-delete')
        self.assertEqual(request.call_count, 2)
        self.assertEqual(inst.cleanup.run(), [])
        self.assertEqual(request.call_count, 2)


class InstallSessionGuardTests(unittest.TestCase):
    def test_member_session_survives_install_and_member_deletes_once_at_cleanup(self):
        calls = []
        def request(method, path, *args, **kwargs):
            calls.append((method, path))
            if path.startswith('/api/v1/keeper/hub/dependencies'):
                return {'dependencies': []}
            if path == '/api/v1/users':
                return {'user': {'user_id': 'install-member'}}
            if path == '/api/public/user/token':
                return {'token': 'member-token'}
            return {}
        inst = SimpleNamespace(request=Mock(side_effect=request), cleanup=Cleanup(), password='fixture-password',
                               install=Mock(), redactor=Mock(), boot=Mock(), root="fresh", evidence=Mock())
        parent = Mock()
        parent.evidence.root = Path("evidence")
        parent.evidence.label = "guard"
        parent.request.return_value = {'dependencies': [{'component': name} for name in
                                                       ('kickside/mcp', 'kickside/webhooks')]}
        with patch('runtime.Instance', return_value=inst), \
                patch('scenarios.Context.browser_check') as browser, \
                patch('scenarios_issue_guards.session_screen') as screen:
            install_keeps_sessions(SimpleNamespace(inst=parent, browser_session=None))
        browser.return_value.login.assert_called_once()
        self.assertEqual(screen.call_count, 2)
        self.assertEqual(screen.call_args.kwargs, {'reload': True})
        parent.request.assert_not_called()

        inst.install.assert_called_once_with('kickside/mcp')
        self.assertIn(('GET', '/api/v1/mcp/credentials'), calls)
        self.assertEqual(inst.cleanup.run(), [])
        self.assertEqual(calls.count(('DELETE', '/api/v1/users/install-member')), 1)


class JobHistorySessionOrderTests(unittest.TestCase):
    def test_job_history_fixture_uses_the_selected_jobs_source(self):
        import scenarios_job_history as history
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            jobs = Path(directory) / 'selected-jobs'
            fixture = jobs / 'test/src/job_fixture.lua'
            fixture.parent.mkdir(parents=True)
            fixture.write_text('return { private_queue = function() end }\n')
            ctx = SimpleNamespace(inst=SimpleNamespace(config={'replace': {'kickside/jobs': str(jobs)}}))
            self.assertEqual(history.job_fixture_source(ctx), fixture.read_text())

    def test_member_sessions_are_minted_after_the_module_install_that_revokes_them(self):
        import scenarios_job_history as history
        events = []
        ctx = Mock()
        ctx.inst.install.side_effect = lambda component: events.append('install ' + component)
        def request(method, path, *args, **kwargs):
            if path == '/api/public/user/token':
                events.append('login')
                raise StopIteration
            return {'user': {'user_id': 'u'}, 'token': 't'}
        ctx.inst.request.side_effect = request
        with self.assertRaises(StopIteration):
            history.core_job_history_pagination(ctx)
        self.assertEqual(events, ['install kickside/mcp', 'login'])
