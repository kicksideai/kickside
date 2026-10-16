local registry = require("registry")
local capability_context = require("capability_context")

local TRAIT_TYPE = "agent.trait"

local function handler(args: any): any
    args = type(args) == "table" and args or {}
    local trait_id = tostring((args :: any).trait_id or "")
    if trait_id == "" then
        return { ok = false, error = "trait_id is required", missing = {}, mismatched = {} }
    end

    local entry, err = registry.get(trait_id)
    if err or not entry then
        return { ok = false, error = "capability not found: " .. trait_id, missing = {}, mismatched = {} }
    end
    local meta = (entry :: any).meta or {}
    if meta.type ~= TRAIT_TYPE then
        return { ok = false, error = "not a capability: " .. trait_id, missing = {}, mismatched = {} }
    end

    local validation = capability_context.validate(meta.context_schema, (args :: any).context)
    return {
        ok = validation.ok == true,
        missing = validation.missing or {},
        mismatched = validation.mismatched or {},
        error = validation.ok == true and nil or capability_context.error_message(validation),
    }
end

return { handler = handler }
