import unittest
from types import SimpleNamespace

from scenarios_module_engine_profiles import module_engine_profiles


class ModuleEngineProfiles(unittest.TestCase):
    def test_base_repository_is_checked_without_verification_replacements(self):
        receipts = []
        evidence = SimpleNamespace(save=lambda name, row: receipts.append(row))
        context = SimpleNamespace(inst=SimpleNamespace(config={'replace': {}}, evidence=evidence))
        module_engine_profiles(context)
        self.assertGreater(len(receipts[0]['checked']), 0)
        self.assertEqual(receipts[0]['findings'], [])
