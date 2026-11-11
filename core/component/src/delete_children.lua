-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local time = require("time")
local reader = require("component_reader")
local component_types = require("component_types")
local context_policy = require("context_policy")
local envelope = require("envelope")
local jobs = require("jobs")

local M = {}
local MAX_DESCENDANTS = 1000

-- Placement is distinct from lifecycle ownership. Preflight the complete tree,
-- including children hidden from the caller, before committing any delete intent.
function M.run(parent_id: string): (boolean?, error?)
    local deadline = time.now():add("30s")
    local removed = 0
    local visible: {[string]: boolean} = {}
    local function blocked(id: string?, cause: any, hidden_message: string?): error
        local details: any = {deleted_count = removed}
        local message = hidden_message or "a component under this knowledge base cannot be deleted"
        if id and visible[id] then
            message = "cannot delete child component " .. id .. ": " .. tostring(cause)
            details.component_id = id
        elseif not id then message = tostring(cause) end
        return errors.new({kind = errors.CONFLICT,
            message = message .. "; " .. removed .. " child components removed", details = details})
    end
    local function budget(id: string?): error?
        if not time.now():before(deadline) then
            return blocked(id, "dependent deletion exceeds the 30-second request limit; delete in parts",
                "dependent deletion exceeds the 30-second request limit; delete in parts")
        end
        return nil
    end
    local expired = budget(nil)
    if expired then return nil, expired end
    local _, access_err = context_policy.validate_access(parent_id, component_types.ACCESS.DELETE)
    if access_err then return nil, access_err end
    local actor, _, identity_err = context_policy.current_runtime_identity()
    if identity_err then return nil, identity_err end
    local user_id = (actor :: any):id()
    local order: {string} = {parent_id}
    local index = 1
    -- Parents precede descendants in this worklist; reverse order deletes every
    -- descendant before its parent without consuming the Lua call stack.
    while index <= #order do
        local id, offset = order[index], 0
        while true do
            expired = budget(id)
            if expired then return nil, expired end
            local page_size = math.min(100, MAX_DESCENDANTS + 2 - #order)
            local children, read_err = reader.new():with_parent(id):include_options({meta = false})
                :order_by("component_id", "ASC"):limit(page_size, offset):all()
            if read_err then return nil, blocked(id, read_err) end
            for _, child in ipairs(children or {}) do
                if #order > MAX_DESCENDANTS then
                    return nil, blocked(nil, "knowledge base has more than 1000 descendants; delete in parts")
                end
                local cid = child.component_id
                expired = budget(cid)
                if expired then return nil, expired end
                local permitted, permission_err = reader.new():with_components(cid):with_user(user_id)
                    :with_access_mask(component_types.ACCESS.DELETE):include_options({meta = false, access_level = true}):one()
                if permission_err or not permitted then
                    expired = budget(cid)
                    if expired then return nil, expired end
                    local readable, visibility_err = reader.new():with_components(cid):with_user(user_id)
                        :with_access_mask(component_types.ACCESS.READ):include_options({meta = false}):one()
                    visible[cid] = readable ~= nil and visibility_err == nil
                    return nil, blocked(cid, permission_err or visibility_err or "DELETE access is required",
                        "a component under this knowledge base cannot be deleted by you")
                end
                visible[cid] = (assert(tonumber(permitted.access_level)) & component_types.ACCESS.READ) ~= 0
                order[#order + 1] = cid
            end
            if #children < page_size then break end
            offset = offset + #children
        end
        index = index + 1
    end
    if #order == 1 then return true, nil end
    expired = budget(nil)
    if expired then return nil, expired end
    local svc, service_err = context_policy.get_component_service()
    if service_err then return nil, service_err end
    for position = #order, 2, -1 do
        local id = order[position]
        expired = budget(id)
        if expired then return nil, expired end
        local result, delete_err = (svc :: any):delete({component_id = id})
        local result_err = delete_err or envelope.error_of(result, "delete child")
        if result_err then return nil, blocked(id, result_err) end
        -- Normal deletion owns teardown and its lease. Observe its result rather
        -- than invoking the provider or deletion worker from this request frame.
        while true do
            expired = budget(id)
            if expired then return nil, expired end
            local row, read_err = reader.new():with_components(id):include_options({meta = false}):one()
            if read_err then return nil, blocked(id, read_err) end
            if not row then removed = removed + 1; break end
            expired = budget(id)
            if expired then return nil, expired end
            local job, job_err = jobs.get_job(result.job_id)
            if job_err then return nil, blocked(id, job_err) end
            if not job then return nil, blocked(id, "deletion job is absent") end
            if job.status == "dead" or job.status == "cancelled" then
                return nil, blocked(id, job.last_error or job.status)
            end
            time.sleep("10ms")
        end
    end
    return true, nil
end

return M
