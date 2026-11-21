local binding_errors = require("binding_errors")
local ctx = require("ctx")
local delete_admission = require("delete_admission")
local upload_lib = require("upload_lib")

-- The deletable binding resolves ownership of the component being torn down.
local function handle()
    local component_id, ctx_err = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = binding_errors.new(errors.INVALID, "no component context: " .. tostring(ctx_err), "component_context_required", false, ctx_err) }
    end

    local actor_id, actor_err = delete_admission.resolve_owner(component_id)
    if actor_err then
        return { success = false, error = actor_err }
    end
    -- No recorded actor means nothing actor-keyed to tear down.
    if type(actor_id) ~= "string" or actor_id == "" then
        return { success = true, deleted = 0 }
    end

    return upload_lib.purge_owner(actor_id)
end

return {handle = handle}
