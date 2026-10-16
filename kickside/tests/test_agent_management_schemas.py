"""Agent contracts must teach valid writes without guessing action fields."""
import json
import re
from pathlib import Path
import unittest

import jsonschema
import yaml

ROOT = Path(__file__).resolve().parents[1]


def tool_schema(module, name, section="agent"):
    entries = yaml.safe_load((ROOT / f'platform/{module}/src/{section}/_index.yaml').read_text())['entries']
    return json.loads(next(e['meta']['input_schema'] for e in entries if e.get('meta', {}).get('llm_alias') == name))


class AgentManagementSchemas(unittest.TestCase):
    def test_artifact_accepts_the_published_optional_content_type_and_tag_mode(self):
        schema = tool_schema('agents', 'CreateArtifact', 'traits')
        validator = jsonschema.Draft202012Validator(schema)
        validator.check_schema(schema)
        validator.validate(dict(title='Document', content='Text', content_type='text/markdown'))
        validator.validate(dict(title='Component', tag_name='kc-card', props={}))
        validator.validate(dict(title='Document', content='Text'))
        self.assertNotIn('content_type', schema.get('required', []))
        with self.assertRaises(jsonschema.ValidationError):
            validator.validate(dict(title='Document', content='Text', content_type=42))

    def test_scheduling_is_discoverable_before_activation(self):
        entries = yaml.safe_load((ROOT / 'platform/automation/src/traits/_index.yaml').read_text())['entries']
        manager = next(e for e in entries if e['name'] == 'manager')
        comment = manager['meta']['comment'].lower()
        for term in ('recurring tasks', 'schedule', 'every minute'):
            self.assertIn(term, comment)

    def test_discovery_guides_plain_recurring_requests_to_capabilities(self):
        entries = yaml.safe_load((ROOT / 'platform/agents/src/traits/registry/curation/_index.yaml').read_text())['entries']
        master = next(e for e in entries if e['name'] == 'trait_master')
        self.assertIn('every minute', master['prompt'].lower())
        self.assertIn('recurring', master['prompt'].lower())
        self.assertIn('schedules', next(e for e in entries if e['name'] == 'trait_curator_tool')['meta']['llm_description'].lower())

    def test_action_fields_are_visible_to_the_native_tool_compiler(self):
        # wippy.agent.discovery:tools inserts a placeholder when properties is
        # missing, including valid schemas that constrain fields only via oneOf.
        for module, name in [('workflows', 'WorkflowsManage'), ('automation', 'AutomationsManage')]:
            schema = tool_schema(module, name)
            self.assertIn('action', schema.get('properties', {}))
            self.assertIn('action', schema.get('required', []))
            self.assertNotIn('placeholder', schema['properties'])
            for branch in schema['oneOf']:
                self.assertTrue(set(branch['properties']).issubset(schema['properties']))

    def test_workflow_actions_require_their_own_fields(self):
        schema = tool_schema('workflows', 'WorkflowsManage')
        jsonschema.Draft7Validator.check_schema(schema)
        valid = [dict(action='create', title='Minute clock'), dict(action='publish', id='wf'),
                 dict(action='restore', id='wf', version=1), dict(action='delete', id='wf')]
        for args in valid:
            jsonschema.validate(args, schema)
        invalid = [dict(action='create'), dict(action='publish'), dict(action='restore', id='wf'),
                   dict(action='restore', id='wf', version=0), dict(action='apply', id='wf', commands=[]),
                   dict(action='delete', id='wf', title='ignored'), dict(action='import', flow={})]
        for args in invalid:
            with self.subTest(args=args), self.assertRaises(jsonschema.ValidationError):
                jsonschema.validate(args, schema)

    def test_command_bodies_are_typed_and_match_the_editor_dialect(self):
        schema = tool_schema('workflows', 'WorkflowsManage')
        commands = [
            {'type': 'node.add', 'body': {'id': 'start', 'kind': 'start', 'config': {'input_schema': {'type': 'object'}}}},
            {'type': 'node.add', 'body': {'id': 'step', 'kind': 'block', 'ref': 'kickside.code_execution:block.run_code', 'config': {'code': 'return { time = 1 }'}}},
            {'type': 'edge.add', 'body': {'source_id': 'start', 'target_id': 'step', 'source_port': 'out'}},
            {'type': 'layout.set-position', 'body': {'node_id': 'step', 'x': 12, 'y': 24}},
            {'type': 'param.set', 'body': {'key': 'title', 'value': 'Clock'}},
            {'type': 'labels.set', 'body': {'labels': ['scheduled']}},
        ]
        jsonschema.validate(dict(action='apply', id='wf', commands=commands), schema)
        bad_commands = [
            {'type': 'node.add', 'id': 'start', 'kind': 'start'},
            {'type': 'node.add', 'body': {'node': {'id': 'start', 'kind': 'start'}}},
            {'type': 'node.add', 'body': {'kind': 'agent'}},
            {'type': 'node.add', 'body': {'kind': 'block'}},
            {'type': 'edge.add', 'body': {'source': 'start', 'target': 'step'}},
            {'type': 'layout.set_position', 'body': {'node_id': 'step'}},
            {'type': 'labels.set', 'body': {'labels': [123]}},
        ]
        for command in bad_commands:
            with self.subTest(command=command), self.assertRaises(jsonschema.ValidationError):
                jsonschema.validate(dict(action='apply', id='wf', commands=[command]), schema)

    def test_workflow_contract_covers_the_canonical_command_vocabulary(self):
        schema = tool_schema('workflows', 'WorkflowsManage')
        types = (ROOT / 'platform/workflows/src/types.lua').read_text()
        block = types.split('M.COMMAND = {', 1)[1].split('}', 1)[0]
        accepted = set(re.findall(r'= "([^"]+)"', block))
        declared = {row['properties']['type']['const'] for row in schema['$defs']['command']['oneOf']}
        self.assertEqual(accepted, declared)

    def test_canonical_artifact_envelopes_and_typed_import_bindings(self):
        flow = dict(api_version='kickside.flow/v1', kind='flow', key='clock', title='Clock', version=1,
                    refs=[], document=dict(nodes=[], edges=[]), checksum='0' * 64)
        workflows = tool_schema('workflows', 'WorkflowsManage')
        jsonschema.validate(dict(action='import', flow=flow, bindings=dict(
            component=dict(kind='component', id='c'),
            nested=dict(kind='flow', id='wf', version=1),
            literal=dict(kind='value', value={'label': 'hello'}))), workflows)
        with self.assertRaises(jsonschema.ValidationError):
            jsonschema.validate(dict(action='import', flow=flow, bindings=dict(nested=dict(kind='flow', id='wf'))), workflows)
        artifact = dict(apiVersion='kickside.automation/v1', kind='Automation', metadata=dict(title='Clock'),
                        spec=dict(type='catalog:type', input=dict(title='Clock')))
        jsonschema.validate(dict(action='import', artifact=artifact), tool_schema('automation', 'AutomationsManage'))

    def test_automation_actions_require_their_own_fields(self):
        schema = tool_schema('automation', 'AutomationsManage')
        jsonschema.Draft7Validator.check_schema(schema)
        valid = [dict(action='install', type='catalog:type', input={'title': 'Sync'}),
                 dict(action='reconfigure', id='a', input={}), dict(action='pause', id='a'),
                 dict(action='resume', id='a'), dict(action='run', id='a'),
                 dict(action='call', id='a', method='run_now', args={}),
                 dict(action='uninstall', id='a', options={'keep_thread': True}),
                 dict(action='set_execution_identity', id='a', principal={'kind': 'user', 'id': 'u'},
                      request_id='r', expected_identity_generation=0),
                 dict(action='control', id='a', control='run_now', request_id='r')]
        for args in valid:
            jsonschema.validate(args, schema)
        invalid = [dict(action='install', type='catalog:type'), dict(action='call', method='run_now'),
                   dict(action='reconfigure', id='a'), dict(action='pause', id='a', input={}),
                   dict(action='set_execution_identity', id='a', principal={'kind': 'user', 'id': 'u'}),
                   dict(action='import', artifact={}), dict(action='control', id='a', control='invented', request_id='r')]
        for args in invalid:
            with self.subTest(args=args), self.assertRaises(jsonschema.ValidationError):
                jsonschema.validate(args, schema)


    def test_recurring_tasks_require_the_target_contract_for_each_kind(self):
        schema = tool_schema('automation', 'RecurringTasks')
        jsonschema.Draft7Validator.check_schema(schema)
        self.assertIn('action', schema.get('properties', {}))
        self.assertIn('action', schema.get('required', []))
        schedule = {'type': 'interval', 'expression': '1h'}
        valid = [
            {'action': 'create', 'schedule': schedule,
             'target': {'kind': 'workflow', 'flow_ref': {'kind': 'flow', 'id': 'published-flow', 'version': 1}}},
            {'action': 'create', 'schedule': schedule,
             'target': {'kind': 'agent', 'agent_id': 'daily-agent', 'prompt': 'Prepare the daily summary.'}},
            {'action': 'create', 'schedule': schedule,
             'target': {'kind': 'action', 'port': 'app.sink:write', 'config': {}, 'input': {'content': 'Notice'}}},
            {'action': 'list'}, {'action': 'get', 'id': 'task'}, {'action': 'update', 'id': 'task'},
            {'action': 'pause', 'id': 'task'}, {'action': 'resume', 'id': 'task'},
            {'action': 'delete', 'id': 'task'}, {'action': 'run_now', 'id': 'task'},
        ]
        for args in valid:
            with self.subTest(args=args):
                jsonschema.validate(args, schema)
        invalid = [
            {'action': 'create', 'target': valid[0]['target']},
            {'action': 'create', 'schedule': schedule},
            {'action': 'create', 'schedule': schedule, 'target': {'kind': 'workflow'}},
            {'action': 'create', 'schedule': schedule, 'target': {'kind': 'agent', 'agent_id': 'daily-agent'}},
            {'action': 'create', 'schedule': schedule, 'target': {'kind': 'action', 'port': 'app.sink:write'}},
            {'action': 'get'}, {'action': 'update'}, {'action': 'pause'}, {'action': 'resume'},
            {'action': 'delete'}, {'action': 'run_now'},
        ]
        published = json.loads((ROOT / "tests/fixtures/automation-0.1.126-recurring-tool.json").read_text())["schema"]
        for args in invalid:
            with self.subTest(args=args):
                jsonschema.validate(args, published)
                jsonschema.validate(args, schema)

    def test_recurring_tasks_preserve_ignored_published_fields(self):
        schema = tool_schema('automation', 'RecurringTasks')
        schedule = {'type': 'interval', 'expression': '1h'}
        commands = [
            {'action': 'list', 'id': ''},
            {'action': 'create', 'schedule': schedule, 'target': {
                'kind': 'workflow', 'agent_id': '',
                'flow_ref': {'kind': 'flow', 'id': 'published-flow', 'version': 1}}},
            {'action': 'create', 'schedule': schedule, 'target': {
                'kind': 'agent', 'agent_id': 'daily-agent', 'prompt': 'Prepare the daily summary.',
                'flow_ref': {'kind': 'flow', 'id': '', 'version': 1}}},
        ]
        for args in commands:
            with self.subTest(args=args):
                jsonschema.validate(args, schema)

    def test_recurring_tasks_preserve_the_published_input_contract(self):
        from ops.compat.compare import schema_changes
        published = json.loads((ROOT / 'tests/fixtures/automation-0.1.126-recurring-tool.json').read_text())
        current = tool_schema('automation', 'RecurringTasks')
        self.assertEqual([], list(schema_changes(published['schema'], current)))
        schedule = {'type': 'interval', 'expression': '1h'}
        accepted = [{'action': action} for action in published['schema']['properties']['action']['enum']]
        accepted += [
            {'action': 'create', 'schedule': schedule, 'target': {'kind': kind}}
            for kind in published['schema']['properties']['target']['properties']['kind']['enum']
        ]
        accepted += [
            {'action': 'list', 'id': ''},
            {'action': 'update', 'id': 'task'},
            {'action': 'create', 'schedule': schedule, 'target': {
                'kind': 'workflow', 'agent_id': '',
                'flow_ref': {'kind': 'flow', 'id': 'published-flow', 'version': 1}}},
            {'action': 'create', 'schedule': schedule, 'target': {
                'kind': 'agent', 'agent_id': 'daily-agent', 'prompt': 'Prepare the daily summary.',
                'flow_ref': {'kind': 'flow', 'id': '', 'version': 1}}},
        ]
        for args in accepted:
            with self.subTest(args=args):
                jsonschema.validate(args, published['schema'])
                jsonschema.validate(args, current)

    def test_recurring_action_guidance_distinguishes_configuration_from_input(self):
        entries = yaml.safe_load((ROOT / 'platform/automation/src/agent/_index.yaml').read_text())['entries']
        tool = next(entry['meta'] for entry in entries if entry.get('meta', {}).get('llm_alias') == 'RecurringTasks')
        self.assertIn('AutomationsRead action=catalog', tool['llm_description'])
        read = next(entry['meta'] for entry in entries if entry.get('meta', {}).get('llm_alias') == 'AutomationsRead')
        self.assertIn('RecurringTasks action=list', read['llm_description'])
        self.assertIn('RecurringTasks action=list', tool['llm_description'])
        traits = yaml.safe_load((ROOT / 'platform/automation/src/traits/_index.yaml').read_text())['entries']
        manager = next(entry for entry in traits if entry['name'] == 'manager')
        self.assertIn('RecurringTasks action=list', manager['prompt'])
        self.assertIn('AutomationsRead action=list', manager['prompt'])
        fields = json.loads(tool['input_schema'])['properties']['target']['properties']
        self.assertIn('config_schema', fields['config']['description'])
        self.assertIn('input_schema', fields['input']['description'])
        self.assertIn('required', fields['input']['description'].lower())
        self.assertIn('input', fields['config']['description'].lower())
        self.assertIn('requested', fields['input']['description'].lower())
        self.assertIn('optional', fields['input']['description'].lower())


if __name__ == '__main__':
    unittest.main()
