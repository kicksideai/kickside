from types import SimpleNamespace
import unittest
from unittest.mock import patch

import scenarios_providers


class JiraCommentScenarioTests(unittest.TestCase):
    def test_reads_created_comment_from_the_native_detail_action(self):
        ctx = SimpleNamespace(state={'jira_connection': 'connection'})
        body = 'Northwind packing desk confirms 24 cartons'
        calls = []
        def probe(ctx, **kwargs):
            args = kwargs['arguments']
            calls.append(args)
            if args['action'] == 'add_comment':
                return {'success': True, 'comment_id': 'created'}
            if args['action'] == 'get_comments':
                return {'success': True, 'comments': [{'id': 'created', 'author': 'Operator'}]}
            if args['action'] == 'get_comment':
                self.assertEqual(args['comment_id'], 'created')
                return {'success': True, 'comment': {'id': 'created', 'body': body, 'body_text': body}}
            raise AssertionError(args)
        with patch.object(scenarios_providers, 'probe', probe):
            scenarios_providers.jira_comment_text(ctx)
        self.assertEqual([row['action'] for row in calls], ['add_comment', 'get_comments', 'get_comment'])
