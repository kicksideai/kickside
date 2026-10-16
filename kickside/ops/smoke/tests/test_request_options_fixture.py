from types import SimpleNamespace
import unittest
from unittest.mock import Mock

import scenarios_core as guards


class RequestOptionsFixtureTests(unittest.TestCase):
    def test_options_card_declares_usable_input_and_output_budgets(self):
        inst, browser = Mock(), Mock()
        browser.frame.locator.return_value.is_visible.return_value = False
        class FixtureCreated(Exception):
            pass
        def create(method, path, body, **kwargs):
            self.assertEqual((method, path), ('PUT', '/api/v1/models/cards'))
            self.assertTrue(body['enabled'])
            self.assertGreater(body['max_tokens'], body['output_tokens'])
            self.assertGreater(body['output_tokens'], 0)
            self.assertEqual(body['options']['thinking_effort'], 'medium')
            raise FixtureCreated()
        inst.request.side_effect = create
        with self.assertRaises(FixtureCreated):
            guards.core_model_request_options(SimpleNamespace(inst=inst, browser=browser))
