"""Public packages and tests include the source material they consume."""
from pathlib import Path
import os
import subprocess
import sys

import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test


def ui_harness(ctx):
    root = Path(ctx.inst.config['source'])
    subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tests',
                    '-p', 'test_public_harnesses.py'], cwd=root, check=True)
    run_focused_module_test(ctx, 'kickside/ui', 'nav_test', lint=True)


def documentation_sources(ctx):
    root = Path(ctx.inst.config['source'])
    result = subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'app/test',
                             '-p', 'test_documentation_sources.py'], cwd=root,
                            text=True, capture_output=True, check=True)
    ctx.inst.evidence.save('documentation-source-check', {'output': result.stdout + result.stderr})


def documentation_workflows(ctx):
    root = Path(ctx.inst.config['source']).parent / 'docs-site'
    result = subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tests',
                             '-p', 'test_workflows.py'], cwd=root,
                            text=True, capture_output=True, check=True)
    ctx.inst.evidence.save('documentation-workflow-check', {'output': result.stdout + result.stderr})
    subprocess.run([sys.executable, 'scripts/sync_sources.py', '--check',
                    '--content', str(root.parent / 'docs'), '--sources', str(root.parent)],
                   cwd=root, check=True)


def module_handbook(ctx):
    root = Path(ctx.inst.config['source'])
    module = root.parent / 'module'
    canonical = root / 'app/src/app/docs/kickside-development'
    bundled = module / 'docs/kickside-development'
    expected = {str(path.relative_to(canonical)): path.read_bytes()
                for path in canonical.rglob('*') if path.is_file()}
    actual = {str(path.relative_to(bundled)): path.read_bytes()
              for path in bundled.rglob('*') if path.is_file()}
    require(expected and expected == actual, 'Module handbook differs from public application sources')
    subprocess.run(['make', '--dry-run', 'verify', 'release-check'], cwd=module,
                   check=True, capture_output=True)
    require((module / 'scripts/test-initializer.mjs').is_file(),
            'Public module verification must include its initializer tests')
    workflow = yaml.safe_load((module / '.github/workflows/ci.yml').read_text())
    step = next(step for step in workflow['jobs']['modules']['steps']
                if 'make check check-handbook' in step.get('run', ''))
    subprocess.run(['bash', '-euo', 'pipefail', '-c', step['run']], cwd=module,
                   env=dict(os.environ, GITHUB_WORKSPACE=str(ctx.inst.root)), check=True)
    script = (module / 'scripts/sync-handbook.mjs').read_text()
    require("'https://github.com/kicksideai/kickside.git'" in script and
            "'app/src/app/docs/kickside-development'" in script,
            'Module handbook synchronization must use its public source owner')


REGISTRY = [
    Scenario('public_ui_harness_sources', 'regression', ui_harness,
             issues=('PUBLIC-UI-HARNESS-SOURCES', 'PUBLIC-UI-POSTGRES-DATABASE-OWNERSHIP')),
    Scenario('public_application_documentation_sources', 'regression', documentation_sources,
             issues=('PUBLIC-APPLICATION-DOCUMENTATION-SOURCES',)),
    Scenario('public_documentation_workflow_sources', 'regression', documentation_workflows,
             issues=('PUBLIC-DOCUMENTATION-WORKFLOW-SOURCES', 'PUBLIC-MODULE-CATALOG-SOURCE-DRIFT')),
    Scenario('public_module_handbook_sources', 'regression', module_handbook,
             issues=('PUBLIC-MODULE-HANDBOOK-SOURCES', 'PUBLIC-MODULE-VERIFICATION-SOURCES', 'PUBLIC-TEMPLATE-TEMPORARY-WORKSPACE')),
]
