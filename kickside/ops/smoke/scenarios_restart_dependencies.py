"""Runtime restarts retain installed roots before applying endpoint overrides."""
import subprocess
import sys
from pathlib import Path

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from scenarios_providers import configure_provider_endpoints


def optional_root_restart(ctx):
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        inst.install('kickside/github')
        before = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0')['dependencies']
        roots = {row['id']: row for row in before if row['is_root']}
        require(any(row['component'] == 'kickside/github' for row in roots.values()),
                'Optional provider install has no root declaration')
        base = fixture.fixtures.start('github')
        inst.cleanup.add('restart provider fixture', fixture.fixtures.stop)
        fixture.browser_check().login()
        configure_provider_endpoints(fixture, {'kickside.github:endpoint_api': base})
        with fixture.paused():
            pass
        after = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0')['dependencies']
        current = {row['id']: row for row in after if row['is_root']}
        for identity, original in roots.items():
            require(identity in current and current[identity]['component'] == original['component']
                    and current[identity]['parameters'] == original['parameters'],
                    'Runtime restart changes an installed root declaration or its bindings: ' + identity)
        endpoint = inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.github:endpoints')['entry']
        require(endpoint['data']['endpoints']['api'] == base,
                'Restart loses the configured optional provider endpoint')
        fixture.browser.screenshot('optional-provider-after-restart')
        inst.evidence.save('restart-root-proof', {'before': sorted(roots), 'after': sorted(current),
            'endpoint': endpoint['data']['endpoints']['api'], 'runtime_pid': inst.process.pid})


def audit_consistency(ctx):
    command = [sys.executable, '-m', 'unittest', 'tests.test_ui_guard_audit']
    completed = subprocess.run(command, cwd=Path(__file__).parent, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('issue-audit-consistency', {'command': command, 'code': completed.returncode,
        'output': completed.stdout, 'error': completed.stderr})
    require(completed.returncode == 0, completed.stdout + completed.stderr)


REGISTRY = [Scenario('regression_issue_audit_consistency', 'regression', audit_consistency,
                     issues=('SMOKE-ISSUE-AUDIT-MERGE-CONSISTENCY',)),
            Scenario('regression_restart_optional_dependency_roots', 'regression', optional_root_restart,
                     issues=('SMOKE-RESTART-OPTIONAL-DEPENDENCY-ROOTS', 'TS-PUBLISHED-PROVIDER-OVERRIDE'))]
