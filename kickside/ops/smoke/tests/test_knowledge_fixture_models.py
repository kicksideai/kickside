import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from harness import Failure
import scenarios_ai as ai
import scenarios_access as access


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

    def test_access_kb_fixture_enables_analysis_only_after_raw_index_readiness(self):
        for name, kb_type in (('kb_document', 'document'), ('kb_wiki', 'wiki')):
            with self.subTest(kind=name):
                calls, searches = [], []
                ctx = SimpleNamespace(
                    state={
                        'model': 'analysis-model',
                        'embed': 'embedding-model',
                        'access_declarations': {'kickside.kb10:embeddable': {'meta': {}}},
                    },
                    inst=Mock(),
                )
                ctx.inst.token = 'owner-token'

                def api(method, path, body=None, **kwargs):
                    calls.append((method, path, body))
                    if method == 'POST' and path == '/api/v1/knowledge/create':
                        return {'id': 'library'}
                    if method == 'POST' and path == '/api/v1/knowledge/library/ingest':
                        return {'thread_id': 'library', 'projection_id': 'projection'}
                    if method == 'POST' and path == '/api/v1/knowledge/library/search':
                        searches.append(body)
                        return {'items': [{'content': 'unrelated indexed document'}]} if len(searches) == 1 else {
                            'items': [{'content': 'Fictional Northwind access marker NW-ACCESS-731'}]}
                    if method == 'PUT' and path == '/api/v1/knowledge/library':
                        return {'success': True}
                    self.fail('Unexpected access fixture request: ' + repr((method, path, body)))

                def wait(predicate, label, *, seconds):
                    self.assertEqual(label, 'KB access fixture index')
                    self.assertEqual(seconds, 120)
                    self.assertFalse(predicate(), 'fixture must not accept an unrelated search result')
                    self.assertTrue(predicate(), 'fixture must wait until its marker is searchable')

                ctx.inst.request.side_effect = api
                ctx.inst.wait.side_effect = wait
                with patch.object(access, 'install_package'), patch.object(access, 'renew'), patch.object(access, 'registry'):
                    fixture = access.create(ctx, access.kind_named(name))

                self.assertEqual(fixture.id, 'library')
                self.assertEqual(calls[0][2]['kb_type'], kb_type)
                self.assertEqual(calls[0][2]['embedding_model'], 'embedding-model')
                self.assertEqual(searches, [{'query': 'NW-ACCESS-731', 'limit': 5}] * 2)
                self.assertEqual(calls[-1], ('PUT', '/api/v1/knowledge/library',
                                              {'config': {'analysis_model': 'analysis-model'}}))

    def test_access_kb_producer_accepts_completed_summary_only_materialization_without_search(self):
        marker = 'NW-PRODUCER-fixed'
        calls, event_reads, child_reads = [], [], []
        ctx = SimpleNamespace(state={'access_users': {}}, inst=Mock())
        ctx.inst.token = 'owner-token'
        fixture = access.Fixture(access.kind_named('kb_document'), 'library', 'Library')

        def api(method, path, body=None, **kwargs):
            calls.append((method, path, body))
            if method == 'POST' and path == '/api/v1/knowledge/library/ingest':
                self.assertEqual(body['external_id'], marker)
                return {'thread_id': 'library', 'projection_id': 'projection', 'external_id': marker}
            if method == 'GET' and path == '/api/v1/threads/library/events?ascending=true&limit=200':
                event_reads.append(path)
                return {'events': []} if len(event_reads) == 1 else {'events': [{
                    'type': 'kickside.knowledge.events:content.upserted', 'external_id': marker,
                    'body': {'content': marker},
                }]}
            if method == 'GET' and path == '/api/v1/kb10/library/browse?node_type=document&include_content=true&limit=100':
                return {'nodes': [{'id': 'document', 'metadata': {'external_id': marker, 'status': 'completed'}, 'content': marker}]}
            if method == 'GET' and path == '/api/v1/kb10/library/browse?parent_id=document&include_content=true&limit=100':
                child_reads.append(path)
                return {'nodes': [{'id': 'summary', 'node_type': 'summary',
                                   'parent_id': 'other-document' if len(child_reads) == 1 else 'document',
                                   'metadata': {'external_id': marker}, 'content': 'Northwind summary'}]}
            self.fail('Unexpected producer request: ' + repr((method, path, body)))

        def wait(predicate, label, *, seconds):
            self.assertEqual(label, 'Granted ingestion materializes its exact durable content')
            self.assertEqual(seconds, 120)
            self.assertIsNone(predicate(), 'missing event must not count as materialized content')
            self.assertIsNone(predicate(), 'a child of another document must not prove this document is indexed')
            self.assertEqual(predicate()['id'], 'document')

        ctx.inst.request.side_effect = api
        ctx.inst.wait.side_effect = wait
        with patch.object(access.uuid, 'uuid4', return_value=SimpleNamespace(hex='fixed')):
            access.produce_event(ctx, fixture, 'owner')
        self.assertEqual(len(event_reads), 3)
        self.assertFalse(any(path.endswith('/search') for _, path, _ in calls))

    def test_access_kb_producer_waits_for_completed_document_before_accepting_children(self):
        marker = 'NW-PRODUCER-not-ready'
        ctx = SimpleNamespace(state={'access_users': {}}, inst=Mock())
        ctx.inst.token = 'owner-token'
        fixture = access.Fixture(access.kind_named('kb_document'), 'library', 'Library')

        def api(method, path, body=None, **kwargs):
            if method == 'POST' and path == '/api/v1/knowledge/library/ingest':
                return {'thread_id': 'library', 'projection_id': 'projection', 'external_id': marker}
            if method == 'GET' and path == '/api/v1/threads/library/events?ascending=true&limit=200':
                return {'events': [{'type': 'kickside.knowledge.events:content.upserted', 'external_id': marker,
                                    'body': {'content': marker}}]}
            if method == 'GET' and path == '/api/v1/kb10/library/browse?node_type=document&include_content=true&limit=100':
                return {'nodes': [{'id': 'document', 'metadata': {'external_id': marker, 'status': 'processing'},
                                   'content': marker}]}
            self.fail('Unexpected not-ready producer request: ' + repr((method, path, body)))

        def wait(predicate, label, *, seconds):
            self.assertEqual(label, 'Granted ingestion materializes its exact durable content')
            self.assertEqual(seconds, 120)
            self.assertIsNone(predicate(), 'incomplete documents must not count as materialized content')

        ctx.inst.request.side_effect = api
        ctx.inst.wait.side_effect = wait
        with patch.object(access.uuid, 'uuid4', return_value=SimpleNamespace(hex='not-ready')):
            access.produce_event(ctx, fixture, 'owner')

    def test_denied_access_kb_producer_creates_no_matching_event_or_node(self):
        marker = 'NW-PRODUCER-denied'
        calls = []
        ctx = SimpleNamespace(state={'access_users': {'read': {'bearer': 'reader-token'}}}, inst=Mock())
        ctx.inst.token = 'owner-token'
        fixture = access.Fixture(access.kind_named('kb_document'), 'library', 'Library')

        def api(method, path, body=None, **kwargs):
            calls.append((method, path, body))
            if method == 'POST' and path == '/api/v1/knowledge/library/ingest':
                return {'success': False, 'error': 'access denied'}
            if method == 'GET' and path == '/api/v1/threads/library/events?ascending=true&limit=200':
                return {'events': [{'type': 'kickside.knowledge.events:content.upserted', 'external_id': 'other',
                                    'body': {'content': 'other'}}]}
            if method == 'GET' and path == '/api/v1/kb10/library/browse?node_type=document&include_content=true&limit=100':
                return {'nodes': [{'id': 'other-document', 'metadata': {'external_id': 'other'}, 'content': 'other'}]}
            self.fail('Unexpected denied producer request: ' + repr((method, path, body)))

        ctx.inst.request.side_effect = api
        with patch.object(access.uuid, 'uuid4', return_value=SimpleNamespace(hex='denied')):
            access.produce_event(ctx, fixture, 'read', denied=True)
        self.assertFalse(any(path.endswith('/search') for _, path, _ in calls))

    def test_denied_access_kb_producer_rejects_even_incomplete_materialized_content(self):
        marker = 'NW-PRODUCER-denied'
        ctx = SimpleNamespace(state={'access_users': {'read': {'bearer': 'reader-token'}}}, inst=Mock())
        ctx.inst.token = 'owner-token'
        fixture = access.Fixture(access.kind_named('kb_document'), 'library', 'Library')
        ctx.inst.request.side_effect = [
            {'success': False, 'error': 'access denied'},
            {'events': []},
            {'nodes': [{'id': 'forbidden-document', 'content': marker,
                        'metadata': {'external_id': marker, 'status': 'processing'}}]},
        ]
        with patch.object(access.uuid, 'uuid4', return_value=SimpleNamespace(hex='denied')):
            with self.assertRaisesRegex(Failure, 'Denied ingestion materializes content'):
                access.produce_event(ctx, fixture, 'read', denied=True)
