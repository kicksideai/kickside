import unittest
from pathlib import Path

import yaml

LOAD = Path(__file__).resolve().parents[1]
ENTRIES = {entry['name']: entry for entry in yaml.safe_load((LOAD / 'src/load/_index.yaml').read_text())['entries']}


class LoadDeclarationTests(unittest.TestCase):
    def test_the_round_probe_uses_the_public_jobs_surface(self):
        self.assertEqual(ENTRIES['sqlite_round_probe']['imports']['jobs'], 'kickside.core.jobs:jobs')
        self.assertNotIn('claim', ENTRIES['sqlite_round_probe']['imports'])

    def test_command_and_page_phases_declare_public_control_surfaces(self):
        self.assertEqual(ENTRIES['phases']['imports']['slot'], 'kickside.automation:slot')
        self.assertEqual(ENTRIES['phases']['imports']['automations_lib'], 'kickside.automation:automation')
        self.assertEqual(ENTRIES['phases']['imports']['jobs'], 'kickside.core.jobs:jobs')

    def test_ci_runs_the_behavioral_fixture_on_both_engines(self):
        workflow = yaml.safe_load((LOAD.parents[1] / '.github/workflows/ci.yml').read_text())
        job = workflow['jobs']['load-fixture']
        self.assertEqual(set(job['strategy']['matrix']['engine']), {'sqlite', 'postgres'})
        gate = next(step for step in job['steps'] if step.get('name') == 'Test load fixture')
        self.assertEqual(gate['working-directory'], 'ops/load/test')

    def test_source_threads_declare_the_load_input_events(self):
        self.assertIn('source_thread', ENTRIES)
        inputs = ENTRIES['source_thread']['meta']['events']['input']
        self.assertEqual({entry['type'] for entry in inputs}, {'kickside.load:event', 'kickside.load:empty_probe'})

    def test_timer_and_event_bindings_have_one_source_and_share_the_round_consumer(self):
        self.assertIn('timer_kind', ENTRIES)
        for kind, install in [('timer_kind', 'timer_install'), ('event_kind', 'event_install')]:
            contracts = {entry['contract']: entry['methods'] for entry in ENTRIES[kind]['contracts']}
            self.assertEqual(contracts['kickside.contract:installable']['install'], 'kickside.load:' + install)
            self.assertEqual(contracts['kickside.trigger:round_consumer']['deliver'], 'kickside.load:event_deliver')
            self.assertNotIn('kickside.load:ping_contract', contracts)

    def test_workflow_probes_use_the_published_client_and_current_version_publisher(self):
        self.assertEqual(ENTRIES['workflows']['imports'].get('version_publish'), 'kickside.workflows.repo:version_publish')
        self.assertEqual(ENTRIES['workflows']['imports']['client'], 'userspace.dataflow:client')



if __name__ == '__main__':
    unittest.main()
