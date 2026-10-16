import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from harness import Failure
import scenarios_ai as ai


class KnowledgeFixtureModelsTests(unittest.TestCase):
    def context(self):
        ctx = SimpleNamespace(state={'model': 'analysis-model', 'embed': 'embedding-model'}, inst=Mock())
        ctx.inst.request.side_effect = [
            {'id': 'library'},
            {'name': 'Library', 'kb_type': 'document', 'embedding_model': 'embedding-model'},
        ]
        return ctx

    def test_indexed_content_fixture_does_not_enable_query_analysis(self):
        ctx = self.context()
        self.assertEqual(ai.kb_create(ctx, 'document', 'Library'), 'library')
        config = ctx.inst.request.call_args_list[0].args[2]['config']
        self.assertEqual(config['extraction_model'], 'analysis-model')
        self.assertNotIn('analysis_model', config)

    def test_model_backed_fixture_explicitly_configures_query_analysis(self):
        ctx = self.context()
        ai.kb_create(ctx, 'document', 'Library', analysis=True)
        config = ctx.inst.request.call_args_list[0].args[2]['config']
        self.assertEqual(config['analysis_model'], 'analysis-model')
        self.assertEqual(config['extraction_model'], 'analysis-model')

    def test_answer_scenarios_keep_query_analysis_enabled(self):
        class FixtureCaptured(Exception):
            pass
        ctx = SimpleNamespace(inst=Mock(), state={})
        ask = next(s.run for s in ai.REGISTRY if s.name == 'ai_knowledge_tool_kb_ask_tool')
        for scenario in (ai.knowledge_document, ai.wiki_lifecycle, ask):
            with self.subTest(scenario=scenario.__name__):
                with patch.object(ai, 'kb_create', return_value='library') as create, \
                     patch.object(ai, 'kb_ingest', side_effect=FixtureCaptured):
                    with self.assertRaises(FixtureCaptured):
                        scenario(ctx)
                self.assertIs(create.call_args.kwargs.get('analysis'), True)

    def test_indexing_wait_requires_actual_marker_and_durable_receipt(self):
        ctx = SimpleNamespace(inst=Mock(), browser=Mock())
        ctx.inst.request.side_effect = [
            {'thread_id': 'source', 'projection_id': 'projection'},
            {'items': [{'content': 'Unrelated indexed document'}]},
            {'items': [{'content': 'Northwind NW-AI-731'}]},
        ]
        def wait(predicate, *args, **kwargs):
            self.assertIsNone(predicate())
            return predicate()
        ctx.inst.wait.side_effect = wait
        self.assertEqual(ai.kb_ingest(ctx, 'library')['items'][0]['content'], 'Northwind NW-AI-731')
        self.assertEqual(ctx.inst.wait.call_args.kwargs['seconds'], 120)
        ctx.inst.request.side_effect = [{'thread_id': 'source'}]
        with self.assertRaisesRegex(Failure, 'durable projection receipt'):
            ai.kb_ingest(ctx, 'library')
