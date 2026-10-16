import unittest
import scenarios_published_security_identity as identity


class PublishedSecurityIdentityTests(unittest.TestCase):
    def test_inventory_tracks_the_nearest_module_definition(self):
        parent = {'id': 'family:definition', 'kind': 'ns.definition'}
        installed = {'id': 'family.installed:definition', 'kind': 'ns.definition'}
        optional = {'id': 'family.optional:definition', 'kind': 'ns.definition'}
        grant = {'id': 'family.optional.security:module_access', 'kind': 'security.policy'}
        required = {'id': 'family.installed.security:scope', 'kind': 'ns.requirement'}
        self.assertEqual(identity.expected_security_identities([parent, installed, optional, grant, required],
                         [parent, installed]), [required])

    def test_inventory_guards_published_provider_requirements(self):
        requirement = {'id': 'kickside.code_execution.security:user_security_scope', 'kind': 'ns.requirement'}
        policy = {'id': 'kickside.code_execution.security:endpoint_access', 'kind': 'security.policy'}
        definition = {'id': 'kickside.code_execution:definition', 'kind': 'ns.definition'}
        published = [definition, requirement, policy]
        self.assertEqual(identity.expected_security_identities(published, [definition]), [requirement, policy])
        self.assertEqual(identity.identity_changes([requirement], []), [requirement])
        self.assertEqual(identity.identity_changes([requirement], [dict(requirement, kind='registry.entry')]), [requirement])

    def test_accepts_only_listed_owner_sanctioned_endpoint_renames(self):
        before = [{'id': 'kickside.agents.api:list_user_agents.endpoint', 'kind': 'http.endpoint'}]
        after = [{'id': 'kickside.agents.api:list_user_agents.user.endpoint', 'kind': 'http.endpoint'}]
        self.assertEqual(identity.identity_changes(before, after), [])

    def test_rejects_unlisted_endpoint_renames(self):
        before = [{'id': 'unlisted.api:read.endpoint', 'kind': 'http.endpoint'}]
        after = [{'id': 'unlisted.api:read.user.endpoint', 'kind': 'http.endpoint'}]
        self.assertEqual(identity.identity_changes(before, after), before)

    def test_accepts_verified_published_mcp_member_suffix_conversions(self):
        for namespace, names in {
            'kickside.mcp.api': ('create_credential', 'update_credential', 'list_credentials',
                                 'revoke_credential', 'delete_credential', 'list_tools',
                                 'list_components', 'list_presets'),
            'kickside.mcp.oauth': ('context', 'consent'),
        }.items():
            for name in names:
                old = namespace + ':' + name + '.endpoint'
                with self.subTest(endpoint=old):
                    before = [{'id': old, 'kind': 'http.endpoint'}]
                    after = [{'id': namespace + ':' + name + '.user.endpoint', 'kind': 'http.endpoint'}]
                    self.assertEqual(identity.identity_changes(before, after), [])

    def test_accepts_the_two_verified_same_suffix_conversions(self):
        for old in ('kickside.dashboard:overview.endpoint', 'kickside.mcp_client.api:reconnect.endpoint'):
            with self.subTest(endpoint=old):
                published = [{'id': old, 'kind': 'http.endpoint'}]
                current = [{'id': old.removesuffix('.endpoint') + '.user.endpoint', 'kind': 'http.endpoint'}]
                self.assertEqual(identity.identity_changes(published, current), [])

    def test_accepts_verified_crm_member_suffix_conversions(self):
        for name in ('bootstrap', 'get', 'panels', 'apply', 'schema.get', 'export_config', 'query', 'resolve'):
            old = 'kickside.crm.api:' + name + '.endpoint'
            published = [{'id': old, 'kind': 'http.endpoint'}]
            successor = old.removesuffix('.endpoint') + '.user.endpoint'
            with self.subTest(endpoint=old):
                self.assertEqual(identity.identity_changes(published, [{'id': successor, 'kind': 'http.endpoint'}]), [])
                self.assertEqual(identity.identity_changes(published, []), published)
                self.assertEqual(identity.identity_changes(published, [{'id': successor, 'kind': 'registry.entry'}]), published)

    def test_additional_decision_has_its_own_citation_and_no_policy_exceptions(self):
        decision = identity.endpoint_decision()['additional_suffix_conversions']
        self.assertIn('identity-guard', decision['citation'])
        self.assertIn('group-based-access-model.md', decision['citation'])
        self.assertEqual(len(decision['renames']), 20)
        self.assertIn('kickside.dashboard:overview.endpoint', decision['renames'])
        self.assertIn('kickside.mcp_client.api:reconnect.endpoint', decision['renames'])
        for old, new in decision['renames'].items():
            self.assertEqual(new, old.removesuffix('.endpoint') + '.user.endpoint')

    def test_rejects_missing_or_wrong_kind_sanctioned_successors(self):
        before = [{'id': 'kickside.agents.api:list_user_agents.endpoint', 'kind': 'http.endpoint'}]
        for after in ([], [{'id': 'kickside.agents.api:list_user_agents.user.endpoint', 'kind': 'registry.entry'}]):
            with self.subTest(after=after):
                self.assertEqual(identity.identity_changes(before, after), before)

    def test_rejects_unsanctioned_policy_removals_and_kind_changes(self):
        before = [{'id': 'kickside.agents.security:agents_endpoint_access', 'kind': 'security.policy'}]
        for after in ([], [{'id': before[0]['id'], 'kind': 'registry.entry'}]):
            with self.subTest(after=after):
                self.assertEqual(identity.identity_changes(before, after), before)

    def test_accepts_removals_with_an_exact_recorded_transition(self):
        for policy in ('app.security:user.runtime_env_read', 'app.security:facade.template_runtime'):
            with self.subTest(policy=policy):
                self.assertEqual(identity.identity_changes([{'id': policy, 'kind': 'security.policy'}], []), [])

    def test_rejects_a_kind_change_of_an_identity_recorded_as_removed(self):
        before = [{'id': 'app.security:user.runtime_env_read', 'kind': 'security.policy'}]
        self.assertEqual(identity.identity_changes(before, [dict(before[0], kind='registry.entry')]), before)

    def test_rejects_a_kind_change_even_when_the_sanctioned_successor_exists(self):
        before = [{'id': 'kickside.agents.api:list_user_agents.endpoint', 'kind': 'http.endpoint'}]
        after = [{'id': before[0]['id'], 'kind': 'registry.entry'},
                 {'id': 'kickside.agents.api:list_user_agents.user.endpoint', 'kind': 'http.endpoint'}]
        self.assertEqual(identity.identity_changes(before, after), before)

    def test_decision_lists_the_exact_102_renames_with_a_citation(self):
        decision = identity.endpoint_decision()
        self.assertEqual(len(decision['renames']), 102)
        self.assertEqual(decision['commit'], '72b6488b382f8dc8df3d956dcff408cfe7747ae6')
        self.assertIn('2026-10-06', decision['citation'])
        for old, new in decision['renames'].items():
            self.assertEqual(new, old.removesuffix('.endpoint') + '.user.endpoint')

    def test_inventory_includes_application_sources_without_dependency_ownership(self):
        application = {'id': 'app.security:member_grant', 'kind': 'security.policy'}
        published = [{'id': 'app:definition', 'kind': 'ns.definition'}, application,
                     {'id': 'optional:definition', 'kind': 'ns.definition'},
                     {'id': 'optional:member_grant', 'kind': 'security.policy'}]
        registry = [{'id': 'app:definition', 'kind': 'ns.definition'}, application]
        self.assertEqual(identity.expected_security_identities(published, registry), [application])
