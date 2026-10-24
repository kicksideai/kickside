"""KB uploads settle on the documented owner notifications."""
from pathlib import Path
import re
import subprocess

from harness import Scenario, require
from module_harness import selected_module_overlay


PRIVATE_KB10_CHECKS = (
    ('providers/kb10/ui/src/app/useIngest.spec.ts', 'ui/src/app/useIngest.spec.ts'),
    ('providers/kb10/ui/src/test-setup.ts', 'ui/.smoke/kb10-frontend/test-setup.ts'),
    ('kickside/ops/smoke/mocks/kb10-frontend/Makefile', '.smoke/kb10-frontend/Makefile'),
    ('kickside/ops/smoke/mocks/kb10-frontend/vitest.config.ts',
     'ui/.smoke/kb10-frontend/vitest.config.ts'),
)


def private_repository():
    """The internal suite also owns the staged KB10 frontend contract checks."""
    return Path(__file__).resolve().parents[3]


def kb_upload_notifications(ctx):
    with selected_module_overlay(ctx, 'kickside/kb10', PRIVATE_KB10_CHECKS,
                                 owner=private_repository()) as module:
        command = ['make', '-f', '.smoke/kb10-frontend/Makefile', 'test']
        result = subprocess.run(command, cwd=module, env=ctx.inst.env,
                                capture_output=True, text=True, timeout=150)
        ctx.inst.evidence.save('kb-upload-notifications', {
            'command': command, 'exit_code': result.returncode,
            'stdout': result.stdout, 'stderr': result.stderr,
        })
        plain = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', result.stdout)
        summaries = re.findall(r'^\s*Tests\s+(.+)$', plain, re.M)
        passing = bool(summaries) and all(re.fullmatch(r'([1-9][0-9]*) passed\s+\(\1\)', summary.strip())
                                          for summary in summaries)
        require(result.returncode == 0 and passing,
                'KB upload notification guard: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('kb_upload_notifications', 'regression', kb_upload_notifications)]
