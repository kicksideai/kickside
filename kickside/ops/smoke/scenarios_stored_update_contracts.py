"""Stored delivery history and published Research inputs survive updates."""
from harness import Scenario
from module_harness import run_focused_module_test


def record_delete_replay(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'delete_replay_migration_test')


def research_topic(ctx):
    run_focused_module_test(ctx, 'kickside/research', 'structured_report_test')


REGISTRY = [
    Scenario('update_record_delete_replay', 'regression', record_delete_replay,
             issues=('UPDATE-SYNC-RECORD-DELETE-REPLAY',)),
    Scenario('research_topic_tool_schema', 'regression', research_topic,
             issues=('RESEARCH-TOPIC-TOOL-SCHEMA',)),
]
