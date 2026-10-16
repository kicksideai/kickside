"""Component audience union, live revocation, bounded fanout and native failures."""
from pathlib import Path
import os
import subprocess
import sys
from harness import Scenario, require
from module_harness import run_focused_module_test, run_focused_app_test


def notification_fanout(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'notify_access_test')
    run_focused_module_test(ctx, 'kickside/realtime', 'realtime_test')
    run_focused_module_test(ctx, 'kickside/realtime-dispatch', 'dispatch_test')


REGISTRY = [Scenario('component_notification_fanout', 'regression', notification_fanout,
    issues=('DESIGN-COMPONENT-NOTIFICATION-FANOUT', 'CORE-NOTIFICATION-OPTIONAL-OWNER'))]


def harness_local_closure(ctx):
    root = Path(__file__).resolve().parents[2]
    command = [sys.executable, 'scripts/check-harness-closure.py']
    result = subprocess.run(command, cwd=root, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('harness-local-closure', {'command': command, 'code': result.returncode,
        'output': result.stdout, 'error': result.stderr})
    require(result.returncode == 0, result.stdout + result.stderr)


REGISTRY.append(Scenario('harness_local_closure', 'regression', harness_local_closure,
    issues=('RELEASE-HARNESS-LOCAL-CLOSURE', 'SMOKE-FOCUSED-HARNESS-RESTORATION')))


def harness_execution(ctx):
    root = Path(__file__).resolve().parents[2]
    environment = dict(os.environ, PYTHONPATH=str(root / 'ops/smoke') + os.pathsep + os.environ.get('PYTHONPATH', ''))
    result = subprocess.run([sys.executable, '-m', 'unittest', 'tests.test_harness_closure', 'ops.smoke.tests.test_module_harness'],
        cwd=root, env=environment, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('harness-execution-options', {'code': result.returncode,
        'output': result.stdout, 'error': result.stderr})
    require(result.returncode == 0, result.stdout + result.stderr)
    live = Path(ctx.inst.config['replace']['kickside/automation']) / 'live-test'
    for entry in ('round_live_test', 'round_wake_test'):
        run_focused_app_test(ctx, live, entry)
    run_focused_module_test(ctx, 'kickside/oauth', 'negotiator_reply_test', lint=True)
    run_focused_module_test(ctx, 'kickside/skills', 'owned_bundle_test', lint=True)


REGISTRY.append(Scenario('harness_execution', 'regression', harness_execution,
    issues=('RELEASE-HARNESS-EXECUTION', 'SMOKE-FOCUSED-HARNESS-RESTORATION')))
