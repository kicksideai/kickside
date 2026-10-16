-- Wraps the threads persistence seam and, the moment a creation step returns a
-- committed component, reads that component's thread through the published
-- threads contract under the creating actor, the way GET /threads/{id} does.
local actual = require("actual")
local state = require("state")
local security = require("security")
local contract = require("contract")
local sql = require("sql")

local function observe(step: string, component_id: string?)
    if type(component_id) ~= "string" or component_id == "" then return end
    local db, db_err = sql.get("app:db")
    if db_err or not db then error("observer db unavailable: " .. tostring(db_err)) end
    local rows, rows_err = db:query("SELECT component_id FROM kickside_components WHERE component_id = $1", { component_id })
    db:release()
    if rows_err then error("observer component read failed: " .. tostring(rows_err)) end
    local definition, definition_err = contract.get("kickside.core:threads")
    if definition_err or not definition then error("threads contract unavailable: " .. tostring(definition_err)) end
    local threads, open_err = definition:with_actor(security.actor()):with_scope(security.scope()):open()
    if open_err or not threads then error("threads contract open failed: " .. tostring(open_err)) end
    local found, find_err = threads:find({ thread_id = component_id })
    local observations = state.observations
    observations[#observations + 1] = {
        step = step,
        component_id = component_id,
        component_visible = rows ~= nil and #rows > 0,
        thread_found = found ~= nil,
        find_error = find_err and tostring(find_err) or nil,
    }
end

local M = {
    remove_thread_component = actual.remove_thread_component,
    create = actual.create,
    attach = actual.attach,
    apply_thread_declaration = actual.apply_thread_declaration,
    complete = actual.complete,
    finish = actual.finish,
    ensure_thread_type = actual.ensure_thread_type,
    update = actual.update,
}

function M.register_thread_component(...): (string?, error?)
    local component_id, err = actual.register_thread_component(...)
    if not err then observe("register_thread_component", component_id) end
    return component_id, err
end

function M.ensure_thread_component(...): (string?, boolean?, error?)
    local component_id, created, err = actual.ensure_thread_component(...)
    if not err and created == true then observe("ensure_thread_component", component_id) end
    return component_id, created, err
end

return M
