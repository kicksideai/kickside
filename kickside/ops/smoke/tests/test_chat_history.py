import unittest
from types import SimpleNamespace
from unittest.mock import Mock

from harness import Failure
from scenarios_ai import function_messages, messages


class ChatHistoryTests(unittest.TestCase):
    def test_recovers_older_pages_before_the_recent_page(self):
        newest = {'message_id': 'new', 'type': 'assistant'}
        older = {'message_id': 'old', 'type': 'function', 'metadata': {'function_name': 'AutomationsRead'}}
        inst = Mock()
        inst.request.side_effect = [
            {'messages': [newest], 'pagination': {'has_more': True, 'next_cursor': 'new'}},
            {'messages': [older], 'pagination': {'has_more': False}},
        ]
        self.assertEqual(messages(SimpleNamespace(inst=inst), 'session'), [older, newest])
        self.assertIn('cursor=new', inst.request.call_args.args[1])

    def test_rejects_a_nonadvancing_history_cursor(self):
        inst = Mock()
        inst.request.return_value = {'messages': [{'message_id': 'same'}],
                                     'pagination': {'has_more': True, 'next_cursor': 'same'}}
        with self.assertRaises(Failure):
            messages(SimpleNamespace(inst=inst), 'session')

    def test_selects_tool_messages_without_assuming_other_metadata_is_an_object(self):
        tool = {'type': 'function', 'metadata': {'function_name': 'AutomationsRead'}}
        stored = [{'type': 'developer', 'metadata': []}, {'type': 'user', 'metadata': {}}, tool]
        self.assertEqual(function_messages(stored, 'AutomationsRead'), [tool])
