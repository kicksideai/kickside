-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local time = require("time")
local reader = require("component_reader")
local component_types = require("component_types")
local context_policy = require("context_policy")
local envelope = require("envelope")
local jobs = require("jobs")

local M = {}

local function blocked(id: string, cause: any): error
    return errors.new({kind = errors.CONFLICT, message = "cannot delete child component " .. id .. ": " .. tostring(cause),
        details = {component_id = id}})
end

-- Placement is distinct from lifecycle ownership. Preflight the complete tree,
-- including children hidden from the caller, before committing any delete intent.
function M.run(parent_id: string): (boolean?, error?)
    local _, access_err = context_policy.validate_access(parent_id, component_types.ACCESS.DELETE)
    if access_err then return nil, access_err end
    local actor, _, identity_err = context_policy.current_runtime_identity()
    if identity_err then return nil, identity_err end
    local user_id = (actor :: any):id()
    local order: {string} = {}
    local function collect(id: string): error?
        local offset = 0
        while true do
            local children, read_err = reader.new():with_parent(id):include_options({meta = false})
                :order_by("component_id", "ASC"):limit(100, offset):all()
            if read_err then return blocked(id, read_err) end
            for _, child in ipairs(children or {}) do
                local cid = child.component_id
                local permitted, permission_err = reader.new():with_components(cid):with_user(user_id)
                    :with_access_mask(component_types.ACCESS.DELETE):include_options({meta = false}):one()
                if permission_err or not permitted then
                    return blocked(cid, permission_err or "DELETE access is required")
                end
                local child_err = collect(cid)
                if child_err then return child_err end
                order[#order + 1] = cid
            end
            if #children < 100 then return nil end
            offset = offset + #children
        end
    end
    local collect_err = collect(parent_id)
    if collect_err then return nil, collect_err end
    if #order == 0 then return true, nil end
    local svc, service_err = context_policy.get_component_service()
    if service_err then return nil, service_err end
    local deadline = time.now():add("30s")
    for _, id in ipairs(order) do
        local result, delete_err = (svc :: any):delete({component_id = id})
        local result_err = delete_err or envelope.error_of(result, "delete child")
        if result_err then return nil, blocked(id, result_err) end
        -- Normal deletion owns teardown and its lease. Observe its result rather
        -- than invoking the provider or deletion worker from this request frame.
        while true do
            local row, read_err = reader.new():with_components(id):include_options({meta = false}):one()
            if read_err then return nil, blocked(id, read_err) end
            if not row then break end
            local job, job_err = jobs.get_job(result.job_id)
            if job_err then return nil, blocked(id, job_err) end
            if not job then return nil, blocked(id, "deletion job is absent") end
            if job.last_error ~= nil or job.status == "dead" or job.status == "cancelled" then
                return nil, blocked(id, job.last_error or job.status)
            end
            if not time.now():before(deadline) then return nil, blocked(id, "deletion is still in progress") end
            time.sleep("10ms")
        end
    end
    return true, nil
end

return M
