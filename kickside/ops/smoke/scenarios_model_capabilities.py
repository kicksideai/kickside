# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""First-party model inference, stored metadata upgrades, and picker choices."""
import os
from pathlib import Path
import subprocess

from harness import Scenario, require
from module_harness import run_focused_module_test


def discovery_capabilities(ctx):
    run_focused_module_test(ctx, 'kickside/models', 'openai_capabilities_test')
    run_focused_module_test(ctx, 'kickside/models', 'discovery_metadata_migration_test')


def picker_capabilities(ctx):
    root = Path(ctx.inst.config['replace']['kickside/widgets']).parents[1]
    environment = {**ctx.inst.env, 'PATH': str(Path(ctx.inst.config['binary']).parent) + os.pathsep + os.environ['PATH']}
    command = ['make', 'test', 'MOD=widgets',
               'TEST_ARGS=src/model-picker/app/model-picker-capabilities.spec.ts --maxWorkers=2']
    result = subprocess.run(command, cwd=root, env=environment, capture_output=True, text=True, timeout=900)
    ctx.inst.evidence.save('model-picker-capabilities', {
        'command': command, 'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
    })
    require(result.returncode == 0, 'Model picker capability guard fails: ' + result.stdout + result.stderr)


REGISTRY = [
    Scenario('models_discovery_capabilities', 'regression', discovery_capabilities,
             issues=('MODELS-REASONING-GENERATIONS', 'MODELS-GENERATION-CAPABILITIES')),
    Scenario('model_picker_class_capabilities', 'regression', picker_capabilities,
             issues=('WIDGETS-CLASS-CAPABILITY',)),
]
