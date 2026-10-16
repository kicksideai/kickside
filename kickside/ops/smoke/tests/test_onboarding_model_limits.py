import copy
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

from harness import Failure
import scenarios


class OnboardingModelLimitsTests(unittest.TestCase):
    def test_onboarding_configures_discovered_cards_before_selecting_them(self):
        cards = [
            {'name': 'provider/generation', 'provider_model': 'generation', 'title': 'Generation',
             'enabled': False, 'capabilities': ['generate'], 'max_tokens': 0, 'output_tokens': 0},
            {'name': 'provider/embedding', 'provider_model': 'embedding', 'title': 'Embedding',
             'enabled': False, 'capabilities': ['embed'], 'max_tokens': 0, 'output_tokens': 0},
        ]
        saved = []
        def request(method, path, body=None, **kwargs):
            if method == 'GET' and path == '/api/v1/models/admin':
                return {'models': copy.deepcopy(cards)}
            if method == 'PUT' and path == '/api/v1/models/cards':
                saved.append(copy.deepcopy(body))
                cards[next(i for i, card in enumerate(cards) if card['name'] == body['name'])] = copy.deepcopy(body)
                return {'success': True}
            raise AssertionError((method, path))
        browser = MagicMock()
        inst = SimpleNamespace(config={'model': {'base': 'https://models.invalid/v1', 'key': 'fixture',
                                                'llm': 'generation', 'embed': 'embedding'}}, request=request)
        ctx = SimpleNamespace(inst=inst, browser_check=lambda: browser, state={})
        class SelectionsReady(Exception):
            pass
        def select(ctx, models, generation, embedding):
            for card in (generation, embedding):
                self.assertTrue(card['enabled'], card['name'])
                self.assertGreater(card['max_tokens'], 0)
            self.assertGreater(generation['output_tokens'], 0)
            self.assertEqual(embedding['dimensions'], 512)
            self.assertEqual({card['name'] for card in saved}, {card['name'] for card in cards})
            raise SelectionsReady
        with patch('playwright.sync_api.expect'), patch.object(scenarios, 'select_onboarding_models', select):
            with self.assertRaises(SelectionsReady):
                scenarios.platform_onboarding(ctx)
