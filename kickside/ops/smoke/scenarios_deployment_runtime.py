from pathlib import Path
import sys

from harness import Scenario
from module_harness import _command, _private_suite_root, run_focused_module_test


def deployment_runtime_release(ctx):
    environment = dict(ctx.inst.env)
    environment['KICKSIDE_SOURCE_ROOT'] = str(Path(ctx.inst.config['source']).resolve())
    _command(ctx.inst, 'deployment-runtime-release',
             [sys.executable, '-m', 'unittest', 'tests.test_deployment_requirements'],
             _private_suite_root(), environment, 60)


def deployment_storage_defaults(ctx):
    run_focused_module_test(ctx, 'kickside/uploads', 'uploads_indexed_parts_test')


REGISTRY = [Scenario('deployment_runtime_release', 'regression', deployment_runtime_release,
                     issues=('EE2-2598',)),
            Scenario('deployment_storage_defaults', 'regression', deployment_storage_defaults,
                     issues=('APP-STORAGE-UPDATE-DEFAULTS',))]
