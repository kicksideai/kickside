import unittest

from harness import Failure
from mocks.context_model import prompt_tokens
from scenarios_providers import _direct_jira_rows, _direct_result_messages, _model_request_fits


class DirectResultChatFixtureTests(unittest.TestCase):
    def test_native_jira_result_contains_the_complete_key_title_page(self):
        call = {'metadata': {'result': {'count': 1, 'issues': [{'key': 'EE2-65', 'fields': {'summary': 'Reporter ticket'}}]}}}
        self.assertEqual(_direct_jira_rows(call), [('EE2-65', 'Reporter ticket')])

    def test_direct_jira_result_has_no_continuation_envelope(self):
        transcript = [
            {'type': 'function', 'data': '{"action":"search_issues"}',
             'metadata': {'function_name': 'JiraRead', 'result':
                 {'count': 1, 'issues': [{'key': 'EE2-65', 'fields': {'summary': 'Reporter ticket'}}]}}}]
        self.assertEqual(_direct_result_messages(transcript), transcript)
        self.assertEqual(_direct_jira_rows(transcript[0]), [('EE2-65', 'Reporter ticket')])

    def test_continuation_tool_or_envelope_fails_the_direct_chat_guard(self):
        with self.assertRaises(Failure):
            _direct_result_messages([
                {'type': 'function', 'data': '{}', 'metadata': {
                    'function_name': 'JiraRead', 'result': {'partial': True, 'continuation': {'tool': 'ReadToolResult'}}}},
                {'type': 'function', 'data': '{}', 'metadata': {'function_name': 'ReadToolResult', 'result': {}}}])

    def test_recorded_request_reserves_output_inside_the_model_window(self):
        body = {'messages': [{'role': 'user', 'content': 'EE2 list'}], 'max_tokens': 1024}
        record = {'body': body, 'response': {'usage': {'prompt_tokens': prompt_tokens(body)}}}
        sizes = _model_request_fits(record, 32768, 1024)
        self.assertEqual(sizes['requested_output'], 1024)

    def test_prompt_bytes_do_not_stand_in_for_tokens(self):
        body = {'messages': [{'role': 'user', 'content': 'Northwind ' * 5200}], 'max_tokens': 1024}
        record = {'body': body, 'response': {'usage': {'prompt_tokens': prompt_tokens(body)}}}
        sizes = _model_request_fits(record, 32768, 1024)
        self.assertLess(sizes['prompt_tokens'] + sizes['requested_output'], 32768)

    def test_request_exceeding_the_model_window_fails(self):
        body = {'messages': [{'role': 'user', 'content': 'EE2 list'}], 'max_tokens': 1024}
        record = {'body': body, 'response': {'usage': {'prompt_tokens': prompt_tokens(body)}}}
        with self.assertRaisesRegex(Failure, 'context window'):
            _model_request_fits(record, 1000, 1024)

    def test_request_exceeding_its_output_reservation_fails(self):
        body = {'messages': [{'role': 'user', 'content': 'EE2 list'}], 'max_tokens': 1025}
        record = {'body': body, 'response': {'usage': {'prompt_tokens': prompt_tokens(body)}}}
        with self.assertRaisesRegex(Failure, 'output reservation'):
            _model_request_fits(record, 32768, 1024)


class NativeJiraEnvelopeTests(unittest.TestCase):
    def test_wrapped_or_partial_native_pages_fail(self):
        import json
        for page in ({'count': 0, 'issues': [], 'continuation': {}},
                     {'count': 0, 'issues': [], 'partial': True},
                     {'content': '{"count":0,"issues":[]}'}):
            with self.subTest(page=page), self.assertRaisesRegex(Failure, 'result-window envelope'):
                _direct_jira_rows({'metadata': {'result': json.dumps(page)}})


if __name__ == '__main__':
    unittest.main()
