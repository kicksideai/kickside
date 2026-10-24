import unittest
from unittest.mock import Mock, patch


class InboxReviewEditTests(unittest.TestCase):
    def test_review_enters_inbox_as_provisioned_owner_without_first_agent_assumption(self):
        import scenarios_inbox_review_edit as scenario

        ctx, browser = Mock(), Mock()
        with patch('scenarios_access.actor_browser', return_value=browser) as actor, \
             patch('scenarios.nav') as nav:
            actual = scenario.open_review_inbox(ctx)

        self.assertIs(actual, browser)
        actor.assert_called_once_with(ctx, 'owner')
        nav.assert_called_once_with(ctx, 'Inbox')
        browser.frame.locator.assert_not_called()
