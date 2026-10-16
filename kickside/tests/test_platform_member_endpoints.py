from pathlib import Path
import re
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]


def entries(path):
    return {e['name']: e for e in yaml.safe_load((ROOT / path).read_text())['entries']}


class MemberEndpointPolicyTest(unittest.TestCase):
    def test_session_helpers_grant_endpoints_to_injected_user_scope(self):
        module = entries('platform/sessions/src/_index.yaml')
        self.assertNotIn('sessions_endpoint_access', module)
        self.assertNotIn('user_security_scope', module)
        endpoints = entries('platform/sessions/src/api/_index.yaml')
        for name in ['start_token', 'favorite']:
            self.assertEqual(endpoints[name + '.endpoint']['kind'], 'http.endpoint')
            self.assertNotIn(name + '.endpoint.unlisted', endpoints)
        self.assertTrue(any(e.get('component') == 'kickside/contract' and e.get('version') == '*'
                            for e in module.values()))
        roots = entries('app/src/app/deps/_index.yaml')
        self.assertIn({'name': 'kickside.contract.http:user_security_scope', 'value': 'app.security:unassigned_endpoints'},
                      roots['kickside_contract']['parameters'])
        policy = entries('core/contract/src/http/_index.yaml')['user_endpoint_access']
        self.assertEqual(policy['policy']['actions'], 'access')
        self.assertIn('kickside.core.threads.api:list_threads.endpoint', policy['policy']['resources'])
        self.assertTrue(all('*' not in resource for resource in policy['policy']['resources']))
        self.assertEqual(policy['policy']['effect'], 'allow')
        self.assertNotIn('conditions', policy['policy'])

    def test_http_contract_consumers_declare_one_direct_dependency(self):
        for module in ("sessions", "identity"):
            with self.subTest(module=module):
                declarations = entries("platform/" + module + "/src/_index.yaml")
                dependencies = [e for e in declarations.values()
                                if e.get("kind") == "ns.dependency" and e.get("component") == "kickside/contract"]
                self.assertEqual(len(dependencies), 1)
                self.assertEqual(dependencies[0]["version"], "*")

    def test_workflow_member_spawn_grant_names_only_undo_process(self):
        module = entries('platform/workflows/src/security/_index.yaml')
        policy = module['undo_spawn']
        self.assertEqual(policy['policy']['resources'], ['kickside.workflows.undo:undo_process'])
        self.assertEqual(policy['policy']['actions'], 'process.spawn')
        self.assertIn({'entry': 'kickside.workflows.security:undo_spawn', 'path': '.groups +='},
                      module['user_security_scope']['targets'])

    def test_authenticated_module_discovery_and_consent_endpoint_resources(self):
        import re
        shared = entries('core/contract/src/http/_index.yaml')
        policy = shared['user_endpoint_access']
        self.assertNotIn('conditions', policy['policy'])
        renderers_policy = entries('platform/renderers/src/security/module_access/_index.yaml')['module_access']['policy']
        oauth_policy = entries('platform/mcp/src/security/module_access/_index.yaml')['oauth_endpoint_access']['policy']
        self.assertIn('kickside.renderers.api:list_renderers.endpoint', renderers_policy['resources'])
        for resource in ['kickside.mcp.oauth:context.endpoint', 'kickside.mcp.oauth:consent.endpoint']:
            self.assertIn(resource, oauth_policy['resources'])
        for grant in (policy['policy'], renderers_policy, oauth_policy):
            self.assertNotIn('unrelated.module:catalog.endpoint', grant['resources'])
            self.assertTrue(all('*' not in resource for resource in grant['resources']))
        renderers = entries('platform/renderers/src/_index.yaml')
        retained = renderers['renderers_endpoint_access']['policy']['resources']
        self.assertIn('kickside.renderers:ui_static', retained)
        self.assertNotIn('kickside.renderers.api:list_renderers.endpoint', retained)
        self.assertNotIn('mcp_endpoint_access', entries('platform/mcp/src/security/_index.yaml'))
        self.assertEqual(shared['user_security_scope']['default'], 'kickside.security.groups:members')
        self.assertEqual(shared['user_security_scope']['targets'], [
            {'entry': 'kickside.contract.http:user_endpoint_access', 'path': '.groups +='},
            {'entry': 'kickside.contract.http:member_scope_composition', 'path': '.group_ids +='}])

    def test_member_delegation_registers_only_dataflow_orchestrator_names(self):
        module = entries('app/src/app/security/registry/user_runtime_policies/_index.yaml')
        policy = module['user.runtime_dataflow_registry']
        self.assertEqual(policy['groups'], ['app.security:user'])
        self.assertEqual(policy['policy']['resources'], ['dataflow.*'])
        self.assertEqual(policy['policy']['actions'], ['process.registry.register', 'process.registry.unregister'])

    def test_member_delegation_spawns_only_dataflow_node_processes(self):
        module = entries('app/src/app/security/registry/user_runtime_policies/_index.yaml')
        policy = module['user.runtime_dataflow_node_spawn']
        self.assertEqual(policy['groups'], ['app.security:user'])
        self.assertEqual(policy['policy']['resources'], [
            'userspace.dataflow.node.agent:node',
            'userspace.dataflow.node.cycle:cycle',
            'userspace.dataflow.node.func:node',
            'userspace.dataflow.node.parallel:parallel',
            'userspace.dataflow.node.signal:node',
            'userspace.dataflow.node.state:state',
        ])
        self.assertEqual(policy['policy']['actions'], ['process.spawn', 'process.spawn.monitored', 'process.spawn.linked'])
        self.assertEqual(policy['policy']['effect'], 'allow')
        self.assertNotIn('conditions', policy['policy'])
        for resource in ['userspace.dataflow.node.agent:node', 'userspace.dataflow.node.func:node',
                         'userspace.dataflow.node.cycle:cycle']:
            self.assertIn(resource, policy['policy']['resources'])
        for resource in ['userspace.dataflow:orchestrator', 'userspace.agent:agent',
                         'userspace.dataflow.node.agent:node.extra', 'userspace.dataflow.node.:node',
                         'userspace.dataflow.node.agent:*', 'userspace.dataflow.node.agent:']:
            self.assertNotIn(resource, policy['policy']['resources'])


    def test_undo_actor_owns_only_workflow_registry_names(self):
        module = entries('platform/workflows/src/security/_index.yaml')
        policy = module['undo_registry']
        self.assertNotIn('groups', policy)
        self.assertEqual(policy['policy']['resources'], ['kickside.workflows.undo:*'])
        self.assertEqual(policy['policy']['actions'], ['process.registry.register.consistent', 'process.registry.unregister.consistent'])
        actor = entries('platform/workflows/src/undo/_index.yaml')['undo_process']
        self.assertIn('kickside.workflows.security:undo_registry', actor['security']['policies'])

    def test_declaration_writers_can_recover_live_scope_without_granting_users(self):
        module = entries('platform/automation/src/security/_index.yaml')
        policy = module['execution_scope']
        self.assertNotIn('groups', policy)
        self.assertEqual(policy['policy']['actions'], 'security.policy_group.get')
        owner = entries('platform/automation/src/_index.yaml')
        for name in ['declaration_writer_create', 'declaration_writer_apply', 'identity_writer']:
            self.assertIn('kickside.automation.security:execution_scope', owner[name]['security']['policies'])


if __name__ == '__main__':
    unittest.main()
