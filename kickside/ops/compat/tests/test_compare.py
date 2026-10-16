import copy
import json
from pathlib import Path
import unittest

from ops.compat.compare import compare, apply_transitions

BASE = json.loads((Path(__file__).parent / 'fixtures/baseline.json').read_text())

class CompareTests(unittest.TestCase):
    def findings(self, new):
        return compare('sample/module', '1.0.0', BASE, new)

    def test_unchanged_and_optional_additions_pass(self):
        new = copy.deepcopy(BASE)
        new['sample:nested']['Meta']['input_schema']['properties']['extra'] = {'type': 'string'}
        new['sample:optional'] = {'Kind': 'ns.requirement', 'Data': {'default': 'sample:user'}}
        self.assertEqual(self.findings(new), [])

    def test_every_removed_identity_fails(self):
        result = self.findings({})
        self.assertEqual({row['id'] for row in result}, set(BASE))
        self.assertTrue(all(row['code'] == 'removed_id' for row in result))

    def test_endpoint_path_and_kind_changes_fail(self):
        new = copy.deepcopy(BASE)
        new['sample:api']['Data']['path'] = '/renamed'
        new['sample:trait']['Kind'] = 'function.lua'
        self.assertEqual({r['code'] for r in self.findings(new)}, {'endpoint_changed', 'kind_changed'})

    def test_removed_contract_method_and_schema_slot_fail(self):
        new = copy.deepcopy(BASE)
        new['sample:contract']['Data']['methods'] = []
        self.assertEqual(self.findings(new)[0]['code'], 'removed_method')
        new = copy.deepcopy(BASE)
        new['sample:contract']['Data']['methods'][0]['input_schemas'] = []
        self.assertEqual(self.findings(new)[0]['code'], 'schema_removed')

    def test_nested_new_required_without_default_fails(self):
        new = copy.deepcopy(BASE)
        nested = new['sample:nested']['Meta']['input_schema']['properties']['payload']
        nested['required'] = ['text']
        self.assertEqual(self.findings(new)[0]['code'], 'new_required')
        nested['properties']['text']['default'] = ''
        self.assertEqual(self.findings(new), [])

    def test_required_new_requirement_and_removed_default_fail(self):
        new = copy.deepcopy(BASE)
        new['sample:new'] = {'Kind': 'ns.requirement', 'Data': {}}
        del new['sample:scope']['Data']['default']
        self.assertEqual({r['code'] for r in self.findings(new)}, {'new_requirement', 'requirement_default_removed'})

    def test_schema_type_and_enum_narrowing_fail(self):
        new = copy.deepcopy(BASE)
        new['sample:nested']['Meta']['input_schema']['properties']['payload']['type'] = 'string'
        self.assertEqual(self.findings(new)[0]['code'], 'schema_changed')

    def test_transition_is_exact_and_requires_evidence(self):
        rows = self.findings({})
        declaration = {'module': 'sample/module', 'baseline': '1.0.0', 'id': rows[0]['id'],
                       'code': rows[0]['code'], 'path': rows[0]['path'], 'reason': 'Migrate every caller',
                       'proof': 'tests/proof.py', 'owner_approval': 'approved transition'}
        with self.assertRaises(ValueError):
            apply_transitions(rows, [declaration], Path(__file__).parent)
        declaration['proof'] = 'test_compare.py'
        accepted = apply_transitions(rows, [declaration], Path(__file__).parent)
        self.assertEqual(sum(r['status'] == 'transition' for r in accepted), 1)
        declaration['baseline'] = '0.0.0'
        with self.assertRaises(ValueError):
            apply_transitions(rows, [declaration], Path(__file__).parent)

    def test_output_is_order_independent(self):
        self.assertEqual(self.findings({}), compare('sample/module', '1.0.0', dict(reversed(list(BASE.items()))), {}))

    def test_union_branch_addition_and_annotation_changes_pass(self):
        old = {'s:id': {'Kind': 'function.lua', 'Meta': {'input_schema': {'$defs': {'choice': {'oneOf': [{'const': 'a', 'description': 'before'}]}}}}, 'Data': {}}}
        new = copy.deepcopy(old)
        choice = new['s:id']['Meta']['input_schema']['$defs']['choice']
        choice['oneOf'][0]['description'] = 'after'
        choice['oneOf'].append({'const': 'b'})
        self.assertEqual(compare('s/module', '1', old, new), [])
        choice['oneOf'] = [{'const': 'b'}]
        self.assertEqual(compare('s/module', '1', old, new)[0]['code'], 'schema_changed')

    def test_new_unreferenced_definitions_pass(self):
        old = {'s:id': {'Kind': 'function.lua', 'Meta': {'input_schema': {'type': 'object'}}, 'Data': {}}}
        new = copy.deepcopy(old)
        new['s:id']['Meta']['input_schema']['$defs'] = {'new': {'type': 'string'}}
        self.assertEqual(compare('s/module', '1', old, new), [])

    def test_event_and_trait_types_cannot_disappear_in_place(self):
        for identity in ('sample:events', 'sample:trait'):
            new = copy.deepcopy(BASE)
            new[identity]['Meta'].pop('type')
            self.assertTrue(self.findings(new), identity)

    def test_declared_event_schema_and_trait_discovery_are_public(self):
        old = {'s:event': {'Kind': 'registry.entry', 'Meta': {'type': 'kickside.core.threads.event'}, 'Data': {'schema': {'type': 'object', 'properties': {'id': {'type': 'string'}}}}},
               's:trait': {'Kind': 'registry.entry', 'Meta': {'type': 'agent.trait'}, 'Data': {}}}
        new = copy.deepcopy(old)
        new['s:event']['Data']['schema']['required'] = ['id']
        new['s:trait']['Meta']['type'] = 'private'
        result = compare('s/module', '1', old, new)
        self.assertEqual({r['code'] for r in result}, {'new_required', 'public_type_changed'})

    def test_conditional_requirement_covered_by_old_global_requirement_passes(self):
        old = {'s:event': {'Kind': 'registry.entry', 'Meta': {}, 'Data': {'schema': {'type': 'object', 'required': ['a', 'b'], 'properties': {'a': {}, 'b': {}}}}}}
        new = copy.deepcopy(old)
        new['s:event']['Data']['schema']['required'] = ['a']
        new['s:event']['Data']['schema']['dependentRequired'] = {'a': ['b']}
        self.assertEqual(compare('s/module', '1', old, new), [])
        old['s:event']['Data']['schema']['required'] = ['a']
        self.assertEqual(compare('s/module', '1', old, new)[0]['code'], 'new_required')

    def test_transitions_for_another_selected_baseline_are_separate(self):
        rows = self.findings({})
        declaration = {'module': 'sample/module', 'baseline': '2.0.0', 'id': rows[0]['id'],
                       'code': rows[0]['code'], 'path': rows[0]['path'], 'reason': 'Other baseline transition',
                       'proof': 'test_compare.py', 'owner_approval': 'approved transition'}
        self.assertEqual(apply_transitions(rows, [declaration], Path(__file__).parent,
                                          baselines={'sample/module': {'version': '1.0.0'}}), rows)

    def test_contract_binding_keeps_published_contract_and_methods(self):
        old = {'s:binding': {'Kind': 'contract.binding', 'Meta': {}, 'Data': {'contracts': [{'contract': 's:service', 'methods': {'read': 's:reader'}}]}}}
        new = copy.deepcopy(old)
        new['s:binding']['Data']['contracts'][0]['methods'] = {}
        self.assertEqual(compare('s/module', '1', old, new)[0]['code'], 'removed_binding_method')
        new['s:binding']['Data']['contracts'] = []
        self.assertEqual(compare('s/module', '1', old, new)[0]['code'], 'removed_binding_contract')

    def test_null_requirement_default_is_not_a_default(self):
        new = copy.deepcopy(BASE)
        new['sample:new'] = {'Kind': 'ns.requirement', 'Data': {'default': None}}
        self.assertEqual(self.findings(new)[0]['code'], 'new_requirement')

    def test_additional_property_constraints_are_not_ignored(self):
        old = {'s:id': {'Kind': 'function.lua', 'Meta': {'input_schema': {'type': 'object', 'additionalProperties': {'type': 'string'}}}, 'Data': {}}}
        new = copy.deepcopy(old)
        new['s:id']['Meta']['input_schema']['additionalProperties']['maxLength'] = 5
        self.assertEqual(compare('s/module', '1', old, new)[0]['code'], 'schema_changed')

    def test_component_event_faces_preserve_declared_events(self):
        old = {'s:kind': {'Kind': 'contract.binding', 'Meta': {'events': {'input': [{'type': 's:submit'}], 'output': [{'type': 's:done'}]}}, 'Data': {}}}
        new = copy.deepcopy(old)
        new['s:kind']['Meta']['events']['input'] = []
        self.assertEqual(compare('s/module', '1', old, new)[0]['code'], 'removed_event')
