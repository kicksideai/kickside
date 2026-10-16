import json
from pathlib import Path
import unittest

import yaml
from jsonschema import Draft202012Validator, ValidationError


ROOT = Path(__file__).resolve().parents[1]


class OAuthConnectionSchemaTests(unittest.TestCase):
    def validator(self):
        entries = yaml.safe_load((ROOT / 'platform/oauth/src/registry/connection_contracts/_index.yaml').read_text())['entries']
        contract = next(entry for entry in entries if entry['name'] == 'oauth_connection_contract')
        method = next(method for method in contract['methods'] if method['name'] == 'get_access_token')
        schema = json.loads(method['input_schemas'][0]['definition'])
        Draft202012Validator.check_schema(schema)
        return Draft202012Validator(schema)

    def test_token_input_preserves_caller_extension_fields(self):
        validator = self.validator()
        validator.validate({'scope': 'openid', 'provider_options': {'audience': 'resource'}})
        validator.validate({'rejected_access_token': 'expired', 'scope': 'openid'})

    def test_rejected_token_keeps_its_declared_validation(self):
        validator = self.validator()
        validator.validate({})
        for rejected in ('', False, 1):
            with self.subTest(rejected=rejected), self.assertRaises(ValidationError):
                validator.validate({'rejected_access_token': rejected})


if __name__ == '__main__':
    unittest.main()
