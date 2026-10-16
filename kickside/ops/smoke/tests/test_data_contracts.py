import json
from pathlib import Path
import unittest

import yaml

from data_contracts import METHODS, validators, verify_boundaries


class DataContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root = Path(__file__).resolve().parents[3] / 'core/contract/src/data/registry'
        cls.entries = {}
        for name in METHODS:
            entry = yaml.safe_load((root / (name + '_contracts/_index.yaml')).read_text())['entries'][0]
            cls.entries[name] = {'kind': entry['kind'], 'data': {'methods': entry['methods']}}

    def test_all_schema_references_and_request_boundaries(self):
        self.assertEqual(verify_boundaries(self.entries), 30)

    def test_query_plan_and_execution_share_the_request_grammar(self):
        methods = {method['name']: method for method in self.entries['readable']['data']['methods']}
        self.assertEqual(json.loads(methods['plan']['input_schemas'][0]['definition']),
                         json.loads(methods['query']['input_schemas'][0]['definition']))

    def test_reference_validation_reports_missing_definitions(self):
        entry = json.loads(json.dumps(self.entries['readable']))
        query = next(method for method in entry['data']['methods'] if method['name'] == 'query')
        schema = json.loads(query['input_schemas'][0]['definition'])
        schema['properties']['from']['$ref'] = '#/$defs/MissingSource'
        query['input_schemas'][0]['definition'] = json.dumps(schema)
        with self.assertRaises(KeyError):
            validators(entry, 'readable')
