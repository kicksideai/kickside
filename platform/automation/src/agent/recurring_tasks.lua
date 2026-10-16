-- One component-shared task surface shared by chat traits and MCP. All writes use
-- the existing automation commands and canonical component ACLs.
local security = require("security")
local uuid = require("uuid")
local component = require("component")
local automations = require("automations_lib")
local classification = require("failure_classification")
local canonical_json = require("canonical_json")
local keyset = require("keyset")

local KIND = "kickside.automation.recurring:task"
local M = {}

local function denied()
    return errors.new({ kind = errors.NOT_FOUND, message = "recurring task not found", retryable = false })
end

local function task_row(id, actor, access_mask)
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "id is required" })
    end
    local rows, err = component.query({ component_ids = { id }, actor_id = actor:id(),
        access_mask = access_mask, include = { meta = true } })
    if err then return nil, err end
    local row = rows and rows[1]
    if not row or row.impl_id ~= KIND then return nil, denied() end
    return row, nil
end

local function get(id, row, actor)
    local state, err = automations.read_config(id)
    if err then return nil, err end
    local status, status_err = automations.status(id, {})
    if status_err then return nil, status_err end
    local d = status.drives[1] or {}
    return { id = id, owner_id = row.meta and row.meta.owner,
        is_owner = row.meta and row.meta.owner == actor:id() or false, title = state.title, schedule = state.schedule, target = state.target,
        enabled = d.enabled, phase = d.phase, last_run_at = d.last_run_at, next_run_at = d.next_run_at,
        last_error = d.last_error or (status.delivery_failures or {}).last_error,
        failed_runs = (status.delivery_failures or {}).count or 0 }, nil
end

local function task_summary(task)
    local target = task.target or {}
    local target_summary = { kind = target.kind }
    if target.flow_ref ~= nil then target_summary.flow_ref = target.flow_ref end
    if target.agent_id ~= nil then target_summary.agent_id = target.agent_id end
    if target.port ~= nil then target_summary.port = target.port end
    return {
        id = task.id,
        owner_id = task.owner_id,
        is_owner = task.is_owner,
        title = task.title,
        schedule = task.schedule,
        target = target_summary,
        enabled = task.enabled,
        phase = task.phase,
        last_run_at = task.last_run_at,
        next_run_at = task.next_run_at,
        failed_runs = task.failed_runs,
    }
end

function M.handler(args)
    local actor = security.actor()
    if not actor or type(actor:id()) ~= "string" or actor:id() == "" then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "authentication required" })
    end
    local a = type(args) == "table" and args or {}
    if (a.action == "create" or a.action == "update") and type(a.target) == "table"
        and type(a.target.input) == "table" then
        a.target.input = canonical_json.object(a.target.input)
    end
    if a.action == "create" then
        local input = { title = a.title, schedule = a.schedule, target = a.target, enabled = a.enabled ~= false }
        if a.principal ~= nil then
            if type(a.principal) ~= "table" or a.principal.kind ~= "group" then
                return nil, errors.new({ kind = errors.INVALID, message = "principal may only select an authorized group; default is the calling user" })
            end
            -- Publish the task paused; SET performs the canonical ADMIN and
            -- live may_act_as checks before any tick can run under this selection.
            input.enabled = false
        end
        local created, err = automations.install_type(KIND, input, a.parent_id)
        if err then return nil, err end
        if a.principal then
            local selected, select_err = automations.set_execution_identity(created.id, {
                principal = a.principal, request_id = "recurring:" .. uuid.v7(), expected_identity_generation = 0,
            })
            if select_err then
                local failure = classification.classify(select_err)
                return nil, errors.new({ kind = failure.kind, retryable = failure.retriable,
                    message = failure.message, details = { task_id = created.id, paused = true } })
            end
            if selected.state ~= "succeeded" then return nil, errors.new({ kind = errors.UNAVAILABLE,
                message = "group selection is pending; recurring task remains paused", details = { task_id = created.id } }) end
            if a.enabled ~= false then
                local _, resume_err = automations.call_action(created.id, "resume", {})
                if resume_err then return nil, resume_err end
            end
        end
        local row, row_err = task_row(created.id, actor, component.ACCESS.READ)
        if row_err then return nil, row_err end
        local task, read_err = get(created.id, row, actor)
        if read_err then return nil, read_err end
        return { success = true, id = created.id, task = task }, nil
    elseif a.action == "list" then
        local limit, cursor, page_err = keyset.args(a)
        if page_err then return nil, page_err end
        local offset = 0
        if cursor ~= nil then
            local position = tonumber(cursor)
            if not position or position ~= math.floor(position) or position < 0 then
                return nil, errors.new({ kind = errors.INVALID, message = "cursor must be a next_cursor value from a previous page" })
            end
            offset = position :: integer
        end
        local rows, err = component.query({ impl_ids = { KIND }, actor_id = actor:id(),
            access_mask = component.ACCESS.READ, include = { meta = true },
            order_by = { field = "created_at", direction = "DESC" }, limit = (limit :: integer) + 1, offset = offset })
        if err then return nil, err end
        local tasks = {}
        for index, row in ipairs(rows or {}) do
            if index > limit then break end
            local task, read_err = get(row.component_id, row, actor)
            if read_err then return nil, read_err end
            tasks[#tasks + 1] = task_summary(task)
        end
        return { success = true, tasks = tasks, count = #tasks,
            next_cursor = #(rows or {}) > (limit :: integer) and tostring(offset + (limit :: integer)) or nil }, nil
    end
    if a.action ~= "get" and a.action ~= "update" and a.action ~= "pause" and a.action ~= "resume"
        and a.action ~= "delete" and a.action ~= "run_now" then
        return nil, errors.new({ kind = errors.INVALID, message = "unknown recurring task action" })
    end
    local required = a.action == "get" and component.ACCESS.READ
        or a.action == "delete" and component.ACCESS.ADMIN or component.ACCESS.WRITE
    local row, access_err = task_row(a.id, actor, required)
    if access_err then return nil, access_err end
    if a.action == "delete" then
        local result, err = automations.delete_automation(a.id, {})
        if err then return nil, err end
        return { success = true, id = a.id, result = result }, nil
    elseif a.action == "update" then
        local _, err = automations.reconfigure(a.id, {
            title = a.title, schedule = a.schedule, target = a.target,
        })
        if err then return nil, err end
    elseif a.action ~= "get" then
        local result, err = automations.call_action(a.id, a.action, {})
        if err then return nil, err end
        if result.result and result.result.state == "failed" then
            local outcome = result.result.outcome or {}
            return nil, errors.new({ kind = outcome.kind or errors.INTERNAL, message = outcome.message or "task control failed" })
        end
    end
    -- A WRITE-only grant can operate without receiving READ-only config/status.
    local readable, query_err = component.query({ component_ids = { a.id }, actor_id = actor:id(),
        access_mask = component.ACCESS.READ, include = { meta = true } })
    if query_err then return nil, query_err end
    if not readable or not readable[1] then return { success = true, id = a.id }, nil end
    local task, err = get(a.id, readable[1], actor)
    if err then return nil, err end
    return { success = true, id = a.id, task = task }, nil
end

return M
