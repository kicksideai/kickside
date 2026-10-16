import os
from pathlib import Path
import tempfile
import unittest

from test_provider_harness import ROOT, effective_replacements


class ProviderConfigTests(unittest.TestCase):
    def test_explicit_configs_merge_in_order_and_resolve_from_the_harness(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR', ROOT)) as directory:
            root = Path(directory)
            harness = root / 'renamed-providers' / 'module' / 'test'
            harness.mkdir(parents=True)
            (harness / '.wippy.yaml').write_text('workspace:\n  replacements:\n    acme/ignored: ignored\n')
            (harness / 'base.yaml').write_text('workspace:\n  replacements:\n    acme/one: ../one\n    acme/two: ../stale\n')
            overlay = root / 'overlay with spaces.yaml'
            overlay.write_text('workspace:\n  replacements:\n    acme/two: ../../../renamed-core/two\n    acme/three: ../three\n')
            actual = effective_replacements(harness, '--config base.yaml --config "' + str(overlay) + '"')
            self.assertEqual(actual, {
                'acme/one': (harness / '../one').resolve(),
                'acme/two': (root / 'renamed-core/two').resolve(),
                'acme/three': (harness / '../three').resolve(),
            })

    def test_default_config_and_equals_form_use_runtime_config_selection(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR', ROOT)) as directory:
            harness = Path(directory)
            (harness / '.wippy.yaml').write_text('workspace:\n  replacements:\n    acme/one: ../one\n')
            (harness / 'only.yaml').write_text('workspace:\n  replacements:\n    acme/two: ../two\n')
            self.assertEqual(effective_replacements(harness, ''), {'acme/one': (harness / '../one').resolve()})
            self.assertEqual(effective_replacements(harness, '--config=only.yaml'), {'acme/two': (harness / '../two').resolve()})

    def test_absolute_first_config_resolves_replacements_from_the_lock_directory(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR', ROOT)) as directory:
            root = Path(directory)
            harness = root / 'renamed-providers/module/test'
            harness.mkdir(parents=True)
            config = root / 'configs/first.yaml'
            config.parent.mkdir()
            config.write_text('workspace:\n  replacements:\n    acme/one: ../../../renamed-core/one\n')
            self.assertEqual(effective_replacements(harness, '--config "' + str(config) + '"'),
                             {'acme/one': (root / 'renamed-core/one').resolve()})

    def test_missing_supplied_config_fails(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR', ROOT)) as directory:
            with self.assertRaises(FileNotFoundError):
                effective_replacements(Path(directory), '--config missing.yaml')
