from types import SimpleNamespace
import unittest
from unittest.mock import Mock

from scenarios_knowledge_listing import knowledge_complete_listing
from scenarios_knowledge_projection import knowledge_addressed_ingest


class KnowledgeModelLimitsTests(unittest.TestCase):
    def test_embedding_fixtures_declare_usable_token_limits(self):
        class CardReached(Exception):
            pass

        for scenario in (knowledge_complete_listing, knowledge_addressed_ingest):
            with self.subTest(scenario=scenario.__name__):
                inst = Mock()

                def request(method, path, body, **kwargs):
                    self.assertEqual((method, path), ('PUT', '/api/v1/models/cards'))
                    self.assertEqual(body['capabilities'], ['embed'])
                    self.assertGreater(body.get('max_tokens', 0), 0)
                    self.assertEqual(body.get('output_tokens'), 0)
                    self.assertEqual(body['dimensions'], 512)
                    raise CardReached

                inst.request.side_effect = request
                with self.assertRaises(CardReached):
                    scenario(SimpleNamespace(inst=inst))
