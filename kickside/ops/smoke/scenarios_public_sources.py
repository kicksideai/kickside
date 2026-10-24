"""Public packages and tests include the source material they consume."""
from pathlib import Path
import os
import subprocess
import sys

import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test


def public_source_root(ctx):
    source = ctx.inst.config.get('source')
    require(source, 'Public source guard requires the configured public source checkout')
    root = Path(source).resolve()
    require(root.is_dir(), 'Public source guard requires the configured public source checkout')
    return root


def public_sibling_root(ctx, name):
    checkout = ctx.inst.config.get('source_checkouts', {}).get(name)
    require(checkout, 'Public source guard requires declared checkout: ' + name)
    root = Path(checkout).resolve()
    require(root.is_dir(), 'Public source guard requires pinned checkout: ' + name)
    return root


def ui_harness(ctx):
    root = public_source_root(ctx)
    subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tests',
                    '-p', 'test_public_harnesses.py'], cwd=root, check=True)
    run_focused_module_test(ctx, 'kickside/ui', 'nav_test', lint=True)


def documentation_sources(ctx):
    root = public_source_root(ctx)
    result = subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'app/test',
                             '-p', 'test_documentation_sources.py'], cwd=root,
                            text=True, capture_output=True, check=True)
    ctx.inst.evidence.save('documentation-source-check', {'output': result.stdout + result.stderr})


def documentation_workflows(ctx):
    root = public_sibling_root(ctx, 'docs-site')
    docs = public_sibling_root(ctx, 'docs')
    result = subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tests',
                             '-p', 'test_workflows.py'], cwd=root,
                            text=True, capture_output=True, check=True)
    ctx.inst.evidence.save('documentation-workflow-check', {'output': result.stdout + result.stderr})
    subprocess.run([sys.executable, 'scripts/sync_sources.py', '--check',
                    '--content', str(docs), '--sources', str(root.parent)],
                   cwd=root, check=True)


def module_handbook(ctx):
    root = public_source_root(ctx)
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
             issues=('PUBLIC-APPLICATION-DOCUMENTATION-SOURCES', 'APP-DOCUMENTATION-REGISTRY-YAML')),
    Scenario('public_documentation_workflow_sources', 'regression', documentation_workflows,
             issues=('PUBLIC-DOCUMENTATION-WORKFLOW-SOURCES', 'PUBLIC-MODULE-CATALOG-SOURCE-DRIFT'),
             source_checkout_roots=('docs', 'docs-site')),
    Scenario('public_module_handbook_sources', 'regression', module_handbook,
             issues=('PUBLIC-MODULE-HANDBOOK-SOURCES', 'PUBLIC-MODULE-VERIFICATION-SOURCES', 'PUBLIC-TEMPLATE-TEMPORARY-WORKSPACE')),
]
