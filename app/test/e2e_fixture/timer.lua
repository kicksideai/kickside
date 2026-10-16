local logger = require("logger")
local security = require("security")
local M = {}
function M.install(input: any): (any, nil)
    local interval = type(input) == "table" and input.interval or "2s"
    return { source = { source_kind = "timer", schedule = { type = "interval", expression = interval } },
        state = { fixture = true }, metadata = { title = "E2E Timer" } }, nil
end
function M.deliver(request: any): (any, nil)
    local delivered = {}
    for _, item in ipairs(request.items) do
        local actor = security.actor()
        logger:named("app.test.e2e.timer"):info("timer ping", {
            occurrence_key = item.dedup_key, fired_at = item.payload.fired_at,
            actor_id = actor and actor:id() or nil,
        })
        delivered[#delivered + 1] = { key = item.delivery_key }
    end
    return { delivered_items = delivered }, nil
end
return M
