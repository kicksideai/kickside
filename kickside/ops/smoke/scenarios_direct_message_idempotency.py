"""Retried deliveries never post twice: every attempt of one direct message
delivery carries the same provider delivery key (Discord's enforced nonce), and
an at-most-once automation item whose write call fails after its send stays
uncertain instead of being resent."""
from harness import Scenario
from module_harness import run_focused_module_test


def channel(ctx):
    run_focused_module_test(ctx, "kickside/channel", "channel_sink_test")


def discord(ctx):
    run_focused_module_test(ctx, "kickside/discord", "message_sink_test")


def automation_lost_write_answer(ctx):
    run_focused_module_test(ctx, "kickside/automation", "round_sink_slots_test")
    run_focused_module_test(ctx, "kickside/automation", "round_write_test")


REGISTRY = [
    Scenario("channel_direct_message_idempotency", "regression", channel,
             issues=("CHANNEL-DIRECT-MESSAGE-IDEMPOTENCY",)),
    Scenario("discord_direct_message_idempotency", "regression", discord,
             issues=("DISCORD-DIRECT-MESSAGE-IDEMPOTENCY",)),
    Scenario("automation_at_most_once_lost_write_answer", "regression", automation_lost_write_answer,
             issues=("AUTOMATION-AT-MOST-ONCE-LOST-WRITE-ANSWER",)),
]
