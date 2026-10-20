# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Task setup uses operator controls and the declared automation view contract."""
from pathlib import Path
import subprocess

from harness import Scenario, require


def frontend_specs(ctx, module, files, label):
    root = Path(ctx.inst.config['replace']['kickside/' + module]).parents[1]
    command = ['make', 'test', 'MOD=' + module,
               'TEST_ARGS=' + ' '.join(files) + ' --maxWorkers=2']
    result = subprocess.run(command, cwd=root, env=ctx.inst.env,
                            capture_output=True, text=True, timeout=900)
    ctx.inst.evidence.save(label, {
        'command': command, 'code': result.returncode,
        'output': result.stdout, 'error': result.stderr,
    })
    require(result.returncode == 0, module + ' frontend guards fail: ' + result.stdout + result.stderr)


def task_forms(ctx):
    frontend_specs(ctx, 'automation', (
        'src/app/TaskCreate.spec.ts', 'src/trigger-config/schedule.spec.ts',
        'src/trigger-config/app/triggerConfig.interactions.spec.ts',
    ), 'automation-task-forms')


def workflow_picker(ctx):
    frontend_specs(ctx, 'workflows', (
        'src/app/embed/WorkflowPicker.test.ts', 'src/app/embed/embed-workflow.test.ts',
    ), 'workflows-published-picker')


REGISTRY = [Scenario('automation_task_create_forms', 'regression', task_forms,
                     issues=('AUTOMATION-TASK-CREATE-FORMS',
                             'AUTOMATION-RECURRING-CADENCE-VOCABULARY',
                             'AUTOMATION-TASK-CADENCE-DEFAULT-SCOPE',
                             'AUTOMATION-WORKFLOW-TARGET-SELECTION-STATE',)),
            Scenario('workflows_published_picker_config_host', 'regression', workflow_picker,
                     issues=('WORKFLOWS-PUBLISHED-PICKER-CONFIG-HOST',))]
