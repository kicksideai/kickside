import json
import unittest

from mocks.context_model import ContextModel, prompt_tokens
from mocks import Fixtures


class ContextModelTests(unittest.TestCase):
    def setUp(self):
        self.provider = ContextModel('http://127.0.0.1:1', token='fixture-secret', window=8192)
        self.headers = {'Authorization': 'Bearer fixture-secret'}

    def call(self, body):
        return self.provider.dispatch('POST', '/v1/chat/completions', {}, body, self.headers)

    def test_output_reservation_rejects_an_otherwise_fitting_prompt(self):
        body = {'messages': [{'role': 'user', 'content': 'a' * 20000}], 'max_tokens': 4000}
        self.assertLess(prompt_tokens(body), 8192)
        status, _, result = self.call(body)
        self.assertEqual(status, 400)
        self.assertEqual(result['error']['code'], 'context_length_exceeded')

    def test_answers_use_only_facts_present_in_each_request(self):
        body = {'messages': [{'role': 'user', 'content': '[FACT:temporary]'}], 'max_tokens': 256}
        self.assertIn('[FACT:temporary]', self.call(body)[2]['choices'][0]['message']['content'])
        body['messages'][0]['content'] = 'What was the temporary fact?'
        self.assertNotIn('[FACT:temporary]', self.call(body)[2]['choices'][0]['message']['content'])

    def test_stream_delivers_tool_call_and_prompt_usage(self):
        body = {'messages': [{'role': 'user', 'content': 'CONTEXT-ROUND'}], 'max_tokens': 256, 'stream': True,
                'tools': [{'function': {'name': 'ContextEvidence'}}]}
        status, headers, stream = self.call(body)
        self.assertEqual(status, 200)
        self.assertEqual(headers['Content-Type'], 'text/event-stream')
        chunks = [json.loads(row[6:]) for row in stream.splitlines() if row.startswith('data: {')]
        self.assertEqual(chunks[0]['choices'][0]['delta']['tool_calls'][0]['function']['name'], 'ContextEvidence')
        self.assertEqual(chunks[-1]['usage']['prompt_tokens'], prompt_tokens(body))
        self.assertTrue(stream.endswith('data: [DONE]\n\n'))

    def test_durable_empty_result_and_working_summary_are_independent(self):
        body = {'messages': [{'role': 'system', 'content': 'You write durable long-term memory'},
                             {'role': 'user', 'content': '[OPEN:temporary-task]'}], 'max_tokens': 256}
        self.assertEqual(self.call(body)[2]['choices'][0]['message']['content'], 'NO_DURABLE_MEMORY')
        body['messages'][0]['content'] = 'You create a bounded working session checkpoint'
        self.assertIn('[OPEN:temporary-task]', self.call(body)[2]['choices'][0]['message']['content'])


class ContextForwardingTests(unittest.TestCase):
    def test_real_transport_records_reported_usage_from_stream(self):
        fixtures = Fixtures()
        try:
            base = fixtures.start('context-model', token='upstream-fixture', window=8192)
            observed = []
            proxy = ContextModel('http://127.0.0.1:1', token='proxy-fixture', window=8192,
                forward={'base': base + '/v1', 'key': 'upstream-fixture', 'llm': 'live-model'}, observe=observed.append)
            body = {'model': 'proxy-model', 'messages': [{'role': 'user', 'content': '[FACT:temporary]'}],
                    'max_tokens': 256, 'stream': True}
            status, _, stream = proxy.dispatch('POST', '/v1/chat/completions', {}, body,
                                              {'Authorization': 'Bearer proxy-fixture'})
            self.assertEqual(status, 200)
            self.assertIn('[FACT:temporary]', stream)
            self.assertEqual(observed[0]['input'], prompt_tokens(body))
            self.assertEqual(observed[0]['finish_reasons'], ['stop'])
            self.assertEqual(observed[0]['generated'], 32)
            upstream = fixtures.requests('context-model')[0]
            self.assertEqual(upstream['body']['model'], 'live-model')
            self.assertTrue(upstream['body']['stream_options']['include_usage'])
            self.assertNotIn('upstream-fixture', json.dumps(upstream))
        finally:
            fixtures.stop()

    def test_forwarded_provider_rejection_remains_an_error(self):
        fixtures = Fixtures()
        try:
            base = fixtures.start('context-model', token='upstream-fixture', window=128)
            proxy = ContextModel('http://127.0.0.1:1', token='proxy-fixture', window=8192,
                forward={'base': base + '/v1', 'key': 'upstream-fixture', 'llm': 'live-model'})
            status, _, result = proxy.dispatch('POST', '/v1/chat/completions', {},
                {'messages': [{'role': 'user', 'content': 'evidence ' * 100}], 'max_tokens': 256},
                {'Authorization': 'Bearer proxy-fixture'})
            self.assertEqual(status, 400)
            self.assertEqual(result['error']['code'], 'context_length_exceeded')
        finally:
            fixtures.stop()

    def test_forwarded_truncation_is_observed_without_changing_the_response(self):
        from unittest.mock import MagicMock, patch
        result={'choices':[{'message':{'content':'partial summary'},'finish_reason':'length'}],
                'usage':{'prompt_tokens':100,'completion_tokens':256}}
        response=MagicMock()
        response.__enter__.return_value=response
        response.read.return_value=json.dumps(result).encode()
        response.headers={'Content-Type':'application/json'}
        observed=[]
        proxy=ContextModel('http://127.0.0.1:1',token='proxy-fixture',window=8192,
            forward={'base':'https://models.invalid/v1','key':'upstream-fixture','llm':'live-model'},observe=observed.append)
        with patch('mocks.context_model.urllib.request.urlopen',return_value=response):
            status,_,actual=proxy.dispatch('POST','/v1/chat/completions',{},
                {'messages':[{'role':'user','content':'summarize'}],'max_tokens':256},
                {'Authorization':'Bearer proxy-fixture'})
        self.assertEqual(status,200)
        self.assertEqual(actual,result)
        self.assertEqual(observed[0]['finish_reasons'],['length'])
        self.assertEqual(observed[0]['generated'],256)
