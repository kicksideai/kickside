from pathlib import Path
import sys
import unittest


SMOKE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SMOKE))


class PermissionEqualityTests(unittest.TestCase):
    def setUp(self):
        self.catalog = [
            {'id': 'app.api:list.endpoint', 'kind': 'http.endpoint'},
            {'id': 'app.api:write.endpoint', 'kind': 'http.endpoint'},
            {'id': 'app:workspace_kind', 'kind': 'contract.binding', 'data': {
                'contracts': [{'contract': 'kickside.contract:component'}]}},
            {'id': 'app:helper', 'kind': 'function.lua'},
        ]
        self.actions = ('access', 'registry.get', 'registry.find')
        self.before = [
            {'effect': 'allow', 'actions': 'access', 'resources': 'app.api:list.endpoint'},
            {'effect': 'allow', 'actions': 'registry.get', 'resources': 'app:workspace_kind'},
        ]

    def evaluate(self, rules, action, resource):
        for rule in rules:
            actions = rule['actions'] if isinstance(rule['actions'], list) else [rule['actions']]
            resources = rule['resources'] if isinstance(rule['resources'], list) else [rule['resources']]
            if action in actions and resource in resources:
                return rule['effect']
        return 'undefined'

    def test_targets_cover_policy_pairs_every_endpoint_and_every_component_kind(self):
        from permission_equality import target_pairs

        pairs = target_pairs(self.catalog, self.before)

        self.assertEqual(pairs, (
            ('access', 'app.api:list.endpoint'),
            ('access', 'app.api:write.endpoint'),
            ('registry.get', 'app:workspace_kind'),
        ))

    def test_targets_accept_the_policy_mapping_returned_by_native_audit(self):
        from permission_equality import target_pairs

        pairs = target_pairs(self.catalog, {'first': self.before[0], 'second': self.before[1]})

        self.assertIn(('access', 'app.api:list.endpoint'), pairs)
        self.assertIn(('registry.get', 'app:workspace_kind'), pairs)

    def test_capture_retains_empty_native_selector_strings(self):
        from permission_equality import capture_account, compare_captures

        rules = [*self.before, {'effect': 'allow', 'actions': ['', 'access'],
                               'resources': ['', 'app:helper']}]
        def request(payload):
            return {'rules': rules, 'decisions': [self.evaluate(rules, pair['action'], pair['resource'])
                                                for pair in payload['pairs']]}

        before = capture_account(request, 'account', self.catalog)
        after = capture_account(request, 'account', self.catalog, previous_pairs=before['pairs'])

        self.assertIn(('', '', 'allow'), before['snapshot'])
        self.assertIn(('access', '', 'allow'), before['snapshot'])
        compare_captures(before, after)

    def test_constructed_permission_change_is_detected(self):
        from permission_equality import PermissionChange, compare, comparison_pairs, snapshot

        before = snapshot(comparison_pairs(self.catalog, self.before, self.before),
                          lambda action, resource: self.evaluate(self.before, action, resource))
        after_rules = [
            {'effect': 'deny', 'actions': 'access', 'resources': 'app.api:list.endpoint'},
            *self.before[1:],
        ]
        pairs = comparison_pairs(self.catalog, self.before, after_rules)
        after = snapshot(pairs,
                         lambda action, resource: self.evaluate(after_rules, action, resource))
        before = snapshot(pairs, lambda action, resource: self.evaluate(self.before, action, resource))

        with self.assertRaisesRegex(PermissionChange, 'app.api:list.endpoint'):
            compare(before, after)

    def test_targeted_result_equals_exhaustive_result_for_a_model_account(self):
        from permission_equality import equal, exhaustive_pairs, snapshot, target_pairs

        targeted_before = snapshot(target_pairs(self.catalog, self.before),
                                   lambda action, resource: self.evaluate(self.before, action, resource))
        exhaustive_before = snapshot(exhaustive_pairs(self.actions, self.catalog),
                                     lambda action, resource: self.evaluate(self.before, action, resource))
        changed = [
            {'effect': 'deny', 'actions': 'access', 'resources': 'app.api:list.endpoint'},
            *self.before[1:],
        ]
        targeted_after = snapshot(target_pairs(self.catalog, changed),
                                  lambda action, resource: self.evaluate(changed, action, resource))
        exhaustive_after = snapshot(exhaustive_pairs(self.actions, self.catalog),
                                    lambda action, resource: self.evaluate(changed, action, resource))

        self.assertEqual(equal(targeted_before, targeted_after),
                         equal(exhaustive_before, exhaustive_after))
        self.assertFalse(equal(targeted_before, targeted_after))

    def test_capture_rechecks_an_account_with_the_union_of_both_versions(self):
        from permission_equality import capture_account, compare

        before_rules = self.before
        after_rules = [
            *self.before,
            {'effect': 'allow', 'actions': 'registry.find', 'resources': 'app:helper'},
        ]
        calls = []
        def request(payload):
            calls.append(payload)
            rules = before_rules if len(calls) < 3 else after_rules
            return {'rules': rules, 'decisions': [self.evaluate(rules, pair['action'], pair['resource'])
                                                   for pair in payload['pairs']]}

        before = capture_account(request, 'account', self.catalog, candidate_rules=after_rules)
        after = capture_account(request, 'account', self.catalog, previous_pairs=before['pairs'])

        self.assertEqual(calls[0]['pairs'], [])
        self.assertEqual(calls[2]['pairs'], [])
        self.assertIn({'action': 'registry.find', 'resource': 'app:helper'}, after['pairs'])
        self.assertTrue({(pair['action'], pair['resource']) for pair in before['pairs']}.issubset(
            {(pair['action'], pair['resource']) for pair in after['pairs']}))
        with self.assertRaisesRegex(AssertionError, 'app:helper'):
            compare(before['snapshot'], after['snapshot'])

    def test_before_capture_includes_candidate_endpoint_and_component_kind(self):
        from permission_equality import capture_account

        candidate_catalog = [*self.catalog,
            {'id': 'app.api:future.endpoint', 'kind': 'http.endpoint'},
            {'id': 'app:future_kind', 'kind': 'contract.binding', 'data': {
                'contracts': [{'contract': 'kickside.contract:component'}]}},
        ]
        def request(payload):
            return {'rules': self.before,
                    'decisions': [self.evaluate(self.before, pair['action'], pair['resource'])
                                  for pair in payload['pairs']]}

        captured = capture_account(request, 'account', self.catalog, candidate_catalog=candidate_catalog)

        self.assertIn({'action': 'access', 'resource': 'app.api:future.endpoint'}, captured['pairs'])
        self.assertIn({'action': 'registry.get', 'resource': 'app:future_kind'}, captured['pairs'])

    def test_capture_rejects_an_unplanned_after_policy_pair(self):
        from permission_equality import capture_account, compare

        calls = []
        def request(payload):
            calls.append(payload)
            rules = self.before if len(calls) < 3 else [*self.before,
                {'effect': 'allow', 'actions': 'registry.find', 'resources': 'app:helper'}]
            return {'rules': rules, 'decisions': [self.evaluate(rules, pair['action'], pair['resource'])
                                                   for pair in payload['pairs']]}

        before = capture_account(request, 'account', self.catalog)
        after = capture_account(request, 'account', self.catalog, previous_pairs=before['pairs'])

        with self.assertRaisesRegex(ValueError, 'proof universes differ'):
            compare(before['snapshot'], after['snapshot'])

    def test_refused_account_requires_the_same_refusal_and_groups(self):
        from permission_equality import PermissionChange, compare_captures

        before = {'user_id': 'inactive', 'subject_refusal': {'kind': 'PermissionDenied'},
                  'error_kind': 'subject', 'groups': ['scope:old'], 'snapshot': ()}
        after = {**before, 'groups': ['scope:new']}

        with self.assertRaisesRegex(PermissionChange, 'groups'):
            compare_captures(before, after)

    def test_refused_account_is_not_equal_to_an_admitted_empty_snapshot(self):
        from permission_equality import PermissionChange, compare_captures

        before = {'user_id': 'inactive', 'subject_refusal': {'kind': 'PermissionDenied'},
                  'error_kind': 'subject', 'groups': [], 'snapshot': ()}
        after = {'user_id': 'inactive', 'groups': [], 'snapshot': ()}

        with self.assertRaisesRegex(PermissionChange, 'admission'):
            compare_captures(before, after)

