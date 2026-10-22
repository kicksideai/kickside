"""Keep the store lifecycle output discoverable to knowledge callers."""
from harness import Scenario
from module_harness import run_focused_module_test


def knowledge_store_schema(ctx):
    run_focused_module_test(ctx, 'kickside/knowledge', 'contract_surface_test')


REGISTRY = [Scenario('knowledge_store_schema', 'regression', knowledge_store_schema,
                     issues=('KNOWLEDGE-STORE-OUTPUT-SCHEMA',))]
