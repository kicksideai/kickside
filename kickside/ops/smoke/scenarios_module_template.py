"""Module template persistence and retained-page refresh regressions."""
import re
import subprocess

from harness import Scenario, require
from module_harness import run_focused_app_test, source_checkout_overlay


def starter_page_refresh(ctx):
    with source_checkout_overlay(ctx, 'module') as root:
        require((root / '.kickside-module.json').is_file(), 'Module template checkout is absent')
        run_focused_app_test(ctx, root / 'test', 'log_test')
        dependencies = subprocess.run(['npm', 'ci'], cwd=root / 'ui', env=ctx.inst.env,
                                      capture_output=True, text=True, timeout=300)
        require(dependencies.returncode == 0,
                'Starter page refresh dependencies: ' + dependencies.stdout + dependencies.stderr)
        result = subprocess.run(['make', 'test-ui'], cwd=root, env=ctx.inst.env,
                                capture_output=True, text=True, timeout=120)
        output = result.stdout + result.stderr
        verdict = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", output)
        tests = re.search(r"\bTests\s+([1-9][0-9]*)\s+passed\b", verdict)
        ctx.inst.evidence.save('starter-page-refresh', {
            'dependencies_code': dependencies.returncode, 'dependencies_output': dependencies.stdout,
            'dependencies_error': dependencies.stderr, 'code': result.returncode,
            'ui_test_count': int(tests.group(1)) if tests else 0,
            'output': result.stdout, 'error': result.stderr,
        })
        require(result.returncode == 0, 'Starter page refresh regression: ' + output)
        require(tests is not None, 'Starter page refresh ran no nonzero Vitest test verdict: ' + output)


REGISTRY = [Scenario('starter_page_refresh', 'regression', starter_page_refresh,
                     issues=('TEMPLATE-MOUNTED-PAGE-REFRESH',), source_checkout_roots=('module',))]
