import unittest
from unittest.mock import Mock

from harness import Cleanup, Failure
from scenarios import Context
from scenarios_security_ui import member


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
