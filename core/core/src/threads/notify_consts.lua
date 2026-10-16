-- Thread-update notification constants: the pub/sub vocabulary the SPA subscribes
-- to and the per-user hub naming convention. Owned by the thread slice, not in a
-- shared config entry, since only thread/projection updates emit on these topics.
-- All are invariants (not env-tunable): changing one means changing the matching
-- client subscription.
--
-- Topic taxonomy (all under the kickside.* namespace):
--   kickside.thread.update                       default per-update topic
--   kickside.threads                             overview firehose (list views)
--   kickside.thread.<thread_id>                  one thread's stream
--   kickside.thread.<thread_id>.projection.<kind>  one thread's read-model stream

local M = {}

-- Per-user hub process name prefix. process.registry.lookup(USER_HUB_PREFIX ..
-- user_id) resolves the live hub a message is delivered to. This is hub routing,
-- not a topic.
M.USER_HUB_PREFIX = "user."

-- Topic a single thread's update lands on when the caller names none.
M.DEFAULT_TOPIC = "kickside.thread.update"

-- Global firehose: every thread update, for overview/list views.
M.OVERVIEW_TOPIC = "kickside.threads"

-- Prefix for the per-thread topic. The full name is THREAD_TOPIC_PREFIX ..
-- thread_id, letting a client watch one thread alone.
M.THREAD_TOPIC_PREFIX = "kickside.thread."

-- Infix marking the per-thread projection (read-model) topic. The full name is
-- THREAD_TOPIC_PREFIX .. thread_id .. PROJECTION_TOPIC_INFIX .. kind, letting a
-- client watch one read model of one thread.
M.PROJECTION_TOPIC_INFIX = ".projection."

-- Default event_type stamped on the fan-out message when the caller names none.
M.DEFAULT_EVENT_TYPE = "kickside.threads:thread.updated"

-- Payload envelope type discriminator: a raw thread event vs a projection
-- (read-model) advance. Stamped on every fan-out message.
M.PAYLOAD_TYPE = {
    EVENT = "event",
    PROJECTION = "projection",
}

return M
