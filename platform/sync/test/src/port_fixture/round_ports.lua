-- Round consumer fixture ports. write records each request in
-- sync_round_writes and answers a delete as deleted, else by the input's
-- directive: capacity (a capacity wait), timeout (an ambiguous failure),
-- invalid (a deterministic failure), flaky (a retriable failure on an
-- identity's first write), slots (destination slots a and b); a write to a
-- named slot answers that slot; anything else answers one destination ref.
-- transform is a func transform recording each call.

local sql = require("sql")
local json = require("json")

type Map = { [string]: any }

local function record(kind: string, key: string, detail: any): integer
    local db, err = sql.get("app:db")
    if err or not db then error("round fixture db: " .. tostring(err)) end
    local encoded = json.encode(detail)
    local _, insert_err = db:execute("INSERT INTO sync_round_writes (kind, record_key, detail_json) VALUES ($1, $2, $3)",
        { kind, key, encoded })
    if insert_err then db:release(); error("round fixture log: " .. tostring(insert_err)) end
    local rows, read_err = db:query("SELECT COUNT(*) AS n FROM sync_round_writes WHERE kind = $1 AND record_key = $2", { kind, key })
    db:release()
    if read_err or not rows or not rows[1] then error("round fixture count: " .. tostring(read_err)) end
    local count = tonumber(rows[1].n)
    if count == nil then error("round fixture count is not numeric") end
    return math.floor(count)
end

local function write(request: any): (any, any)
    local r = type(request) == "table" and (request :: Map) or {}
    local input = type(r.input) == "table" and (r.input :: Map) or {}
    local writes = record("write", tostring(r.identity_key), {
        sink_op = r.sink_op, input = input, identity_key = r.identity_key, idempotency_key = r.idempotency_key,
        map_slot = r.map_slot, dest_ref = r.dest_ref, origin = r.origin,
    })
    if r.sink_op == "delete" then return { success = true, result = "deleted" }, nil end
    local what = tostring(input.directive or "")
    if what == "capacity" then
        return { success = false, error = { code = "rate_limited", scope = "capacity", retry_after_ms = 30000, retriable = true, message = "busy" } }, nil
    elseif what == "timeout" then
        return { success = false, error = { code = "provider_unavailable", retriable = true, message = "timed out" } }, nil
    elseif what == "invalid" then
        return { success = false, error = { code = "invalid_request", retriable = false, message = "bad record" } }, nil
    elseif what == "permission" then
        return { success = false, error = { code = "permission_denied", retriable = false, message = "sink grant revoked" } }, nil
    elseif what == "flaky" and writes == 1 then
        return { success = false, error = { code = "provider_unavailable", retriable = true, message = "first write fails" } }, nil
    end
    local id = "rec:" .. tostring(r.identity_key)
    if type(r.map_slot) == "string" and r.map_slot ~= "" then
        return { success = true, dest_refs = { [r.map_slot] = { dest_ref = { id = id .. ":" .. r.map_slot }, dest_version = "v2" } } }, nil
    end
    if what == "slots" then
        return { success = true, dest_refs = { a = { dest_ref = { id = id .. ":a" }, dest_version = "v1" },
            b = { dest_ref = { id = id .. ":b" }, dest_version = "v1" } } }, nil
    end
    return { success = true, dest_ref = { id = id }, dest_version = "v1" }, nil
end

local function transform(args: any): (any, any)
    local a = type(args) == "table" and (args :: Map) or {}
    local item = type(a.item) == "table" and (a.item :: Map) or {}
    local input = type(item.input) == "table" and (item.input :: Map) or {}
    record("transform", tostring(item.item_key), { item_key = item.item_key })
    if input.revoke_resource then
        local db, db_err = sql.get("app:db")
        if db_err or not db then return nil, db_err end
        local _, revoke_err = db:execute("DELETE FROM kickside_component_access WHERE component_id=$1 AND subject_type='user' AND subject_id=$2",
            { input.revoke_resource, input.revoke_principal })
        db:release()
        if revoke_err then return nil, revoke_err end
    end
    if input.directive == "transform_error" then
        return nil, errors.new({kind=errors.UNAVAILABLE,retryable=true,message="fixture transform unavailable"})
    end
    if input.directive == "none" then return nil, nil end
    if input.directive == "skip" then return { present = false, skip = "no matching record" }, nil end
    return { directive = input.directive, title = "transformed " .. tostring(item.item_key) }, nil
end

return { write = write, transform = transform }
