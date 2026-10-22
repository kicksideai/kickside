import unittest

from mocks.openai_tools import OpenAITools


class ModelResponseScriptTests(unittest.TestCase):
    def test_script_preserves_invalid_arguments_and_provider_errors(self):
        responses = [
            (200, {}, {'choices': [{'message': {'tool_calls': [{'function': {'arguments': '{"answer":'}}]}}]}),
            (402, {}, {'error': {'code': 'insufficient_quota', 'message': 'Fixture account is exhausted'}}),
        ]
        provider = OpenAITools('http://127.0.0.1:1', tool_names=[], token='test',
                               models=[{'id': 'script-model'}], response=lambda body: responses.pop(0))
        headers = {'Authorization': 'Bearer test'}
        status, _, listing = provider.dispatch('GET', '/v1/models', {}, {}, headers)
        self.assertEqual(listing['data'], [{'id': 'script-model'}])
        body = {'messages': [{'role': 'user', 'content': 'Finish'}]}
        status, _, payload = provider.dispatch('POST', '/v1/chat/completions', {}, body, headers)
        self.assertEqual(status, 200)
        self.assertEqual(payload['choices'][0]['message']['tool_calls'][0]['function']['arguments'], '{"answer":')
        status, _, payload = provider.dispatch('POST', '/v1/chat/completions', {}, body, headers)
        self.assertEqual(status, 402)
        self.assertEqual(payload['error']['code'], 'insufficient_quota')
        with self.assertRaises(IndexError):
            provider.dispatch('POST', '/v1/chat/completions', {}, body, headers)

    def test_unauthenticated_request_does_not_consume_script(self):
        seen = []
        provider = OpenAITools('http://127.0.0.1:1', tool_names=[], token='test',
                               response=lambda body: seen.append(body))
        status, _, _ = provider.dispatch('POST', '/v1/chat/completions', {}, {'messages': [{}]}, {})
        self.assertEqual(status, 401)
        self.assertEqual(seen, [])

    def test_responses_api_keeps_the_original_provider_payload(self):
        payload = {'status': 'completed', 'output': [{'type': 'function_call', 'arguments': '{"answer":'}]}
        provider = OpenAITools('http://127.0.0.1:1', tool_names=[], token='test',
                               response=lambda body: (200, {}, payload))
        status, _, result = provider.dispatch('POST', '/v1/responses', {},
            {'input': [{'role': 'user', 'content': 'Finish'}]}, {'Authorization': 'Bearer test'})
        self.assertEqual(status, 200)
        self.assertEqual(result, payload)
