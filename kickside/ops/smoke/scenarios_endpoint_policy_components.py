"""Native module gates retain historical endpoint capabilities."""
import os
from pathlib import Path
import subprocess
import sys

from harness import Scenario, require
from scenarios import all_checks
from module_harness import run_focused_app_test, run_focused_module_test


def endpoint_policy_components(ctx):
    checks = []
    for module in ('agents', 'automation', 'component', 'connection', 'core', 'identity', 'inbox',
                   'models', 'oauth', 'transform', 'ui', 'users'):
        checks.append((module + ' composition', lambda module=module: run_focused_module_test(ctx, 'kickside/' + module, 'module_access_policy')))
        checks.append((module + ' endpoint declarations', lambda module=module: run_focused_module_test(ctx, 'kickside/' + module, 'user_endpoint_policy_test')))
    checks.append(('core baseline', lambda: run_focused_module_test(ctx, 'kickside/contract', 'user_endpoint_policy_test')))
    all_checks(ctx.inst, checks)


REGISTRY = [Scenario('regression_endpoint_policy_components', 'regression', endpoint_policy_components,
                     issues=('SECURITY-RETIRED-POLICY-GROUP-UPDATE', 'SECURITY-PUBLISHED-BINDING-MODULE-ISOLATION', 'IDENTITY-MODULE-HARNESS-TEST-DEPENDENCY', 'SECURITY-HISTORICAL-USERS-GRANTS'))]


