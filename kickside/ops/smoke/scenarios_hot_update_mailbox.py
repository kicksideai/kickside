"""Native message continuity across process code replacement."""
from pathlib import Path
import shutil
import uuid

from harness import Scenario
from module_harness import run_focused_app_test

HERE = Path(__file__).resolve().parent

def native_mailbox_continuity(ctx):
    root = ctx.inst.root / ('hot-update-mailbox-' + uuid.uuid4().hex[:10])
    shutil.copytree(HERE / 'mocks' / 'hot_update_mailbox', root)
    run_focused_app_test(ctx, root, 'mailbox_test', timeout=300)

REGISTRY = [Scenario(
    'hot_update_runtime_mailbox_continuity', 'regression', native_mailbox_continuity,
    issues=('HOT-UPDATE-RUNTIME-MAILBOX-CONTINUITY', 'SMOKE-FOCUSED-EMPTY-ENGINE-PROFILE'),
)]
