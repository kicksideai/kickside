import unittest

import scenarios_crm_chestor


class ChestorMutationCaptureTests(unittest.TestCase):
    def test_every_published_mutation_result_guard_records_the_compatibility_issue(self):
        registry = {scenario.name: scenario for scenario in scenarios_crm_chestor.REGISTRY}
        for kind in ('graph', 'roadmap', 'database'):
            for placement in ('root', 'folder'):
                with self.subTest(kind=kind, placement=placement):
                    guard = registry['northwind_' + kind + '_tools_' + placement]
                    self.assertIn('CHESTOR-PUBLISHED-MUTATION-RESULT-SHAPE', guard.issues)

    def test_published_crm_board_and_portable_schema_callers_record_their_issue(self):
        registry = {scenario.name: scenario for scenario in scenarios_crm_chestor.REGISTRY}
        for name in ('northwind_crm_tools', 'northwind_crm_schema_tools'):
            with self.subTest(name=name):
                self.assertIn('CRM-PUBLISHED-TOOL-RESULT-SHAPE', registry[name].issues)


if __name__ == '__main__':
    unittest.main()
