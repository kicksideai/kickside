-- uploads_events: foreground append helper for upload user operations. Durable
-- processing events are appended by the core job engine. Event names/component ids
-- live in types.lua so read paths don't depend on this emitter.
--
local logger = require("logger"):named("kickside.uploads.events")
local errors = require("errors")
local component = require("component")

local upload_types = require("types")

local M = {}

M.TYPE = upload_types.EVENT
M.component_id_for_owner = upload_types.component_id_for_owner
M.component_topic = upload_types.component_topic

-- emit appends one upload event to the actor's uploads thread (get-or-create). ext_id
-- + the event type form the dedup key. This ambient path is for foreground user
-- operations such as delete; durable processing milestones are emitted by core jobs.
function M.emit(owner_actor_id: string, etype: string, body: any, ext_id: string, trace_context: any?): (boolean?, any?)
    if type(owner_actor_id) ~= "string" or owner_actor_id == "" then
        return nil, errors.new({ message = "upload event owner is required", kind = errors.INVALID })
    end
    local _, emit_err = component.emit_singleton_event(upload_types.CLASS, {
        type = etype,
        body = body,
        impl_id = upload_types.IMPL,
        thread_class = upload_types.CLASS,
        trace_context = trace_context,
        external_source = upload_types.EVENT_SOURCE,
        external_id = ext_id,
        external_version = etype,
    })
    if emit_err then
        logger:warn("uploads event emit failed", { owner_actor_id = owner_actor_id, type = etype, error = tostring(emit_err) })
        if type(emit_err) == "userdata" then return nil, emit_err end
        return nil, errors.new({ message = "upload event append failed: " .. tostring(emit_err),
            kind = errors.UNAVAILABLE, retryable = true })
    end
    return true, nil
end

return M
