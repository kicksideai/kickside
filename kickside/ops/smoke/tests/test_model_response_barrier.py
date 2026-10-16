import threading
import unittest
from mocks.openai_tools import OpenAITools


class ModelResponseBarrierTests(unittest.TestCase):
    def test_tool_response_waits_for_release_without_executing_a_tool(self):
        entered, released = threading.Event(), threading.Event()
        outcomes = []
        def barrier():
            entered.set()
            if not released.wait(timeout=5):
                raise RuntimeError('Model response barrier times out')
        provider = OpenAITools('http://127.0.0.1:1', tool_names=['RecordEffect'], token='fixture-secret',
                               before_tool_response=barrier)
        body = {'model': 'fixture', 'messages': [{'role': 'user', 'content': 'Run'}],
                'tools': [{'function': {'name': 'RecordEffect'}}]}
        worker = threading.Thread(target=lambda: outcomes.append(provider.dispatch('POST', '/v1/chat/completions', {}, body,
                                    {'Authorization': 'Bearer fixture-secret'})))
        worker.start()
        try:
            self.assertTrue(entered.wait(timeout=5))
            self.assertEqual(outcomes, [])
        finally:
            released.set()
            worker.join(timeout=5)
        self.assertFalse(worker.is_alive())
        self.assertEqual(outcomes[0][0], 200)
        self.assertEqual(outcomes[0][2]['choices'][0]['finish_reason'], 'tool_calls')

    def test_unauthorized_and_final_responses_do_not_enter_the_barrier(self):
        entries = []
        provider = OpenAITools('http://127.0.0.1:1', tool_names=['RecordEffect'], token='fixture-secret',
                               before_tool_response=lambda: entries.append('entered'))
        body = {'messages': [{'role': 'user'}, {'role': 'tool'}]}
        self.assertEqual(provider.dispatch('POST', '/v1/chat/completions', {}, body, {'Authorization': 'wrong'})[0], 401)
        self.assertEqual(provider.dispatch('POST', '/v1/chat/completions', {}, body,
                         {'Authorization': 'Bearer fixture-secret'})[2]['choices'][0]['finish_reason'], 'stop')
        self.assertEqual(entries, [])

    def test_barrier_failure_propagates_without_releasing_a_tool_response(self):
        def failed():
            raise RuntimeError('Controlled external response fails')
        provider = OpenAITools('http://127.0.0.1:1', tool_names=['RecordEffect'], token='fixture-secret',
                               before_tool_response=failed)
        with self.assertRaisesRegex(RuntimeError, 'Controlled external response fails'):
            provider.dispatch('POST', '/v1/chat/completions', {}, {'messages': [{'role': 'user'}],
                'tools': [{'function': {'name': 'RecordEffect'}}]}, {'Authorization': 'Bearer fixture-secret'})
