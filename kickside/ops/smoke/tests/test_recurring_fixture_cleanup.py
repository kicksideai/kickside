import unittest
from unittest.mock import Mock, patch
from harness import Cleanup
from scenarios import Context, automations
import cleanup_evidence


class RecurringFixtureTests(unittest.TestCase):
    def context(self):
        inst = Mock(cleanup=Cleanup())
        def request(method, path, body=None, **kwargs):
            if method == 'POST' and path == '/api/v1/automations':
                return {'id': 'owned-fixture'}
            if method == 'DELETE':
                return {'success': True, 'id': 'owned-fixture', 'deleted': True}
            if method == 'GET' and path == '/api/v1/automations':
                return {'automations': []}
            if path.startswith('/api/v1/inbox'):
                return {'items': [{'id': identifier, 'title': 'Northwind scheduled notice'}
                                  for identifier in ['occurrence-1', 'occurrence-2']]}
            return {}
        inst.request.side_effect = request
        inst.wait.side_effect = lambda condition, *args, **kwargs: condition()
        return Context(inst)

    def assert_deleted(self, ctx):
        self.assertEqual(ctx.inst.cleanup.run(scope='scenario'), [])
        deletes = [call.args[1] for call in ctx.inst.request.call_args_list if call.args[0] == 'DELETE']
        self.assertEqual(deletes, ['/api/v1/automations/owned-fixture'])

    def test_successful_fixture_stops_its_recurring_producer_at_scenario_boundary(self):
        ctx = self.context()
        with patch('scenarios.nav'):
            automations(ctx)
        self.assert_deleted(ctx)

    def test_fixture_failure_still_stops_its_recurring_producer(self):
        ctx = self.context()
        ctx.inst.wait.side_effect = ValueError('delivery assertion fails')
        with self.assertRaisesRegex(ValueError, 'delivery assertion fails'):
            automations(ctx)
        ctx.inst.wait.side_effect = lambda condition, *args, **kwargs: condition()
        self.assert_deleted(ctx)

    def test_explicit_cleanup_unregisters_the_owned_producer(self):
        ctx = self.context()
        cleanup = cleanup_evidence.own_automation(ctx.inst, 'owned-fixture')
        cleanup()
        self.assert_deleted(ctx)

    def test_cleanup_reports_deletion_errors(self):
        ctx = self.context()
        cleanup_evidence.own_automation(ctx.inst, 'owned-fixture')
        ctx.inst.request.side_effect = ValueError('deletion fails')
        self.assertEqual(ctx.inst.cleanup.run(scope='scenario'),
                         ['Automation owned-fixture: ValueError: deletion fails'])

if __name__ == '__main__':
    unittest.main()
