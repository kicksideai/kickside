import unittest
from unittest.mock import Mock

from data_contracts import inbox_items
from harness import Failure


class InboxPointQueryTests(unittest.TestCase):
    def test_point_query_encodes_identity_and_returns_only_one_page(self):
        request = Mock(return_value={'items': [{'id': 'a?b&c'}], 'total_count': 1})
        rows, _ = inbox_items(request, identifier='a?b&c')
        self.assertEqual(rows, [{'id': 'a?b&c'}])
        self.assertEqual(request.call_count, 1)
        self.assertIn('&id=a%3Fb%26c', request.call_args.args[1])

    def test_absent_identity_is_an_empty_committed_read(self):
        request = Mock(return_value={'items': [], 'total_count': 0})
        rows, _ = inbox_items(request, identifier='absent')
        self.assertEqual(rows, [])
        self.assertEqual(request.call_count, 1)

    def test_ignored_identity_filter_is_a_contract_failure(self):
        for page in ({'items': [{'id': 'other'}], 'total_count': 1},
                     {'items': [], 'total_count': 3500}):
            with self.subTest(page=page), self.assertRaises(Failure):
                inbox_items(Mock(return_value=page), identifier='target')
