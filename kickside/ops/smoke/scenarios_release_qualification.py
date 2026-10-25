"""Release qualification retains published shapes and immutable source replacements."""
from pathlib import Path
import os
import sys

from harness import Scenario, require
from module_harness import _command, _private_suite_root, run_focused_app_test, run_focused_module_test


def source_root(ctx):
    source = ctx.inst.config.get('source')
    require(source, 'Release qualification guards require the source checkout')
    return Path(source)


def immutable_replacement_sources(ctx):
    owner = _private_suite_root()
    environment = dict(ctx.inst.env)
    smoke_path = str(owner / 'ops/smoke')
    environment['PYTHONPATH'] = smoke_path + (os.pathsep + environment['PYTHONPATH']
                                              if environment.get('PYTHONPATH') else '')
    _command(ctx.inst, 'immutable-replacement-sources', [sys.executable, '-m', 'unittest',
             'discover', '-s', 'ops/smoke/tests', '-p', 'test_module_harness.py'],
             owner, environment, 900)


def workflows_published_output_shape(ctx):
    output = ctx.inst.evidence.root / ctx.inst.evidence.label / 'published-output'
    environment = dict(ctx.inst.env)
    environment['KICKSIDE_SOURCE_ROOT'] = str(source_root(ctx).resolve())
    _command(ctx.inst, 'workflows-published-output', [sys.executable, '-m', 'ops.compat.gate',
             '--repo', str(source_root(ctx)), '--module', 'kickside/workflows', '--output', str(output)],
             _private_suite_root(), environment, 900)


def google_transport_retry_error(ctx):
    run_focused_module_test(ctx, 'kickside/google', 'token_retry_test')


def component_unwired_lifecycle_signature(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'lifecycle_seam_test', lint=True)


def checkpoint_policy_error_signature(ctx):
    run_focused_module_test(ctx, 'kickside/agents', 'checkpoint_policy', lint=True)


def published_root_caller_upgrade_order(ctx):
    run_focused_app_test(ctx, source_root(ctx)/'app/test/root-install', 'published_root_test')


REGISTRY = [
    Scenario('published_root_caller_upgrade_order', 'regression', published_root_caller_upgrade_order,
             issues=('RESULT-WINDOW-PUBLISHED-CALLER-UPGRADE-ORDER',)),
    Scenario('component_unwired_lifecycle_signature', 'regression', component_unwired_lifecycle_signature,
             issues=('COMPONENT-UNWIRED-COMMIT-SIGNATURE',)),
    Scenario('checkpoint_policy_error_signature', 'regression', checkpoint_policy_error_signature,
             issues=('AGENTS-CHECKPOINT-POLICY-ERROR-SIGNATURE',)),
    Scenario('focused_harness_immutable_sources', 'regression', immutable_replacement_sources,
             issues=('SMOKE-IMMUTABLE-REPLACEMENT-SOURCES',)),
    Scenario('workflows_published_output_shape', 'regression', workflows_published_output_shape,
             issues=('WORKFLOWS-PUBLISHED-OUTPUT-SHAPE',)),
    Scenario('google_transport_retry_error', 'regression', google_transport_retry_error,
             issues=('GOOGLE-TRANSPORT-ERROR-DETAIL',)),
]
