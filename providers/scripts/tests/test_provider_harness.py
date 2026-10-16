import json
import argparse
import os
import shlex
import unittest
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]
MODULES = {module['path']: module['harness'] for module in
           json.loads((ROOT/'.github/modules.json').read_text())['modules'].values()
           if module.get('harness')}


def effective_replacements(harness, arguments):
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('--config', action='append')
    args, _ = parser.parse_known_args(shlex.split(arguments))
    paths = [(harness / path).resolve() for path in (args.config or ['.wippy.yaml'])]
    replacements = {}
    for path in paths:
        config = yaml.safe_load(path.read_text()) or {}
        replacements.update(config.get('workspace', {}).get('replacements', {}))
    return {name: (harness / source.strip()).resolve()
            for name, source in replacements.items() if source is not None and source.strip()}


class ProviderHarness(unittest.TestCase):
    def test_locked_modules_have_integrity_hashes(self):
        for module, harness in MODULES.items():
            with self.subTest(module=module):
                lock = yaml.safe_load((ROOT/module/harness/'wippy.lock').read_text())
                replacements = effective_replacements(ROOT/module/harness, os.environ.get('WIPPY_TEST_ARGS', ''))
                for dependency in lock['modules']:
                    if dependency['name'] in replacements:
                        source = replacements[dependency['name']]
                        manifest = yaml.safe_load((source/'wippy.yaml').read_text())
                        self.assertEqual(dependency['name'], manifest['organization']+'/'+manifest['module'])
                        self.assertTrue((source/'src').is_dir(), dependency['name'] + ' declares no module source tree')
                    else:
                        self.assertRegex(dependency.get('hash', ''), r'^[a-f0-9]{64}$', dependency['name'])

    def test_runner_is_discoverable_and_make_uses_the_test_entrypoint(self):
        for module, harness in MODULES.items():
            with self.subTest(module=module):
                lock = yaml.safe_load((ROOT/module/harness/'wippy.lock').read_text())
                runner = next(dep for dep in lock['modules'] if dep['name'] == 'wippy/test')
                self.assertGreaterEqual(tuple(map(int, runner['version'].split('.'))), (0, 4, 17))
                make = (ROOT/module/'Makefile').read_text()
                self.assertIn('wippy test', make)
                self.assertNotIn('wippy run test', make)
                self.assertFalse((ROOT/module/harness/'session_contract/_index.yaml').exists())

if __name__ == '__main__': unittest.main()
