"""Upload owner teardown satisfies the idempotent deletable contract."""
from harness import Scenario
from module_harness import run_focused_module_test


def owner_delete(ctx):
    run_focused_module_test(ctx, 'kickside/uploads', 'upload_record_repo_test')
    run_focused_module_test(ctx, 'kickside/uploads', 'upload_component_delete_test')


REGISTRY = [Scenario('uploads_component_delete', 'regression', owner_delete,
                     issues=('UPLOAD-OWNER-DELETE-IDEMPOTENCE',))]