def endpoint_policy_architecture(ctx):
    environment = dict(ctx.inst.env)
    source_roots = [ctx.inst.config.get('source'), *ctx.inst.config['replace'].values()]
    environment['SECURITY_MODULE_ROOTS'] = os.pathsep.join(sorted({root for root in source_roots if root}))
    root = Path(__file__).resolve().parents[2]
    result = subprocess.run([sys.executable, '-m', 'unittest',
                             'ops.smoke.tests.test_endpoint_policy_components'],
                            cwd=root, env=environment, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('endpoint-policy-architecture', {'code': result.returncode,
                                                         'output': result.stdout, 'error': result.stderr})
    require(result.returncode == 0, 'Historical endpoint grant ownership fails: ' + result.stdout + result.stderr)


REGISTRY.append(Scenario('regression_endpoint_policy_architecture', 'regression', endpoint_policy_architecture,
                         issues=('PUBLISHED-SESSION-SECURITY-IDENTITY', 'SECURITY-RETIRED-POLICY-GROUP-UPDATE',
                                 'SECURITY-RUNTIME-ONLY-MODULE-POLICY-CHECK',
                                 'SMOKE-ENDPOINT-POLICY-SOURCE-INVENTORY')))


def jobs_endpoint_policy_component(ctx):
    run_focused_module_test(ctx, 'kickside/jobs', 'module_access_policy')


REGISTRY.append(Scenario('regression_jobs_endpoint_policy_component', 'regression', jobs_endpoint_policy_component,
                         issues=('PUBLISHED-SESSION-SECURITY-IDENTITY', 'SECURITY-RETIRED-POLICY-GROUP-UPDATE',
                                 'SECURITY-ENDPOINT-ID-PATTERN')))


def endpoint_policy_consumers(ctx):
    all_checks(ctx.inst, [(module + ':' + entry,
        lambda module=module, entry=entry: run_focused_module_test(ctx, module, entry))
        for module, entry in (('kickside/ui', 'shell_access_test'), ('kickside/users', 'packaging_test'))])


REGISTRY.append(Scenario('regression_endpoint_policy_consumers', 'regression', endpoint_policy_consumers,
                         issues=('SECURITY-RETIRED-POLICY-GROUP-UPDATE',)))


def mcp_endpoint_policy_component(ctx):
    all_checks(ctx.inst, [(entry, lambda entry=entry: run_focused_module_test(ctx, 'kickside/mcp', entry))
        for entry in ('module_access_policy', 'user_endpoint_policy_test', 'repo_group_shares_test', 'repo_folder_scope_test')])


REGISTRY.append(Scenario('regression_mcp_endpoint_policy_component', 'regression', mcp_endpoint_policy_component,
                         issues=('SECURITY-PUBLISHED-MCP-POLICY-UPDATE', 'MCP-HARNESS-TEST-DEPENDENCY')))


def scoped_endpoint_policy_consumers(ctx):
    checks = [(module + ' endpoint declarations',
        lambda module=module: run_focused_module_test(ctx, 'kickside/' + module, 'user_endpoint_policy_test'))
        for module in ('knowledge', 'skills', 'transfer', 'uploads', 'webhooks', 'workflows', 'sso')]
    checks.append(('uploads architecture', lambda: run_focused_module_test(ctx, 'kickside/uploads', 'uploads_architecture_test')))
    for module in ('kickside/code-execution', 'kickside/kb10', 'kickside/mcp-client', 'kickside/simplefin',
                   'kickside/webscout', 'kickside/research', 'chestor/db-schema', 'chestor/graph',
                   'chestor/journal', 'chestor/roadmap', 'chestor/workspace', 'kickside/crm'):
        checks.append((module + ' endpoint declarations',
                       lambda module=module: run_focused_module_test(ctx, module, 'user_endpoint_policy_test')))
    for module, entry in (('kickside/code-execution', 'code_execution_packaging_test'), ('kickside/simplefin', 'simplefin_smoke_test'),
                         ('chestor/db-schema', 'schema_packaging_test'), ('chestor/graph', 'graph_packaging_test'),
                         ('chestor/journal', 'journal_packaging_test'), ('chestor/roadmap', 'roadmap_packaging_test'),
                         ('chestor/workspace', 'workspace_packaging_test')):
        checks.append((module + ' admission architecture',
                       lambda module=module, entry=entry: run_focused_module_test(ctx, module, entry)))
    all_checks(ctx.inst, checks)


REGISTRY.append(Scenario('regression_scoped_endpoint_policy_consumers', 'regression',
                         scoped_endpoint_policy_consumers,
                         issues=('WAVE3-SCOPED-ENDPOINT-POLICY-CONSUMERS', 'WAVE3-SKILLS-TEST-DEPENDENCY',
                                 'WAVE3-TRANSFER-TEST-DEPENDENCY', 'WAVE3-WEBHOOKS-TEST-DEPENDENCY')))


def core_endpoint_policy_baseline(ctx):
    all_checks(ctx.inst, [
        ('composed application admission', lambda: run_focused_app_test(
            ctx, Path(ctx.inst.config['source']) / 'app/test', 'user_endpoint_policy_test')),
        ('shared Core baseline', lambda: run_focused_module_test(ctx, 'kickside/contract', 'user_endpoint_policy_test')),
        ('policy architecture', lambda: endpoint_policy_architecture(ctx)),
    ])


REGISTRY.append(Scenario('regression_core_endpoint_policy_baseline', 'regression',
                         core_endpoint_policy_baseline,
                         issues=('SECURITY-PUBLISHED-BINDING-MODULE-ISOLATION',)))


def execution_baseline_identity_resolution(ctx):
    run_focused_app_test(ctx, Path(ctx.inst.config['source']) / 'app/test',
                         'admin_boundary_policy_test')


REGISTRY.append(Scenario('execution_baseline_identity_resolution', 'regression',
                         execution_baseline_identity_resolution,
                         issues=('EXECUTION-BASELINE-IDENTITY-RESOLUTION',)))


def execution_resolver_private_read(ctx):
    run_focused_app_test(ctx, Path(ctx.inst.config['source']) / 'app/test',
                         'resolver_identity_capability_test')


REGISTRY.append(Scenario('execution_resolver_private_read', 'regression', execution_resolver_private_read,
                         issues=('EXECUTION-BASELINE-IDENTITY-RESOLUTION',)))
