from pathlib import Path
import unittest

import yaml


class ChannelSinkDeclarationTest(unittest.TestCase):
    def test_deferred_resolution_grant_names_only_the_stored_reference_owner(self):
        source = Path(__file__).resolve().parents[1] / 'src' / '_index.yaml'
        entries = yaml.safe_load(source.read_text())['entries']
        grants = [entry for entry in entries if entry.get('kind') == 'security.policy'
                  and entry.get('policy', {}).get('actions') == 'kickside.execution.defer']
        self.assertEqual(len(grants), 1)
        self.assertEqual(grants[0]['groups'], ['kickside.channel.service:hub_execution'])
        self.assertEqual(grants[0]['policy']['resources'], 'kickside.channel.service:execution_ref')
        self.assertEqual(grants[0]['policy']['effect'], 'allow')
        by_name = {entry['name']: entry for entry in entries}
        for name in ('receive_func', 'verify_reply_func', 'reserve_reply_func'):
            self.assertIn('kickside.channel:hub_deferred_execution', by_name[name]['security']['policies'])

    def test_writable_declaration_and_schema(self):
        source = Path(__file__).resolve().parents[1] / "src" / "sink" / "_index.yaml"
        entries = {entry["name"]: entry for entry in yaml.safe_load(source.read_text())["entries"]}
        sink = entries["channel_sink"]
        self.assertEqual(sink["kind"], "contract.binding")
        self.assertEqual(sink["meta"]["delivery"], "at_most_once")
        self.assertEqual(sink["meta"]["input_shape"], "content")
        self.assertEqual(sink["contracts"][0]["methods"]["write"], "kickside.channel.sink:channel_send_write")
        port = entries["channel_post"]
        self.assertEqual(port["binding"], "kickside.channel.sink:channel_sink")
        self.assertEqual(set(port["operations"]), {"upsert"})


if __name__ == "__main__":
    unittest.main()
