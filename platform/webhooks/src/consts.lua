local M = {}

M.TABLES = {
    WEBHOOKS = "kickside_webhooks",
}

-- Secret: a CSPRNG body behind a stable prefix. Hashed at rest (sha256), the raw
-- value returned once at mint. The prefix is kept for display in listings.
M.SECRET = {
    PREFIX = "kshook_",
    RANDOM_LEN = 48,
    PREFIX_DISPLAY_LEN = 15, -- "kshook_" (7) + 8 chars
}

M.STATUS = {
    ACTIVE = "active",
    REVOKED = "revoked",
}

-- The webhook is a thread-backed component of this class, so it surfaces in the
-- data-flow source catalog (wc-component-picker filters by it) and is drained by the
-- poller's trigger projection exactly like a channel conversation.
M.THREAD_CLASS = "kickside.webhooks"

-- The inbound event type the public endpoint appends and the trigger source declares.
M.EVENT = {
    INBOUND = "kickside.webhooks.events:webhook.inbound",
}

-- The secret may arrive as a bearer Authorization header or this dedicated header.
M.SECRET_HEADER = "X-Webhook-Secret"

-- Natural key for a webhook's thread.
function M.external_ref(webhook_id: string): string
    return "webhook:" .. webhook_id
end

return M
