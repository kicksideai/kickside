-- A committed deleting_at mark is the durable continuation for a component
-- whose kind cleanup stopped between pages or whose caller crashed. The core
-- retention service retries one bounded page after an eligibility change.
local sql = require("sql")
local component_types = require("component_types")
local component = require("component")
local teardown = require("teardown")
local error_envelope = require("error_envelope")

local M = {}

local function response_error(field: string): error
    return errors.new({message = "component cleanup response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "component_cleanup_response", field = field}})
end

function M.run(limit: integer, owner_id: string?): (integer?, error?, boolean?, table[]?)
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 50 then
        return nil, (errors.new({ message = "component cleanup limit must be in [1,50]",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    local db, open_err = sql.get(component_types.db_id())
    if open_err then return nil, errors.wrap(open_err, "component cleanup database unavailable") end
    if type(db) ~= "table" and type(db) ~= "userdata" then return nil, response_error("database") end
    -- A released owner must not sit behind another page of live leases. The
    -- delete mark is the authority; unrelated owner ids are harmless misses.
    local query = "SELECT component_id FROM kickside_components WHERE deleting_at IS NOT NULL"
    local params: { any } = { limit }
    local limit_sql = "$1"
    if owner_id ~= nil then
        query = query .. " AND CAST(component_id AS TEXT)=$1"
        params = { owner_id, limit }
        limit_sql = "$2"
    end
    local rows, read_err = db:query(query .. " ORDER BY deleting_at,component_id LIMIT " .. limit_sql, params)
    read_err = error_envelope.cleanup(function(): (any, error?) return db:release() end, read_err, "release component cleanup database")
    if read_err then return nil, errors.wrap(read_err, "component cleanup scan failed") end
    if type(rows) ~= "table" then return nil, response_error("rows") end
    local removed = 0
    local first_error: error? = nil
    local needs_continue = false
    local blocked: table[] = {}
    for _, row in ipairs(rows) do
        if type(row) ~= "table" or type(row.component_id) ~= "string" or row.component_id == "" then
            return nil, response_error("rows.component_id")
        end
        -- The original request already passed the child-policy gate before it
        -- committed deleting_at. Reparenting is inert when there are no children.
        local ok, err = component.system_delete(row.component_id, "reparent_root")
        local pending, continuation = teardown.cleanup_pending(err)
        if err == nil and ok == true then removed = removed + 1
        elseif pending then
            if ok then removed = removed + 1 end
            if continuation then
                needs_continue = true
            else
                blocked[#blocked + 1] = { component_id = row.component_id, error = err }
            end
        elseif first_error == nil then
            first_error = err and errors.wrap(err, "component cleanup retry failed") or response_error("delete")
        end
    end
    if first_error then return nil, first_error end
    return removed, nil, needs_continue or (owner_id == nil and #rows == limit and removed > 0), blocked
end

return M
