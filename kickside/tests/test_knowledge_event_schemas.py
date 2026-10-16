from pathlib import Path
import unittest

import yaml
from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]


class KnowledgeEventSchemasTests(unittest.TestCase):
    def validator(self, name):
        path = ROOT / 'platform/knowledge/src/injection/events/_index.yaml'
        entries = yaml.safe_load(path.read_text())['entries']
        schema = next(entry['schema'] for entry in entries if entry['name'] == name)
        Draft202012Validator.check_schema(schema)
        return Draft202012Validator(schema)

    def test_digest_accepts_a_configuration_request_without_a_source_projection(self):
        self.validator('digest.requested').validate({
            'kb_id': 'kb-1', 'reason': 'config_changed', 'user_id': 'member-1',
        })

    def test_digest_accepts_a_complete_source_marker_and_rejects_partial_source_identity(self):
        validator = self.validator('digest.requested')
        marker = {'kb_id': 'kb-1', 'reason': 'source_complete',
                  'source_thread_id': 'thread-1', 'source_projection_id': 'projection-1',
                  'source_target_seq': 3}
        validator.validate(marker)
        for key in ('source_thread_id', 'source_projection_id', 'source_target_seq'):
            with self.subTest(missing=key):
                partial = dict(marker)
                del partial[key]
                self.assertTrue(list(validator.iter_errors(partial)))

    def test_treatment_keeps_its_required_source_identity(self):
        validator = self.validator('treatment.requested')
        self.assertTrue(list(validator.iter_errors({'kb_id': 'kb-1', 'reason': 'source_complete'})))


if __name__ == '__main__':
    unittest.main()
