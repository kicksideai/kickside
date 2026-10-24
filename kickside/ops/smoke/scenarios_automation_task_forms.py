# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Task setup uses operator controls and the declared automation view contract."""
import json
from pathlib import Path
import subprocess

from harness import Scenario, require
from module_harness import public_source_overlay, selected_module_file, selected_module_overrides


PUBLIC_COMPONENTS = {
    'automation': (
        'platform/automation/ui/src/app/TaskCreate.vue',
        'platform/automation/ui/src/trigger-config/app/TriggerConfig.vue',
        'platform/automation/ui/src/app/automations.vue',
    ),
    'workflows': (
        'platform/workflows/ui/src/app/embed/WorkflowPicker.vue',
        'platform/workflows/ui/src/app/embed/EmbedWorkflow.vue',
        'platform/workflows/ui/src/app/api/api.ts',
    ),
    'settings': (
        'platform/settings/ui/src/app/SettingsForm.vue',
    ),
    'hub': (
        'platform/hub/ui/src/app/modules.vue',
        'platform/hub/ui/src/app/InstallDialog.vue',
    ),
    'widgets': (
        'platform/widgets/ui/src/model-picker/app/ModelPicker.vue',
        'platform/widgets/ui/src/component-picker/app/ComponentPicker.vue',
    ),
    'webhooks': (
        'platform/webhooks/ui/src/api.ts',
    ),
}


AUTOMATION_TEST_TOOLING = ('js-yaml', 'ajv')
PRIVATE_FRONTEND_TEST_TOOLING_LOCK = (
    Path(__file__).resolve().parent / 'mocks/frontend-test-tools/package-lock.json'
)


def pinned_test_packages(lockfile, packages=AUTOMATION_TEST_TOOLING):
    """Return exact test-only package arguments from a private npm lockfile."""
    lockfile = Path(lockfile)
    require(lockfile.is_file(), 'Frontend test tooling lockfile is absent: ' + str(lockfile))
    try:
        locked = json.loads(lockfile.read_text()).get('packages', {})
    except (OSError, json.JSONDecodeError) as error:
        require(False, 'Cannot read frontend test tooling lockfile: ' + str(lockfile) + ': ' + str(error))
    selected = []
    for package in packages:
        version = locked.get('node_modules/' + package, {}).get('version')
        require(isinstance(version, str) and version and not any(character.isspace() for character in version),
                'Frontend test tooling lockfile must pin ' + package + ': ' + str(lockfile))
        selected.append(package + '@' + version)
    return ' '.join(selected)


def frontend_specs(ctx, module, files, label):
    source = Path(ctx.inst.config['source']).resolve()
    module_path = 'platform/' + module
    overrides = selected_module_overrides(ctx, ((module_path, 'kickside/' + module),))
    private_checks = (
        ('Makefile', '.smoke/private-frontend-tests.mk'),
        module_path + '/ui/vitest.config.ts',
        module_path + '/ui/src/test-setup.ts',
        *(('platform/hub/ui/vitest.setup.ts',) if module == 'hub' else ()),
        *(module_path + '/ui/' + path for path in files),
    )
    with public_source_overlay(ctx, private_checks, module_overrides=overrides) as root:
        for relative in PUBLIC_COMPONENTS[module]:
            selected = selected_module_file(source, overrides, relative)
            exercised = root / relative
            require(selected.is_file() and exercised.is_file() and selected.read_bytes() == exercised.read_bytes(),
                    module + ' frontend guard must exercise the selected public component: ' + relative)
        shared = ['make', '-f', '.smoke/private-frontend-tests.mk', 'typecheck-shared']
        result = subprocess.run(shared, cwd=root, env=ctx.inst.env, capture_output=True, text=True, timeout=900)
        ctx.inst.evidence.save(label + '-shared-setup', {
            'command': shared, 'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
        })
        require(result.returncode == 0, module + ' frontend shared setup fails: ' + result.stdout + result.stderr)
        test_packages = ''
        if module == 'automation':
            test_packages = pinned_test_packages(PRIVATE_FRONTEND_TEST_TOOLING_LOCK)
        command = ['make', '-f', '.smoke/private-frontend-tests.mk', 'test', 'MOD=' + module,
                   'FE_TEST_COMMAND=./node_modules/.bin/vitest run',
                   'FE_TEST_PACKAGES=' + test_packages,
                   'TEST_ARGS=' + ' '.join(files) + ' --maxWorkers=2']
        result = subprocess.run(command, cwd=root, env=ctx.inst.env, capture_output=True, text=True, timeout=900)
        ctx.inst.evidence.save(label, {
            'command': command, 'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
        })
        require(result.returncode == 0, module + ' frontend guards fail: ' + result.stdout + result.stderr)
        return result


def task_forms(ctx):
    frontend_specs(ctx, 'automation', (
        'src/app/TaskCreate.spec.ts', 'src/trigger-config/schedule.spec.ts',
        'src/trigger-config/app/triggerConfig.interactions.spec.ts',
    ), 'automation-task-forms')


def scheduled_drive_status(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/automation', 'round_test')
    frontend_specs(ctx, 'automation', (
        'src/app/automations.drive-status.spec.ts', 'src/app/automations.realtime-drive.spec.ts',
    ), 'automation-scheduled-drive-status')


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
                     issues=('WORKFLOWS-PUBLISHED-PICKER-CONFIG-HOST',)),
            Scenario('automation_scheduled_drive_status', 'regression', scheduled_drive_status,
                     issues=('AUTOMATION-SCHEDULED-DRIVE-STATUS',))]
