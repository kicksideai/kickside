"""Iteration inputs retain joins and scalar types without intermediate steps."""
from harness import Scenario
from module_harness import run_focused_module_test


def workflow_iteration_join(ctx):
    run_focused_module_test(ctx, 'kickside/workflows', 'tsplit_compile_test_node_materialization_1')
    run_focused_module_test(ctx, 'kickside/workflows',
                            'tsplit_engine_execution_test_workflow_compiler_live_dataflow_execution__3')


REGISTRY = [Scenario('workflow_iteration_join', 'regression', workflow_iteration_join,
                     ('boot',), instance_setup=True,
                     issues=('WORKFLOW-DIRECT-ITERATION-JOIN',
                             'DATAFLOW-SCALAR-ITERATION-ITEM-TYPE',
                             'DATAFLOW-SOURCE-TEST-HARNESS-IMPORT'))]
