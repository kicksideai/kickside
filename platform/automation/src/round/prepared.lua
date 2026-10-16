-- Replay-unsafe prepared output persisted under the round's drive fence
-- before its write. A retry under the same delivery key reuses the stored
-- output; another payload under that key is an idempotency conflict. One
-- prepared row above prepared_bytes_per_item is refused for its item.
local json = require("json")
local sql = require("sql")
local automation_db = require("automation_db")
local commit = require("round_commit")
local drive = require("drive")
local row_size = require("row_size")
local runtime_policy = require("runtime_policy")

local provenance = require("round_provenance")

local M = {}
type Map = { [string]: any }
local TABLE = "kickside_automation_prepared"
local CHUNK = 90

local function internal(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause), kind = errors.INTERNAL,
        retryable = true }) :: error)
end

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end

local function held(tx: any, d: Map): (Map?, error?)
    local current, err = commit.fence_tx(tx, tostring(d.automation_id), tostring(d.drive_key), d.fence :: Map)
    if err then return nil,err end
    if not current then return nil,(errors.new({ message = "delivery fence moved", kind = errors.CONFLICT,
        retryable = true }) :: error) end
    return current,nil
end

-- conflict(key) is the idempotency conflict of a delivery key whose stored
-- prepared output carries another payload hash.
function M.conflict(key: string): error
    return (errors.new({ message = "prepared output for " .. key .. " has another payload",
        kind = errors.CONFLICT, retryable = false, details = { reason = "idempotency_conflict" } }) :: error)
end

-- materialize_many persists prepared output in ascending key order under the
-- drive fence and the prepared-row locks, one bounded transaction per page.
function M.materialize_many(d: Map, items: { Map }): (Map?, error?)
    local p, policy_err = runtime_policy.policy()
    if policy_err or not p then return nil, policy_err end
    if type(items) ~= "table" then return nil, invalid("prepared results must be a list") end
    local owner = tostring(d.automation_id)
    local ordered: { Map } = {}
    local seen: { [string]: boolean } = {}
    local answers: Map = {}
    for _, item in ipairs(items) do
        if type(item.key) ~= "string" or item.key == "" or type(item.hash) ~= "string"
            or type(item.encoded) ~= "string" or seen[item.key] then
            return nil, invalid("prepared results require distinct keys, hashes and encoded values")
        end
        seen[item.key] = true
        if #item.encoded > p.prepared_bytes_per_item then
            answers[item.key] = { error = row_size.refusal(owner, #item.encoded, p.prepared_bytes_per_item,
                "prepared_item") }
        else
            ordered[#ordered + 1] = item
        end
    end
    table.sort(ordered, function(a: Map, b: Map): boolean return a.key < b.key end)
    if #ordered == 0 then return answers, nil end
    local _, tx_err = automation_db.in_tx(function(tx: any): (any?, error?)
        local current,fence_err = held(tx, d)
        if fence_err or not current then return nil,fence_err end
        local dbtype, type_err = tx:db_type()
        if type_err then return nil, internal("failed to resolve prepared dialect", type_err) end
        if dbtype ~= sql.type.POSTGRES and dbtype ~= sql.type.SQLITE then
            return nil, internal("unsupported prepared dialect", dbtype)
        end
        for first = 1, #ordered, CHUNK do
            local params: { any } = {}
            local values: { string } = {}
            for index = first, math.min(#ordered, first + CHUNK - 1) do
                local item = ordered[index]
                local marks: { string } = {}
                local evidence,evidence_err=provenance.encoded(current,item.key)
                if evidence_err then return nil,evidence_err end
                for _, value in ipairs({ owner, item.key, item.hash, item.encoded, drive.utc_now(), evidence }) do
                    params[#params + 1] = value
                    marks[#marks + 1] = "$" .. tostring(#params)
                end
                values[#values + 1] = "(" .. table.concat(marks, ",") .. ")"
            end
            local _, insert_err = tx:execute("INSERT INTO " .. TABLE
                .. " (automation_id,idempotency_key,payload_hash,prepared_json,created_at,execution_identity_json)"
                .. " SELECT * FROM (VALUES " .. table.concat(values, ",")
                .. ") AS input WHERE true ORDER BY 1,2 ON CONFLICT (automation_id,idempotency_key) DO NOTHING", params)
            if insert_err then return nil, internal("prepared batch insert failed", insert_err) end
        end
        for first = 1, #ordered, CHUNK do
            local params: { any } = { owner }
            local marks: { string } = {}
            for index = first, math.min(#ordered, first + CHUNK - 1) do
                params[#params + 1] = ordered[index].key
                marks[#marks + 1] = "$" .. tostring(#params)
            end
            local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
            local rows, read_err = tx:query("SELECT idempotency_key,payload_hash,prepared_json FROM " .. TABLE
                .. " WHERE automation_id=$1 AND idempotency_key IN (" .. table.concat(marks, ",") .. ")"
                .. " ORDER BY automation_id,idempotency_key" .. suffix, params)
            if read_err or type(rows) ~= "table" then
                return nil, internal("prepared batch lookup failed", read_err or TABLE)
            end
            local stored: Map = {}
            for _, row in ipairs(rows) do stored[tostring(row.idempotency_key)] = row end
            for index = first, math.min(#ordered, first + CHUNK - 1) do
                local item = ordered[index]
                local row = stored[item.key]
                if not row then return nil, internal("prepared batch row missing", item.key) end
                if row.payload_hash ~= item.hash then
                    answers[item.key] = { error = M.conflict(item.key) }
                else
                    answers[item.key] = { encoded = tostring(row.prepared_json) }
                end
            end
        end
        return true, nil
    end)
    if tx_err then return nil, tx_err end
    for key, answer in pairs(answers) do
        if answer.encoded then
            local decoded, decode_err = json.decode(tostring(answer.encoded))
            if decode_err then return nil, internal("prepared decode failed", decode_err) end
            answers[key] = { value = decoded }
        end
    end
    return answers, nil
end

return M
