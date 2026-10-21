"""Module template persistence and retained-page refresh regressions."""
from pathlib import Path
import subprocess

from harness import Scenario, require
from module_harness import run_focused_app_test


def starter_page_refresh(ctx):
    root = Path(ctx.inst.config['source']).resolve().parent / 'module'
    require((root / '.kickside-module.json').is_file(), 'Module template checkout is absent')
    run_focused_app_test(ctx, root / 'test', 'log_test')
    result = subprocess.run(['make', 'test-ui'], cwd=root, env=ctx.inst.env,
                            capture_output=True, text=True, timeout=120)
    ctx.inst.evidence.save('starter-page-refresh', {
        'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
    })
    require(result.returncode == 0, 'Starter page refresh regression: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('starter_page_refresh', 'regression', starter_page_refresh,
                     issues=('TEMPLATE-MOUNTED-PAGE-REFRESH',))]
