"""Config-host agent selection and required destination selection regressions."""
import os
from pathlib import Path
import subprocess

from harness import Scenario, require
from module_harness import public_source_overlay, selected_module_file, selected_module_overrides


PRIVATE_CHECKS = (
    ('Makefile', '.smoke/private-frontend-tests.mk'),
    'platform/agents/ui/src/app/AgentPicker.spec.ts',
    'platform/agents/ui/src/app/AgentBlockConfig.spec.ts',
    'platform/agents/ui/src/test-setup.ts',
    'platform/agents/ui/vitest.config.ts',
    'platform/sync/ui/src/app/syncCreate.picker.spec.ts',
    'platform/sync/ui/src/test-setup.ts',
    'platform/sync/ui/vitest.config.ts',
)

# The staged specs import these files relative to their own path.  Check their
# overlay copies against the immutable product source before invoking Vitest.
PUBLIC_COMPONENTS = (
    'platform/agents/ui/src/agent_picker.ts',
    'platform/agents/ui/src/app/AgentBlockConfig.vue',
    'platform/sync/ui/src/app/SyncCreate.vue',
)

PUBLIC_MODULES = (
    ('platform/agents', 'kickside/agents'),
    ('platform/sync', 'kickside/sync'),
)


def picker_config(ctx):
    source = Path(ctx.inst.config['source']).resolve()
    environment = {**ctx.inst.env, 'PATH': str(Path(ctx.inst.config['binary']).parent) + os.pathsep + os.environ['PATH']}
    overrides = selected_module_overrides(ctx, PUBLIC_MODULES)
    with public_source_overlay(ctx, PRIVATE_CHECKS, module_overrides=overrides) as root:
        for relative in PUBLIC_COMPONENTS:
            public = selected_module_file(source, overrides, relative)
            exercised = root / relative
            require(public.is_file() and exercised.is_file() and public.read_bytes() == exercised.read_bytes(),
                    'Picker configuration guard must exercise the selected public component: ' + relative)
        shared = ['make', '-f', '.smoke/private-frontend-tests.mk', 'typecheck-shared']
        result = subprocess.run(shared, cwd=root, env=environment, capture_output=True, text=True, timeout=900)
        ctx.inst.evidence.save('picker-config-shared-setup', {
            'command': shared, 'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
        })
        require(result.returncode == 0, 'Picker configuration shared setup fails: ' + result.stdout + result.stderr)
        for module, specs in (
            ('agents', 'src/app/AgentPicker.spec.ts src/app/AgentBlockConfig.spec.ts'),
            ('sync', 'src/app/syncCreate.picker.spec.ts'),
        ):
            command = ['make', '-f', '.smoke/private-frontend-tests.mk', 'test', 'MOD=' + module,
                       'FE_TEST_COMMAND=./node_modules/.bin/vitest run',
                       'TEST_ARGS=' + specs + ' --maxWorkers=2']
            result = subprocess.run(command, cwd=root, env=environment, capture_output=True, text=True, timeout=900)
            ctx.inst.evidence.save('picker-config-' + module, {
                'command': command, 'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
            })
            require(result.returncode == 0, 'Picker configuration guards fail: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('agent_picker_config_host', 'regression', picker_config,
                     issues=('AGENT-PICKER-CONFIG-HOST', 'SYNC-REQUIRED-DESTINATION-PICKER'))]
