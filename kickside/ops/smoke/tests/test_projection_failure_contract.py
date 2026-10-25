from pathlib import Path
from types import SimpleNamespace
import tempfile
import unittest
from unittest.mock import Mock, patch

from harness import Cleanup
from scenarios_ticket_closure import projection_failure_contract


class ProjectionFailureContractTests(unittest.TestCase):
    def test_projection_cleanup_cancels_slots_before_deleting_thread(self):
        with tempfile.TemporaryDirectory() as directory:
            thread_id = 'failure-thread'
            base = '/api/v1/threads/' + thread_id
            cursors = []
            jobs = []
            calls = []

            def request(method, path, body=None, *, label=None, **_kwargs):
                calls.append((method, path, body, label))
                if method == 'POST' and path == '/api/v1/threads':
                    return {'thread': {'id': thread_id}, 'component_id': thread_id}
                if method == 'POST' and path == base + '/messages':
                    return {}
                if method == 'POST' and path == base + '/projections':
                    failure = body['projection_key']
                    registered = {'projection_id': 'projection-' + failure,
                                  'cursor_id': 'cursor-' + failure, 'job_id': 'job-' + failure}
                    cursors.append({'id': registered['cursor_id'], 'job_id': registered['job_id'], 'last_seq': 0,
                                    'status': 'invalid' if failure == 'deterministic' else 'active'})
                    jobs.append({'id': registered['job_id'], 'status': 'pending',
                                 'scheduled_at': None if failure == 'deterministic' else '2030-01-01T00:00:00Z',
                                 'execution_seq': 1, 'attempts': 3, 'max_attempts': 3,
                                 'last_error': 'projection worker boom' if failure == 'deterministic' else 'database unavailable'})
                    return registered
                if method == 'GET' and path == base + '/projections':
                    return {'cursors': list(cursors)}
                if method == 'GET' and path == '/api/v1/jobs?thread_id=' + thread_id:
                    return {'jobs': list(jobs)}
                if method == 'POST' and path == base + '/projections/remove':
                    projection_id = body['projection_id']
                    failure = projection_id.removeprefix('projection-')
                    cursor_id, job_id = 'cursor-' + failure, 'job-' + failure
                    cursors[:] = [cursor for cursor in cursors if cursor['id'] != cursor_id]
                    next(job for job in jobs if job['id'] == job_id)['status'] = 'cancelled'
                    return {'success': True, 'removed': {'projection_id': projection_id, 'removed_cursors': 1}}
                raise AssertionError('Unexpected request: ' + repr((method, path, body, label)))

            inst = SimpleNamespace(app=Path(directory), cleanup=Cleanup(), request=request,
                                   wait=lambda condition, *_args, **_kwargs: condition(), evidence=Mock())
            (inst.app / 'src').mkdir()
            ctx = SimpleNamespace(inst=inst, restart=lambda: None)
            deleted = []
            with patch('scenarios_ticket_closure.delete_component', side_effect=lambda *_args: deleted.append(thread_id)):
                projection_failure_contract(ctx)
                self.assertEqual(inst.cleanup.run(scope='scenario'), [])

            removal_labels = [label for method, path, _body, label in calls
                              if method == 'POST' and path == base + '/projections/remove']
            self.assertEqual(removal_labels, ['projection-failure-remove-infrastructure',
                                              'projection-failure-remove-deterministic'])
            self.assertEqual(cursors, [])
            self.assertEqual([job['status'] for job in jobs], ['cancelled', 'cancelled'])
            self.assertEqual(deleted, [thread_id])
            self.assertEqual([call.args[0] for call in inst.evidence.save.call_args_list
                              if call.args[0].startswith('projection-failure-cleanup-')],
                             ['projection-failure-cleanup-infrastructure',
                              'projection-failure-cleanup-deterministic'])
