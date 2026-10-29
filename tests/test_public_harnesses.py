"""Native harnesses resolve public inputs and own their CI databases."""
from pathlib import Path
import json
import os
import re
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PublicHarnessTests(unittest.TestCase):
    def test_ci_uses_the_supported_runtime_for_every_gate(self):
        workflow = (ROOT / '.github/workflows/ci.yml').read_text()
        setups = re.findall(r'uses: kicksideai/\.github/actions/setup-wippy@[^\n]+\n(.*?)(?=\n    -|\Z)',
                            workflow, re.DOTALL)
        self.assertTrue(setups, 'CI must install the supported runtime')
        for setup in setups:
            with self.subTest(setup=setup):
                self.assertRegex(setup, r'(?m)^        version: 0\.3\.55a$')

    def test_release_extra_files_resolve_within_their_module(self):
        config = json.loads((ROOT / 'release-please-config.json').read_text())
        checked = []
        for module, package in config['packages'].items():
            for extra in package.get('extra-files', []):
                path = extra if isinstance(extra, str) else extra['path']
                if isinstance(extra, dict) and extra.get('glob'):
                    continue
                # Release Please resolves extra-file paths against the package.
                target = ROOT / path.lstrip('/') if path.startswith('/') else ROOT / module / path
                with self.subTest(module=module, path=path):
                    self.assertTrue(target.is_file(), f'release updater cannot find {target}')
                checked.append(target)
        self.assertIn(ROOT / 'platform/ui-kit/package/package.json', checked)

    def test_stateful_postgres_jobs_allocate_and_select_owned_databases(self):
        workflow = (ROOT / '.github/workflows/ci.yml').read_text()
        jobs = re.split(r'(?m)^        - module: ', workflow)[1:]
        checked = []
        for job in jobs:
            module = job.splitlines()[0]
            if not re.search(r'(?m)^          engine: postgres$', job):
                continue
            harness = ROOT / module / 'test/.wippy.yaml'
            if not harness.is_file() or not re.search(r'(?m)^  pg_database:', harness.read_text()):
                continue
            with self.subTest(module=module):
                self.assertIn('createdb "$database"', job)
                self.assertIn('trap cleanup_databases EXIT', job)
                for command in job.splitlines():
                    if 'wippy lint' in command or 'wippy test' in command:
                        # A worker suite may need its own clean queue. Every
                        # command must still use a tracked disposable database,
                        # including those after the primary harness database.
                        selected = re.search(r'--set "vars\.pg_database=\$\{databases\[(\d+)\]\}"', command)
                        tracked = re.findall(r'databases\+=\("\$([a-zA-Z_]\w*)"\)', job)
                        if selected:
                            self.assertLess(int(selected[1]), len(tracked), command)
                        else:
                            named = re.search(r'--set "vars\.pg_database=\$([a-zA-Z_]\w*)"', command)
                            self.assertIsNotNone(named, command)
                            self.assertIn(named[1], tracked, command)
            checked.append(module)
        self.assertTrue(checked, 'CI must exercise stateful PostgreSQL harnesses')

    def test_automation_upgrade_and_live_harnesses_use_separate_databases(self):
        workflow = (ROOT / '.github/workflows/ci.yml').read_text()
        jobs = re.split(r'(?m)^        - module: ', workflow)[1:]
        job = next(job for job in jobs if job.splitlines()[0] == 'platform/automation'
                   and re.search(r'(?m)^          engine: postgres$', job))
        commands = '\n'.join(line[12:] for line in job.split('          commands: |\n', 1)[1].splitlines()
                             if line.startswith('            '))
        # Execute CI's routing and cleanup, without building modules or opening
        # PostgreSQL. Record the database selected by each real shell command.
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for harness in ('test', 'live-test'):
                (root / 'platform/automation' / harness).mkdir(parents=True)
            tools = root / 'tools'
            tools.mkdir()
            helper = tools / 'record'
            helper.write_text('''#!/usr/bin/env python3
import json, os, sys
from pathlib import Path
name = Path(sys.argv[0]).name
with open(os.environ['HARNESS_CALLS'], 'a') as output:
    output.write(json.dumps({'name': name, 'args': sys.argv[1:], 'cwd': os.getcwd()}) + '\\n')
if name == 'wippy': print('PASSED\\n1 tests')
if name == 'jq': print('0.0.0')
''')
            helper.chmod(0o755)
            for name in ('createdb', 'dropdb', 'wippy', 'make', 'jq'):
                (tools / name).symlink_to(helper)
            calls = root / 'calls.jsonl'
            subprocess.run(['bash', '-euo', 'pipefail', '-c', commands], cwd=root,
                           env={**os.environ, 'PATH': str(tools) + os.pathsep + os.environ['PATH'],
                                'HARNESS_CALLS': str(calls), 'GITHUB_RUN_ID': 'review', 'GITHUB_RUN_ATTEMPT': '1'},
                           check=True, capture_output=True, text=True, timeout=20)
            recorded = [json.loads(line) for line in calls.read_text().splitlines()]
        tests = [call for call in recorded if call['name'] == 'wippy' and call['args'][0] == 'test']
        self.assertEqual(len(tests), 2)
        def selected(call, key):
            return next(arg.split('=', 1)[1] for arg in call['args'] if arg.startswith(key + '='))
        main = selected(tests[0], 'vars.pg_database')
        upgrade = selected(tests[0], 'vars.pg_prepared_upgrade_database')
        live = selected(tests[1], 'vars.pg_database')
        self.assertEqual(len({main, upgrade, live}), 3, 'the live harness must not boot on manually migrated upgrade tables')
        created = [call['args'][0] for call in recorded if call['name'] == 'createdb']
        dropped = [call['args'][0] for call in recorded if call['name'] == 'dropdb']
        self.assertCountEqual(created, [main, upgrade, live])
        self.assertCountEqual(dropped, created)

    def test_workspace_replacements_resolve_from_public_sources(self):
        paths = subprocess.check_output(['git', 'ls-files', '**/.wippy.yaml', '**/wippy.yaml'],
                                        cwd=ROOT, text=True).splitlines()
        checked = []
        for path in paths:
            config = ROOT / path
            workspace = re.search(r'(?m)^workspace:\n  replacements:\n((?:[ \t]+[^\n]*\n|\n)*)',
                                  config.read_text())
            if workspace is None:
                continue
            for target in re.findall(r'(?m)^    [^#\s][^:]*: (.+)$', workspace[1]):
                directory = config.parent / target.strip().strip("\"'")
                with self.subTest(config=path, replacement=target):
                    self.assertTrue(directory.is_dir(), 'Replacement must resolve from public sources')
                checked.append(directory)
        self.assertTrue(checked, 'Harness configurations must exercise local source replacements')
