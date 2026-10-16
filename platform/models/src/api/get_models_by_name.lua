local http = require("http")
local models_lib = require("models")

-- GET /models/by-name?models=<comma-separated names or class:ids> — the model
-- resolver the web host calls to LABEL models (e.g. the chat header). An agent's
-- model is often a class reference ("class:fast"), so this must resolve a class
-- to the concrete card the runtime would actually run, not just match exact
-- names. Returns { success, models = { <identifier> = { name, title, description } } }.

local CLASS_PREFIX = "class:"

local function split_csv(str: string): { string }
    local fields: { string } = {}
    str:gsub("([^,]+)", function(c) fields[#fields + 1] = c end)
    return fields
end

-- Resolve an identifier (a model name or "class:<name>") to its concrete card.
-- For a class, return the highest-priority member — the model the runtime runs.
local function resolve_card(identifier: string): any
    if identifier:sub(1, #CLASS_PREFIX) == CLASS_PREFIX then
        local class_name = identifier:sub(#CLASS_PREFIX + 1)
        if class_name == "" then return nil end
        local class_models = models_lib.get_by_class(class_name)
        if class_models and #class_models > 0 then return class_models[1] end
        return nil
    end
    return (models_lib.get_by_name(identifier))
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end
    res:set_content_type(http.CONTENT.JSON)

    local models_param = req:query("models")
    if not models_param or models_param == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Missing 'models' query parameter. Expected comma-separated model names or class:<name> identifiers.",
        })
        return
    end

    local result: { [string]: any } = {}
    for _, identifier in ipairs(split_csv(models_param)) do
        local card = resolve_card(identifier)
        if card then
            result[identifier] = {
                name = card.name,
                title = card.title or card.name,
                description = card.description or "",
            }
        end
    end

    -- Reflects the live registry; never cache (see list_models).
    res:set_header("Cache-Control", "no-store")
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, models = result })
end

return {
    handler = handler,
}
