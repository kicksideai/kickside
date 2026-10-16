from contextlib import contextmanager
from datetime import datetime, timezone
import json
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Failure
import scenarios_connection_capacity as capacity


class CapacityRestartBoundaryTests(unittest.TestCase):
    def run_scenario(self, *, stored=True, effect_delta=1):
        due = 1800000000000
        next_run = datetime.fromtimestamp(due / 1000, timezone.utc).isoformat()
        state = {'phase': 'before', 'titles': {}, 'checks': []}
        browser = Mock()
        inst = Mock()

        def request(method, path, body=None, **kwargs):
            self.assertNotEqual(state['phase'], 'stopped', 'HTTP is unavailable while stopped')
            if method == 'POST' and path == '/api/v1/connections':
                return {'component_id': 'shared' if body['name'].startswith('Shared ') else 'independent'}
            if method == 'POST' and path == '/api/v1/automations':
                name = body['input']['title'].split()[1]
                state['titles'][name] = body['input']['title']
                return {'id': name}
            if path.endswith('/status'):
                drive = {'last_error': {'kind': 'RateLimited'}, 'next_run_at': next_run}
                return {'drives': [drive if state['phase'] == 'before' else {'phase': 'active'}]}
            if path.startswith('/api/v1/inbox'):
                return {'items': [{'title': title} for title in state['titles'].values()]}
            self.assertEqual(method, 'DELETE')
            return {}

        def rows(instance, query, **kwargs):
            if 'kickside_component_meta' in query:
                return [{'value': str(due)}]
            if 'kickside_automation_drive' in query:
                self.assertEqual(state['phase'], 'stopped')
                state['checks'].append('durable wait')
                return [{'next_run_at': next_run,
                         'last_error_json': json.dumps({'kind': 'RateLimited'})}] if stored else []
            self.assertIn('smoke_capacity_calls', query)
            return ([{'consumer': state['titles']['B'], 'called_at_ms': due + effect_delta}]
                    if state['phase'] == 'after' else [])

        @contextmanager
        def paused():
            state['phase'] = 'stopped'
            try:
                yield
            finally:
                state['phase'] = 'after'

        def restart(ctx):
            state['phase'] = 'after'
            return browser

        def wait(predicate, *args, **kwargs):
            result = predicate()
            self.assertTrue(result)
            return result

        inst.request.side_effect = request
        inst.wait.side_effect = wait
        ctx = SimpleNamespace(inst=inst, browser=browser, paused=paused,
                              browser_check=lambda: browser, restart_runtime=restart)
        with patch.object(capacity, 'database_rows', side_effect=rows), \
             patch.object(capacity, 'install_fixture'), patch.object(capacity, 'complete_splashes'), \
             patch.object(capacity, 'nav'), patch('playwright.sync_api.expect'):
            capacity.connection_capacity_live(ctx)
        self.assertEqual(state['checks'], ['durable wait'])

    def test_restart_checks_the_durable_wait_before_expired_work_can_resume(self):
        self.run_scenario()

    def test_restart_rejects_a_missing_durable_wait(self):
        with self.assertRaisesRegex(Failure, 'durable capacity wait'):
            self.run_scenario(stored=False)

    def test_restart_still_rejects_provider_effects_before_the_exact_floor(self):
        with self.assertRaisesRegex(Failure, 'Second sync provider calls precede the exact floor'):
            self.run_scenario(effect_delta=-1)


if __name__ == '__main__':
    unittest.main()
