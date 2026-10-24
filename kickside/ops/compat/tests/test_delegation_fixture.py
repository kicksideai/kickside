"""Later source migrations do not alter a published historical upgrade proof."""
import copy
import json
import unittest
from unittest.mock import patch

from ops.compat.integration import test_delegation_upgrade as proof
from ops.compat.inventory import ROOT
from ops.compat.migrations import bind_fixture_registry, closure, migration_plan, select_fixtures


def migration(timestamp, dependencies=()):
    return {'Kind': 'function.lua',
            'Meta': {'type': 'migration', 'timestamp': timestamp, 'depends_on': list(dependencies)},
            'Data': {'source': 'return {}', 'method': 'migrate'}}


class DelegationFixtureTests(unittest.TestCase):
    def test_proof_excludes_later_published_and_source_migrations(self):
        create = 'kickside.mcp.migrations:01_mcp_credentials'
        authority = 'kickside.mcp.migrations:04_authority_snapshot'
        users = 'kickside.users.migrations:01_create_app_user_tables'
        delegation = 'kickside.users.migrations:12_delegation_epochs'
        jobs_config = 'kickside.core.jobs:db_config'
        published = {create: migration('1'), authority: migration('2', [create]),
                     users: migration('1'), delegation: migration('2', [users]),
                     jobs_config: {'Kind': 'registry.entry', 'Meta': {'db_id': ''},
                                   'Data': {'source': 'published-config-version'}},
                     'kickside.users.migrations:13_bot_accounts': migration('3', [delegation])}
        current = dict(published, **{
            'kickside.mcp.migrations:05_retired_policy_credentials': migration('4', [authority])})
        current[jobs_config] = copy.deepcopy(published[jobs_config])
        current[jobs_config]['Data']['source'] = 'current-config-version'

        def rehearse(before, after, work, recipes):
            self.assertEqual(set(before), {create, users, jobs_config})
            self.assertEqual(before[jobs_config]['Data']['source'], 'published-config-version')
            self.assertEqual(after[jobs_config]['Data']['source'], 'current-config-version')
            self.assertEqual(set(closure(before, before)), set(before))
            plan = migration_plan(before, after)
            self.assertEqual(set(plan['added']), {authority, delegation})
            return {'plan': plan, 'engines': {'sqlite': {'status': 'pass'},
                                             'postgres': {'status': 'pass'}}}

        with patch.object(proof, 'discover', return_value={'fixture/module': {}}), \
             patch.object(proof, 'local_entries', return_value=current), \
             patch.object(proof, 'Hub') as hub, patch.object(proof, 'rehearse', side_effect=rehearse):
            hub.return_value.fetch.return_value = {'entries': published}
            proof.DelegationUpgradeTests().test_existing_credentials_and_users_survive_delegation_migrations()

    def test_dynamic_jobs_configuration_is_bound_without_replacing_phase_source(self):
        """The host binding keeps the published baseline and current update distinct."""
        identity = 'kickside.core.jobs:db_config'
        published = {
            identity: {'Kind': 'registry.entry', 'Meta': {'db_id': ''},
                       'Data': {'source': 'published-config-version'}},
        }
        current = copy.deepcopy(published)
        current[identity]['Data']['source'] = 'current-config-version'
        current[identity]['Data']['dynamic_read'] = 'registry.get(kickside.core.jobs:db_config)'
        recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
        bindings = select_fixtures(['kickside.users.migrations:12_delegation_epochs'], recipes)['registry']

        baseline = bind_fixture_registry(published, bindings)
        update = bind_fixture_registry(current, bindings)

        self.assertEqual(bindings, {identity: {'Meta': {'db_id': 'app:db'}}})
        self.assertEqual(baseline[identity]['Data']['source'], 'published-config-version')
        self.assertEqual(update[identity]['Data']['source'], 'current-config-version')
        self.assertEqual(update[identity]['Data']['dynamic_read'], 'registry.get(kickside.core.jobs:db_config)')
        self.assertEqual(baseline[identity]['Meta']['db_id'], 'app:db')
        self.assertEqual(update[identity]['Meta']['db_id'], 'app:db')

    def test_dynamic_configuration_binding_must_exist_in_each_phase(self):
        with self.assertRaisesRegex(ValueError, 'absent from this phase inventory'):
            bind_fixture_registry({}, {'kickside.core.jobs:db_config': {'Meta': {'db_id': 'app:db'}}})
