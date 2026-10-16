local storage = require("store")
local security = require("security")
local time = require("time")
local function record(request, operation)
    local records, err = storage.get("app:invalidation_records")
    if err then return {success = false, error = tostring(err)} end
    local record_delay = records:get("record_delay")
    if record_delay then time.sleep(record_delay) end
    local calls = records:get("calls") or {}
    local scope = security.named_scope(request.group_ids[1])
    local decision = scope and scope:evaluate(security.new_actor("probe", {}), "access", "app:module.endpoint") or "undefined"
    calls[#calls + 1] = {operation = operation, groups = request.group_ids, decision = decision, allow_only = request.allow_only,
        preserve_sessions = request.preserve_sessions, previous_group_rules = request.previous_group_rules}
    records:set("calls", calls)
    local fail_at = records:get("fail_at")
    local delay = records:get("delay")
    records:release()
    if delay then time.sleep(delay) end
    if fail_at == #calls then return {success = false, error = "invalidation unavailable"} end
    return {success = true}
end
return {
    run = function(request) return record(request, "session_revocation") end,
    fence = function(request) return record(request, "delegation_fencing") end,
}
