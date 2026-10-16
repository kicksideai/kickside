-- child_lifecycle_projection: generic fold for a parent supervising one child's
-- lifecycle thread. The projection is registered on the child lifecycle thread and
-- keyed by the parent component id.

local CREATED = "kickside.component.events:created"
local UPDATED = "kickside.component.events:updated"
local DELETED = "kickside.component.events:deleted"

local M = {}

local function config(body: table): table
    return type(body.worker_config) == "table" and body.worker_config or {}
end

local function child_state(body: table): table
    local state = type(body.child) == "table" and body.child or nil
    if state then return state end
    state = table.create(0, 12)
    body.child = state
    return state
end

local function event_body(event: table): table
    return type(event.body) == "table" and event.body or {}
end

local function apply_event(state: table, cfg: table, event: table)
    local body = event_body(event)
    local parent_id = cfg.parent_component_id
    local child_id = body.component_id or cfg.child_component_id
    if child_id ~= nil then state.component_id = child_id end
    if cfg.child_impl_id ~= nil then state.impl_id = cfg.child_impl_id end
    if body.impl_id ~= nil then state.impl_id = body.impl_id end
    state.parent_component_id = parent_id
    state.parent_impl_id = cfg.parent_impl_id
    state.last_event_type = event.type
    state.last_event_seq = event.seq
    state.last_event_at = event.created_at

    if event.type == CREATED then
        state.created_at = event.created_at
        state.deleted_at = nil
        state.deleted = false
        state.active = body.parent_id == parent_id
    elseif event.type == UPDATED then
        state.updated_at = event.created_at
        state.previous_parent_id = body.previous_parent_id
        state.parent_id = body.parent_id
        state.position = body.position
        state.deleted = false
        state.active = body.parent_id == parent_id
    elseif event.type == DELETED then
        state.deleted_at = event.created_at
        state.deleted = true
        state.active = false
    end
end

function M.run(input: any): any
    input = type(input) == "table" and input or {}
    local projection = type((input :: any).projection) == "table" and (input :: any).projection or {}
    local body = type((projection :: any).body) == "table" and (projection :: any).body or {}
    local cfg = config(body)
    local state = child_state(body)

    for _, event in ipairs(((input :: any).events or {}) :: { any }) do
        if type(event) == "table" then
            apply_event(state, cfg, event :: table)
        end
    end

    local range = type((input :: any).range) == "table" and (input :: any).range or {}
    return {
        body = body,
        last_seq = tonumber((range :: any).to_seq) or tonumber(state.last_event_seq) or 0,
    }
end

return M
