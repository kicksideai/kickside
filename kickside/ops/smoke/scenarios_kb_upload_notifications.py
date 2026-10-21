"""KB uploads settle on the documented owner notifications."""
from pathlib import Path
import subprocess

from harness import Scenario, require


def kb_upload_notifications(ctx):
    module = Path(ctx.inst.config['replace']['kickside/kb10'])
    result = subprocess.run(
        ['make', 'test-ui', 'TEST_ARGS=src/app/useIngest.spec.ts'],
        cwd=module, capture_output=True, text=True, timeout=150,
    )
    ctx.inst.evidence.save('kb-upload-notifications', {
        'exit_code': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
    })
    require(result.returncode == 0, 'KB upload notification guard: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('kb_upload_notifications', 'regression', kb_upload_notifications)]
