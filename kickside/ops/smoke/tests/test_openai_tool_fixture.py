import json
import unittest
from mocks.openai_tools import OpenAITools


class OpenAIToolFixtureTests(unittest.TestCase):
    def setUp(self):
        self.provider = OpenAITools('http://127.0.0.1:1', '', tool_names=['RecordEffect'], token='fixture-secret')
        self.headers = {'Authorization': 'Bearer fixture-secret'}
        self.body = {'model': 'tool-fixture', 'messages': [{'role': 'user', 'content': 'Record the effect'}],
                     'tools': [{'type': 'function', 'function': {'name': 'RecordEffect', 'parameters': {'type': 'object', 'properties': {}}}}]}

    def test_tool_request_uses_an_offered_function_with_valid_arguments(self):
        status, _, result = self.provider.dispatch('POST', '/v1/chat/completions', {}, self.body, self.headers)
        self.assertEqual(status, 200)
        choice = result['choices'][0]
        self.assertEqual(choice['finish_reason'], 'tool_calls')
        call = choice['message']['tool_calls'][0]
        self.assertEqual(call['function']['name'], 'RecordEffect')
        self.assertEqual(json.loads(call['function']['arguments']), {})
        self.assertNotIn('fixture-secret', json.dumps(result))

    def test_missing_offered_function_completes_without_fabricating_a_tool(self):
        provider = OpenAITools('http://127.0.0.1:1', '', tool_names=['JiraRead'], token='fixture-secret',
                               final_content=lambda body: 'Ordinary completion')
        body = {**self.body, 'tools': []}
        status, _, result = provider.dispatch('POST', '/v1/chat/completions', {}, body, self.headers)
        self.assertEqual(status, 200)
        self.assertEqual(result['choices'][0]['finish_reason'], 'stop')
        self.assertNotIn('tool_calls', result['choices'][0]['message'])
        self.assertEqual(result['choices'][0]['message']['content'], 'Ordinary completion')

    def test_tool_result_completes_the_turn_without_repeating_the_effect(self):
        self.body['messages'].append({'role': 'tool', 'tool_call_id': 'effect-call', 'content': '{"success":true}'})
        status, _, result = self.provider.dispatch('POST', '/v1/chat/completions', {}, self.body, self.headers)
        self.assertEqual(status, 200)
        self.assertEqual(result['choices'][0]['finish_reason'], 'stop')
        self.assertNotIn('tool_calls', result['choices'][0]['message'])

    def test_wrong_bearer_never_releases_a_tool_response(self):
        status, _, result = self.provider.dispatch('POST', '/v1/chat/completions', {}, self.body, {'Authorization': 'Bearer wrong'})
        self.assertEqual(status, 401)
        self.assertNotIn('choices', result)

    def test_multiple_offered_tools_receive_independent_calls(self):
        provider = OpenAITools('http://127.0.0.1:1', '', tool_names=['RecordEffect', 'CheckAccess'], token='fixture-secret')
        self.body['tools'].append({'type': 'function', 'function': {'name': 'CheckAccess'}})
        status, _, result = provider.dispatch('POST', '/v1/chat/completions', {}, self.body, self.headers)
        self.assertEqual(status, 200)
        calls = result['choices'][0]['message']['tool_calls']
        self.assertEqual([call['function']['name'] for call in calls], ['RecordEffect', 'CheckAccess'])
        self.assertEqual(len({call['id'] for call in calls}), 2)

    def test_scripted_tool_call_keeps_its_declared_arguments_and_final_answer(self):
        provider = OpenAITools('http://127.0.0.1:1', '', tool_names=['JiraRead'], token='fixture-secret',
                               tool_calls=[{'name': 'JiraRead', 'arguments': {
                                   'action': 'search_issues',
                                   'jql': 'project = EE2 AND creator = currentUser() ORDER BY created DESC',
                                   'max_results': 25}}],
                               final_content='EE2-1 First ticket')
        body = {**self.body, 'tools': [{'type': 'function', 'function': {'name': 'JiraRead'}}]}
        status, _, result = provider.dispatch('POST', '/v1/chat/completions', {}, body, self.headers)
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(result['choices'][0]['message']['tool_calls'][0]['function']['arguments']), {
            'action': 'search_issues',
            'jql': 'project = EE2 AND creator = currentUser() ORDER BY created DESC',
            'max_results': 25})
        body['messages'] += [{'role': 'tool', 'tool_call_id': 'effect-call', 'content': '{"issues":[]}'}]
        status, _, result = provider.dispatch('POST', '/v1/chat/completions', {}, body, self.headers)
        self.assertEqual(status, 200)
        self.assertEqual(result['choices'][0]['message']['content'], 'EE2-1 First ticket')

    def test_model_plan_can_request_two_native_tool_calls_in_one_turn(self):
        provider = OpenAITools('http://127.0.0.1:1', '', tool_names=['JiraRead'], token='fixture-secret',
                               tool_call_plans={'two-reads': [
                                   {'name': 'JiraRead', 'arguments': {'action': 'search_issues', 'max_results': 25}},
                                   {'name': 'JiraRead', 'arguments': {'action': 'search_issues', 'max_results': 25}}]})
        body = {**self.body, 'model': 'two-reads',
                'tools': [{'type': 'function', 'function': {'name': 'JiraRead'}}]}
        status, _, result = provider.dispatch('POST', '/v1/chat/completions', {}, body, self.headers)
        self.assertEqual(status, 200)
        self.assertEqual(len(result['choices'][0]['message']['tool_calls']), 2)

    def test_final_answer_callback_uses_the_returned_tool_content(self):
        provider = OpenAITools('http://127.0.0.1:1', '', tool_names=['JiraRead'], token='fixture-secret',
                               final_content=lambda body: json.loads(body['messages'][-1]['content'])['issues'][0]['key'])
        body = {**self.body, 'tools': [{'type': 'function', 'function': {'name': 'JiraRead'}}]}
        status, _, _ = provider.dispatch('POST', '/v1/chat/completions', {}, body, self.headers)
        self.assertEqual(status, 200)
        body['messages'] += [{'role': 'tool', 'tool_call_id': 'effect-call',
                              'content': '{"issues":[{"key":"EE2-90"}]}'}]
        status, _, result = provider.dispatch('POST', '/v1/chat/completions', {}, body, self.headers)
        self.assertEqual(status, 200)
        self.assertEqual(result['choices'][0]['message']['content'], 'EE2-90')

    def test_a_later_user_turn_requests_tools_after_previous_tool_history(self):
        self.body['messages'] += [{'role': 'tool', 'tool_call_id': 'prior', 'content': '{"success":true}'},
                                 {'role': 'assistant', 'content': 'Prior turn completes'},
                                 {'role': 'user', 'content': 'Record a later effect'}]
        status, _, result = self.provider.dispatch('POST', '/v1/chat/completions', {}, self.body, self.headers)
        self.assertEqual(status, 200)
        self.assertEqual(result['choices'][0]['finish_reason'], 'tool_calls')
        self.assertEqual(result['choices'][0]['message']['tool_calls'][0]['function']['name'], 'RecordEffect')
