from contextlib import nullcontext
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import scenarios_ai as guards


class AgentCreationBudgetTests(unittest.TestCase):
    def test_creation_configures_the_selected_models_advertised_output_budget(self):
        for ceiling in ('128', '4096', '16384'):
            with self.subTest(ceiling=ceiling):
                form, agents, browser, tokens = Mock(), Mock(), Mock(), Mock()
                tokens.get_attribute.return_value = ceiling
                browser.frame.locator.return_value = agents
                agents.get_by_role.return_value = form
                browser.page.expect_response.return_value = nullcontext(None)
                class CreationReached(Exception):
                    pass
                def create():
                    tokens.fill.assert_called_once_with(ceiling)
                    raise CreationReached()
                button = Mock()
                button.click.side_effect = create
                def control(role, **options):
                    if role == 'spinbutton':
                        return tokens
                    if role == 'button' and options.get('name') == 'Create agent':
                        return button
                    return Mock()
                form.get_by_role.side_effect = control
                ctx = SimpleNamespace(inst=Mock(), browser=browser, state={})
                with patch.object(guards, 'fresh_ui'), patch.object(guards, 'nav'), \
                     patch.object(guards, 'shot'), patch('playwright.sync_api.expect'):
                    with self.assertRaises(CreationReached):
                        guards.agent_crud(ctx)
