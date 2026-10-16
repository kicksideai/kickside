"""Release qualification retains published shapes and immutable source replacements."""
from pathlib import Path
import sys

from harness import Scenario, require
from module_harness import _command, run_focused_app_test, run_focused_module_test


def source_root(ctx):
    source = ctx.inst.config.get('source')
    require(source, 'Release qualification guards require the source checkout')
    return Path(source)


def immutable_replacement_sources(ctx):
    _command(ctx.inst, 'immutable-replacement-sources', [sys.executable, '-m', 'unittest',
             'discover', '-s', 'ops/smoke/tests', '-p', 'test_module_harness.py'],
             source_root(ctx), ctx.inst.env, 900)


def workflows_published_output_shape(ctx):
    output = ctx.inst.evidence.root / ctx.inst.evidence.label / 'published-output'
    _command(ctx.inst, 'workflows-published-output', [sys.executable, '-m', 'ops.compat.gate',
             '--repo', str(source_root(ctx)), '--module', 'kickside/workflows', '--output', str(output)],
             source_root(ctx), ctx.inst.env, 900)


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
