"""Native guards reject successful wrappers that register cases without running them."""
from pathlib import Path
import re

from harness import Scenario, require
from module_harness import run_focused_app_test, run_focused_module_test


def executed(completed, count, case):
    output = re.sub(r'\x1b\[[0-9;?]*[a-zA-Z]', '', completed.stdout + completed.stderr)
    totals = re.findall(r'\b(\d+) tests\b', output)
    require(totals and int(totals[-1]) == count and case in output,
            'Native suite does not execute its declared cases: ' + output)


def automation_cases(ctx):
    executed(run_focused_module_test(ctx, 'kickside/automation', 'artifact_test'), 5,
             'exports the engine artifact unchanged')
    executed(run_focused_module_test(ctx, 'kickside/automation', 'pullable_conformance_test'), 8,
             'passes a known-good cursored source')


def agents_cases(ctx):
    executed(run_focused_module_test(ctx, 'kickside/agents', 'kickside_agents_invoke__authorization_test'), 2,
             'retries component lookup and access infrastructure failures')


def jobs_cases(ctx):
    executed(run_focused_module_test(ctx, 'kickside/jobs', 'worker_pulse_test'), 1,
             'refreshes a heartbeat while its job marker row is locked')


def workflows_cases(ctx):
    executed(run_focused_module_test(ctx, 'kickside/workflows', 'block_catalog_test'), 1,
             'projects tools with exact identity and preserves non-public compiler descriptors')


def research_cases(ctx):
    executed(run_focused_module_test(ctx, 'kickside/research', 'block_contract_test'), 3,
             'declares one strict standalone Research wait Block')


def app_cases(ctx):
    executed(run_focused_app_test(ctx, Path(ctx.inst.config['source']) / 'app/test', 'pg_group_test'), 4,
             'broadcasts cross-process and drops a member on leave')


def round_projection(ctx):
    executed(run_focused_module_test(ctx, 'kickside/automation', 'drive_test'), 9,
             'reads one admitted delivery with its fence and literal key')
    executed(run_focused_module_test(ctx, 'kickside/automation', 'round_sink_bulk_test'), 3,
             'records every receipt and settles prepared output for 500 items')


def core_database_isolation(ctx):
    for index in range(2):
        result = run_focused_module_test(ctx, 'kickside/core', 'sql_transient_native_probe')
        executed(result, 1, 'driver kind and details survive wrapping')
        ctx.inst.evidence.save('native-isolation-pass-' + str(index), {'output': result.stdout})


REGISTRY = [
    Scenario('core_transient_database_isolation', 'regression', core_database_isolation, ('boot',),
             issues=('CORE-HARNESS-TRANSIENT-DATABASE-ISOLATION',), parallel=('native:core',)),
    Scenario('automation_declared_cases', 'regression', automation_cases, ('boot',),
             issues=('NATIVE-DECLARED-CASE-EXECUTION',), parallel=('native:automation',)),
    Scenario('agents_declared_cases', 'regression', agents_cases, ('boot',),
             issues=('NATIVE-DECLARED-CASE-EXECUTION',), parallel=('native:agents',)),
    Scenario('jobs_declared_cases', 'regression', jobs_cases, ('boot',),
             issues=('NATIVE-DECLARED-CASE-EXECUTION',), parallel=('native:jobs',)),
    Scenario('workflows_declared_cases', 'regression', workflows_cases, ('boot',),
             issues=('NATIVE-DECLARED-CASE-EXECUTION',), parallel=('native:workflows',)),
    Scenario('research_declared_cases', 'regression', research_cases, ('boot',),
             issues=('NATIVE-DECLARED-CASE-EXECUTION',), parallel=('native:research',)),
    Scenario('app_declared_cases', 'regression', app_cases, ('boot',),
             issues=('NATIVE-DECLARED-CASE-EXECUTION',), parallel=('native:app',)),
    Scenario('automation_round_authority_reads', 'regression', round_projection, ('boot',),
             issues=('AUTOMATION-ROUND-AUTHORITY-READ-COST',), parallel=('native:automation',)),
]
