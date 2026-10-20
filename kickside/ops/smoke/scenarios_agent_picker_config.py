"""Config-host agent selection and required destination selection regressions."""
import os
from pathlib import Path
import subprocess

from harness import Scenario, require


def picker_config(ctx):
    root = Path(ctx.inst.config['replace']['kickside/agents']).parents[1]
    environment = {**ctx.inst.env, 'PATH': str(Path(ctx.inst.config['binary']).parent) + os.pathsep + os.environ['PATH']}
    for module, specs in (
        ('agents', 'src/app/AgentPicker.spec.ts src/app/AgentBlockConfig.spec.ts'),
        ('sync', 'src/app/syncCreate.picker.spec.ts'),
    ):
        command = ['make', 'test', 'MOD=' + module, 'TEST_ARGS=' + specs + ' --maxWorkers=2']
        result = subprocess.run(command, cwd=root, env=environment, capture_output=True, text=True, timeout=900)
        ctx.inst.evidence.save('picker-config-' + module, {
            'command': command, 'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
        })
        require(result.returncode == 0, 'Picker configuration guards fail: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('agent_picker_config_host', 'regression', picker_config,
                     issues=('AGENT-PICKER-CONFIG-HOST', 'SYNC-REQUIRED-DESTINATION-PICKER'))]
