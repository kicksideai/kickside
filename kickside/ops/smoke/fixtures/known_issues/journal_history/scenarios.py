"""Known failing skipped-history replay probe."""
from harness import Scenario
from module_harness import run_focused_module_test


def journal_history(ctx):
    run_focused_module_test(ctx, 'chestor/journal', 'journal_history_replay_test')


REGISTRY = [
    Scenario('journal_skipped_history_replay', 'regression', journal_history,
             issues=('JOURNAL-SKIPPED-HISTORY-REPLAY',)),
]
