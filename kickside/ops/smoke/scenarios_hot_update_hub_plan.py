"""Published module updates preserve existing installation requirement bindings."""
from harness import Scenario
from module_lifecycle_contract import published_fixture, install_latest


def published_upload_plan(ctx):
    with published_fixture(ctx, 'kickside/uploads') as fixture:
        install_latest(fixture.inst, module='kickside/uploads')


def published_workflow_plan(ctx):
    with published_fixture(ctx, 'kickside/workflows') as fixture:
        install_latest(fixture.inst, module='kickside/workflows')


REGISTRY = [
    Scenario('hot_update_published_upload_plan', 'regression', published_upload_plan, ('boot',),
             issues=('HOT-UPDATE-HUB-PLAN-REQUIREMENTS',), instance_setup=True),
    Scenario('hot_update_published_workflow_plan', 'regression', published_workflow_plan, ('boot',),
             issues=('HOT-UPDATE-HUB-PLAN-REQUIREMENTS',), instance_setup=True),
]
