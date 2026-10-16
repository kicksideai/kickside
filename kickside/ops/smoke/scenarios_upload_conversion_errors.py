"""Upload conversion failures retain diagnostics and publish failed status."""
from harness import Scenario
from module_harness import run_focused_module_test


def upload_conversion_errors(ctx):
    run_focused_module_test(ctx, 'kickside/uploads', 'uploads_durable_failures_test')


REGISTRY = [Scenario('upload_conversion_errors', 'regression', upload_conversion_errors,
                     issues=('EE2-2635',))]
