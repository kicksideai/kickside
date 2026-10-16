"""Knowledge Ask capability in source and served UI bundles."""
from pathlib import Path
import subprocess

from harness import Scenario, require


def knowledge_ask_capability(ctx):
    source = ctx.inst.config['replace'].get('kickside/kb10')
    require(source, 'Knowledge Ask guard requires a local kickside/kb10 replacement')
    result = subprocess.run(['make', 'test-ui', 'UI_TEST_ARGS=src/app/shared/KbSearch.spec.ts'],
                            cwd=Path(source), capture_output=True, text=True, timeout=120)
    ctx.inst.evidence.save('knowledge-ask-capability', {
        'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
    })
    require(result.returncode == 0, 'Knowledge Ask capability regression: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('knowledge_ask_capability', 'regression', knowledge_ask_capability,
                     issues=('EE2-2636', 'RELEASE-UI-SERVED-BUNDLE-RESOLUTION'))]
