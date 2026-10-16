"""Native cancellation classification used by the Jobs pool drain."""
from harness import Scenario
from module_harness import run_focused_module_test


def native_cancel_contract(ctx):
    run_focused_module_test(ctx, 'kickside/jobs', 'native_cancel_contract_test')


REGISTRY = [Scenario('jobs_native_cancel_contract', 'regression', native_cancel_contract,
    issues=('JOBS-POOL-CANCEL-NOT-FOUND',))]
