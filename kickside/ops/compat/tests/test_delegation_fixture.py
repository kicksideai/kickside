"""Later source migrations do not alter a published historical upgrade proof."""
import unittest
from unittest.mock import patch

from ops.compat.integration import test_delegation_upgrade as proof
from ops.compat.migrations import closure, migration_plan


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
        published = {create: migration('1'), authority: migration('2', [create]),
                     users: migration('1'), delegation: migration('2', [users]),
                     'kickside.users.migrations:13_bot_accounts': migration('3', [delegation])}
        current = dict(published, **{
            'kickside.mcp.migrations:05_retired_policy_credentials': migration('4', [authority])})

        def rehearse(before, after, work, recipes):
            self.assertEqual(set(before), {create, users})
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
