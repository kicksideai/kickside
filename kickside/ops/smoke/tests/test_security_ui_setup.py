import unittest
from unittest.mock import MagicMock, Mock, patch

from harness import Cleanup, Failure
from scenarios import Context
from scenarios_security_ui import assign_scopes, member
from scenarios_system_page_structure import ready


class SecurityMemberSetupTests(unittest.TestCase):
    def test_restricted_member_leaves_default_group_through_admin_api(self):
        inst = Mock(password='fixture-password', cleanup=Cleanup())
        inst.request.side_effect = [
            {'user': {'user_id': 'member-id', 'full_name': 'Sales member'}},
            {'groups': ['app.security:user', 'app.security:members']},
            {'success': True},
            {'groups': ['app.security:user']},
        ]
        user = member(Context(inst), 'Sales member')
        calls = inst.request.call_args_list
        self.assertNotIn('groups', calls[0].args[2])
        self.assertEqual(calls[1].args, ('GET', '/api/v1/users/member-id/groups'))
        self.assertEqual(calls[2].args, ('PUT', '/api/v1/users/member-id', {'groups': []}))
        self.assertEqual(calls[3].args, ('GET', '/api/v1/users/member-id/groups'))
        self.assertEqual(user['user_id'], 'member-id')

    def test_retained_default_membership_still_fails_the_restriction_fixture(self):
        inst = Mock(password='fixture-password', cleanup=Cleanup())
        inst.request.side_effect = [
            {'user': {'user_id': 'member-id', 'full_name': 'Sales member'}},
            {'groups': ['app.security:user', 'app.security:members']},
            {'success': True},
            {'groups': ['app.security:user', 'app.security:members']},
        ]
        with self.assertRaisesRegex(Failure, 'Default membership remains assigned'):
            member(Context(inst), 'Sales member')


class SecurityUiPresentationTests(unittest.TestCase):
    def test_scope_assignment_uses_the_portaled_modal_contract(self):
        scope = 'kickside.security.scopes:reviewer'
        row, dialog, checkbox, scope_input, checkboxes = Mock(), Mock(), Mock(), Mock(), Mock()
        frame, browser, inst, ctx = Mock(), Mock(), Mock(), Mock()
        browser.frame = frame
        frame.locator.return_value.filter.return_value = row
        frame.get_by_role.return_value = dialog
        checkboxes.all.return_value = [checkbox]
        dialog.locator.side_effect = lambda selector: (
            checkboxes if selector == 'input[type=checkbox]'
            else scope_input)
        checkbox.is_enabled.return_value = True
        checkbox.get_attribute.return_value = scope
        dialog.get_attribute.return_value = 'true'
        response = Mock(status=200)
        response.json.return_value = {'success': True}
        expected = MagicMock()
        expected.__enter__.return_value.value = response
        browser.page.expect_response.return_value = expected
        inst.request.return_value = {'groups': [scope, 'app.security:user']}
        ctx.browser, ctx.inst = browser, inst

        with patch('scenarios_security_ui.system'), patch('playwright.sync_api.expect') as expect:
            assign_scopes(ctx, {'user_id': 'member', 'email': 'member@example.test', 'full_name': 'Member'}, [scope])

        row.get_by_role.return_value.click.assert_called_once_with()
        checkbox.set_checked.assert_called_once_with(True)
        expect.return_value.to_be_checked.assert_called_once_with()
        expect.return_value.to_have_attribute.assert_called_once_with('aria-modal', 'true')
        self.assertEqual(inst.evidence.save.call_args.args,
                         ('account-editor-content-flow', {'modal': 'true', 'scopes': [scope]}))
        dialog.get_by_role.return_value.click.assert_called_once_with()

    def test_system_readiness_starts_after_first_agent_without_dismissing_it(self):
        browser, shell, onboarding, ctx = Mock(), Mock(), Mock(), Mock()
        browser.frame.locator.side_effect = lambda selector: shell if selector == '.sidebar' else onboarding
        ctx.browser_check.return_value = browser

        with patch('playwright.sync_api.expect') as expect:
            ready(ctx)

        browser.login.assert_called_once_with()
        shell.wait_for.assert_called_once_with(timeout=30000)
        expect.assert_called_once_with(onboarding)
        expect.return_value.to_have_count.assert_called_once_with(0, timeout=30000)
