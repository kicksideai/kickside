"""Direct message deliveries replay the recorded effect and reject key conflicts."""
from harness import Scenario
from module_harness import run_focused_module_test


def channel(ctx):
    run_focused_module_test(ctx, "kickside/channel", "channel_sink_test")


def discord(ctx):
    run_focused_module_test(ctx, "kickside/discord", "message_sink_test")


REGISTRY = [
    Scenario("channel_direct_message_idempotency", "regression", channel,
             issues=("CHANNEL-DIRECT-MESSAGE-IDEMPOTENCY",)),
    Scenario("discord_direct_message_idempotency", "regression", discord,
             issues=("DISCORD-DIRECT-MESSAGE-IDEMPOTENCY",)),
]
