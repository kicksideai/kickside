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

    def test_install_batch_finishes_before_the_response_context_settles_network_requests(self):
        from contextlib import contextmanager
        browser = MagicMock()
        modules = MagicMock()
        browser.frame.locator.side_effect = lambda tag: modules if tag == 'kickside-onboard-modules' else MagicMock()
        action = MagicMock()
        action.inner_text.return_value = 'Install 3 packages'
        continuation = MagicMock()
        def button(role, name, **kwargs):
            if getattr(name, 'pattern', '') == '^Continue with this setup':
                return continuation
            return MagicMock(first=action)
        modules.get_by_role.side_effect = button
        completed = False
        def ready(**kwargs):
            nonlocal completed
            self.assertEqual(kwargs, {'state': 'visible', 'timeout': 300000})
            completed = True
        continuation.wait_for.side_effect = ready
        class BatchVerified(Exception):
            pass
        @contextmanager
        def capture(*args, **kwargs):
            yield
            self.assertTrue(completed, 'The first response does not finish the package batch')
            raise BatchVerified
        browser.successful_response.side_effect = capture
        ctx = SimpleNamespace(inst=SimpleNamespace(config={'model': None}), browser_check=lambda: browser)
        with patch('playwright.sync_api.expect'), self.assertRaises(BatchVerified):
            scenarios.platform_onboarding(ctx)
