# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Validate the provisional data contract schemas and documented refusals."""
import copy
import json
from pathlib import Path
import unittest

import yaml
from jsonschema import Draft202012Validator, ValidationError


ROOT = Path(__file__).resolve().parents[1]
TARGET = 'example:records'
COLUMN = {'name': 'name', 'type': 'string', 'nullable': False}
QUERY = {'from': {'target': TARGET}, 'select': [{'expr': {'col': 'name'}, 'as': 'name'}]}
LOAD_DESCRIPTION = {
    'columns': [COLUMN], 'key': ['name'], 'columns_version': 'schema-1',
    'limits': {'max_batch_rows': 100, 'max_period_in': 12, 'abandon_after_ms': 60000},
    'supports': {'replace_scope': True, 'expect': True, 'allow_shrink': True, 'multi_target': True},
}
READ_DESCRIPTION = {
    'target': TARGET, 'title': 'Records', 'loadable': True, 'columns': [COLUMN],
    'key': ['name'], 'unique': [['name']], 'columns_version': 'schema-1',
    'relations': [], 'pseudo_columns': ['@run_id'], 'data_version': 'data-1',
    'capabilities': {
        'aggregate': True, 'join': 'none', 'derived': False, 'filtered_aggregates': False,
        'window': [], 'buckets': [], 'text': [], 'lineage': {'run_id': True},
        'row_ids': False, 'period_latest': False, 'render': False,
    },
    'limits': {key: 10 for key in (
        'max_rows', 'default_rows', 'max_groups', 'max_joins', 'max_in_values',
        'max_lookup_keys', 'max_period_in', 'max_depth', 'max_nodes', 'max_select')},
}
RESULT = {'targets': [{'target': TARGET, 'result': 'replaced', 'inserted': 1, 'deleted': 1,
                       'data_version': 'data-2'}]}
EXAMPLES = {
    'definable': {
        'types': ({}, {'types': [{'name': 'text', 'title': 'Text', 'coerces_to': 'string'}]}),
        'define': ({'code': 'records', 'title': 'Records', 'columns': [{'name': 'name', 'type': 'text'}]},
                   {'target': TARGET, 'created': True, 'planned': False,
                    'component_id': 'component-1', 'changes': [{'action': 'target_created'}]}),
        'remove': ({'target': TARGET}, {}),
    },
    'loadable': {
        'list': ({'query': 'Records'}, {'targets': [{'id': TARGET, 'title': 'Records'}]}),
        'describe': ({'target': TARGET}, LOAD_DESCRIPTION),
        'describe_scope': ({'target': TARGET, 'period_in': ['2026-01']},
                           {'rows': 1, 'owners': [], 'data_version': 'data-1'}),
        'begin': ({'run': {'run_id': 'run-1', 'source': {'kind': 'file'}},
                   'targets': [{'target': TARGET, 'columns_version': 'schema-1'}]}, {'load_id': 'load-1'}),
        'append': ({'load_id': 'load-1', 'target': TARGET, 'batch_index': 1,
                    'rows': [{'name': 'sample'}]}, {'staged': 1}),
        'commit': ({'load_id': 'load-1', 'targets': [{
            'target': TARGET, 'replace_scope': {'period_in': ['2026-01']},
            'expect': {'data_version': 'data-1', 'owners': [{'period': '2026-01', 'run_ids': []}]},
        }]}, RESULT),
        'rehearse': ({'load_id': 'load-1', 'targets': [{
            'target': TARGET, 'replace_scope': {'all': True},
            'expect': {'owners': [{'run_ids': []}]},
        }]}, RESULT),
        'discard': ({'load_id': 'load-1'}, {}),
    },
    'readable': {
        'list': ({}, {'targets': [{'id': TARGET, 'title': 'Records', 'loadable': True}]}),
        'describe': ({'target': TARGET}, READ_DESCRIPTION),
        'plan': (QUERY, {'columns': [COLUMN], 'targets': [{
            'target': TARGET, 'columns_version': 'schema-1', 'data_version': 'data-1', 'loadable': True,
        }], 'canonical': 'records-query', 'uses': [], 'warnings': []}),
        'query': (QUERY, {'columns': [COLUMN], 'rows': [{'name': 'sample'}],
                          'page': {'total': 1, 'filtered': 1, 'offset': 0, 'limit': 10, 'returned': 1},
                          'data_versions': {TARGET: 'data-1'}, 'columns_versions': {TARGET: 'schema-1'},
                          'stats': {'duration_ms': 1}}),
        'lookup': ({'target': TARGET, 'keys': [{'name': 'sample'}]},
                   {'key': ['name'], 'found': [{'key': {'name': 'sample'}, 'run_id': None}],
                    'missing': [], 'data_version': 'data-1'}),
    },
}


class DataContractSchemasTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.contracts = {}
        for name in EXAMPLES:
            path = ROOT / f'core/contract/src/data/registry/{name}_contracts/_index.yaml'
            document = yaml.safe_load(path.read_text())
            entry, = document['entries']
            assert document['namespace'] == 'kickside.data'
            assert entry['name'] == name and entry['kind'] == 'contract.definition'
            cls.contracts[name] = {method['name']: method for method in entry['methods']}

    def schemas(self):
        for contract, methods in self.contracts.items():
            self.assertEqual(set(methods), set(EXAMPLES[contract]))
            for method, declaration in methods.items():
                for side in ('input_schemas', 'output_schemas'):
                    self.assertEqual(len(declaration[side]), 1)
                    wrapped = declaration[side][0]
                    self.assertEqual(wrapped['format'], 'application/schema+json')
                    yield contract, method, side, json.loads(wrapped['definition'])

    def test_all_schemas_are_well_formed_and_closed_required_fields_are_declared(self):
        def check(node, root, properties=None, closed=False):
            if not isinstance(node, dict):
                return
            if 'type' in node:
                properties, closed = {}, False
            properties = {**(properties or {}), **node.get('properties', {})}
            closed = node.get('additionalProperties', not closed) is False
            if closed:
                self.assertLessEqual(set(node.get('required', [])), set(properties))
            if '$ref' in node:
                self.assertTrue(node['$ref'].startswith('#/'))
                target = root
                for part in node['$ref'][2:].split('/'):
                    target = target[part.replace('~1', '/').replace('~0', '~')]
            for keyword in ('allOf', 'anyOf', 'oneOf'):
                for branch in node.get(keyword, []):
                    check(branch, root, properties, closed)
            for keyword in ('if', 'then', 'else', 'not'):
                check(node.get(keyword), root, properties, closed)
            for keyword in ('properties', '$defs', 'patternProperties'):
                for child in node.get(keyword, {}).values():
                    check(child, root)
            for keyword in ('items', 'additionalProperties', 'propertyNames'):
                check(node.get(keyword), root)

        for contract, method, side, schema in self.schemas():
            with self.subTest(contract=contract, method=method, side=side):
                self.assertEqual(schema['$schema'], 'https://json-schema.org/draft/2020-12/schema')
                Draft202012Validator.check_schema(schema)
                check(schema, schema)
                self.assertIs(schema['additionalProperties'], False)

    def test_every_method_accepts_examples_and_rejects_missing_required_and_extra_fields(self):
        for contract, method, side, schema in self.schemas():
            with self.subTest(contract=contract, method=method, side=side):
                request, response = EXAMPLES[contract][method]
                example = request if side == 'input_schemas' else dict(response, success=True)
                validator = Draft202012Validator(schema)
                validator.validate(example)
                with self.assertRaises(ValidationError):
                    validator.validate(dict(example, unexpected=True))
                required = set(schema.get('required', []))
                if side == 'output_schemas':
                    required.update(schema['allOf'][0]['then'].get('required', []))
                for key in required:
                    incomplete = dict(example)
                    del incomplete[key]
                    with self.subTest(missing=key), self.assertRaises(ValidationError):
                        validator.validate(incomplete)

    def test_every_method_validates_refusals_and_retry_classification(self):
        for contract, method, side, schema in self.schemas():
            if side != 'output_schemas':
                continue
            validator = Draft202012Validator(schema)
            for code in schema['$defs']['DataError']['properties']['code']['enum']:
                for reason in (('infrastructure', 'timeout') if code == 'provider_unavailable' else (None,)):
                    for retriable in (False, True):
                        with self.subTest(contract=contract, method=method, code=code,
                                          reason=reason, retriable=retriable):
                            error = {'code': code, 'message': 'Refused', 'scope': 'flow', 'retriable': retriable}
                            if reason:
                                error['details'] = {'reason': reason}
                            refusal = {'success': False, 'error': error}
                            allowed = code in ('rate_limited', 'stalled') or reason == 'infrastructure'
                            if retriable and not allowed:
                                with self.assertRaises(ValidationError):
                                    validator.validate(refusal)
                            else:
                                validator.validate(refusal)
            error = {'code': 'not_found', 'message': 'Unknown target', 'scope': 'flow', 'retriable': False}
            for key in error:
                incomplete = dict(error)
                del incomplete[key]
                with self.subTest(contract=contract, method=method, missing=key), self.assertRaises(ValidationError):
                    validator.validate({'success': False, 'error': incomplete})
            for payload in ({'success': False}, {'success': True, 'error': error},
                            {'success': False, 'error': dict(error, unexpected=True)},
                            {'success': False, 'error': dict(error, code='provider_unavailable')},
                            {'success': False, 'error': dict(error, code='provider_unavailable',
                                                             details={'reason': 'query_failed'})}):
                with self.subTest(contract=contract, method=method, payload=payload), self.assertRaises(ValidationError):
                    validator.validate(payload)
            for key, value in EXAMPLES[contract][method][1].items():
                with self.subTest(contract=contract, method=method, field=key), self.assertRaises(ValidationError):
                    validator.validate({'success': False, 'error': error, key: value})

    def test_types_require_coercion_exactly_when_bulk_writable_is_not_false(self):
        schema = json.loads(self.contracts['definable']['types']['output_schemas'][0]['definition'])
        validator = Draft202012Validator(schema)
        for bulk in (None, True, False):
            for coercion in (None, 'string'):
                with self.subTest(bulk=bulk, coercion=coercion):
                    column_type = {'name': 'text', 'title': 'Text'}
                    if bulk is not None:
                        column_type['bulk_writable'] = bulk
                    if coercion is not None:
                        column_type['coerces_to'] = coercion
                    payload = {'success': True, 'types': [column_type]}
                    if (bulk is False) == (coercion is None):
                        validator.validate(payload)
                    else:
                        with self.assertRaises(ValidationError):
                            validator.validate(payload)

    def test_define_distinguishes_plans_writes_and_existing_target_requests(self):
        method = self.contracts['definable']['define']
        request = Draft202012Validator(json.loads(method['input_schemas'][0]['definition']))
        response = Draft202012Validator(json.loads(method['output_schemas'][0]['definition']))
        request.validate({'target': TARGET, 'description': 'Updated description', 'dry_run': True})
        for payload in ({'target': TARGET}, {'code': 'records', 'title': 'Records'},
                        dict(EXAMPLES['definable']['define'][0], target=TARGET)):
            with self.subTest(payload=payload), self.assertRaises(ValidationError):
                request.validate(payload)
        planned = dict(EXAMPLES['definable']['define'][1], success=True, planned=True)
        del planned['component_id']
        response.validate(planned)
        with self.assertRaises(ValidationError):
            response.validate(dict(planned, component_id='component-1'))
        with self.assertRaises(ValidationError):
            response.validate(dict(planned, planned=False))

    def test_query_problems_conceal_missing_and_invisible_joined_targets(self):
        readme = ' '.join((ROOT / 'core/contract/README.md').read_text().split())
        self.assertIn('a joined target that does not exist or is not visible', readme)
        self.assertIn('unknown_target', readme)
        for name in ('plan', 'query'):
            method = self.contracts['readable'][name]
            description = ' '.join(method['description'].split())
            with self.subTest(method=name):
                self.assertIn('a joined target that does not exist or is not visible', description)
                self.assertIn('unknown_target problem in details.problems', description)
                schema = json.loads(method['output_schemas'][0]['definition'])
                refusal = {'success': False, 'error': {
                    'code': 'invalid_request', 'message': 'Invalid query', 'scope': 'flow',
                    'retriable': False, 'details': {'reason': 'invalid_query', 'problems': [{
                        'code': 'unknown_target', 'path': '/joins/0/target',
                        'message': 'Unknown target',
                    }]},
                }}
                Draft202012Validator(schema).validate(refusal)

    def test_dispatch_inventory_identifies_provisional_data_usage_as_intended(self):
        declarations = json.loads((ROOT / 'scripts/contract-dispatch.json').read_text())
        family = {'kickside.data:' + name for name in self.contracts}
        for declaration in declarations:
            if family.intersection(declaration['contracts']):
                with self.subTest(source=declaration['source']):
                    self.assertIn('intended usage', declaration['reason'].lower())

    def test_scope_choices_and_nested_required_fields(self):
        for name in ('commit', 'rehearse'):
            schema = json.loads(self.contracts['loadable'][name]['input_schemas'][0]['definition'])
            validator = Draft202012Validator(schema)
            for replacement in ({}, {'all': False}, {'all': True, 'period_in': ['2026-01']}):
                invalid = {'load_id': 'load-1', 'targets': [{'target': TARGET, 'replace_scope': replacement}]}
                with self.subTest(method=name, replacement=replacement), self.assertRaises(ValidationError):
                    validator.validate(invalid)
            invalid = copy.deepcopy(EXAMPLES['loadable'][name][0])
            del invalid['targets'][0]['expect']['owners'][0]['run_ids']
            with self.assertRaises(ValidationError):
                validator.validate(invalid)


if __name__ == '__main__':
    unittest.main()
