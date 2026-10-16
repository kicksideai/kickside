-- Destination shape and ownership checks for a Data Sync declaration.
local M = {}
type Map = table

-- passthrough_gap(source, sink, transform, sink_config) -> the refusal for a
-- pass-through pipeline that cannot write a valid item, or nil. Without a
-- mapping transform each payload reaches the destination as the source emits it,
-- so every input field the destination declares required must be in the
-- source's declared payload face or supplied by a destination config field
-- declaring `supplies`. A mapping transform or an undeclared source face
-- cannot be decided here.
function M.passthrough_gap(source: table?, sink: table?, transform: table?, sink_config: table?): string?
    if type(transform) ~= "table" or (transform :: Map).kind ~= "none" then return nil end
    local face = type(source) == "table" and (source :: Map).output_schema or nil
    local carried = type(face) == "table" and (face :: Map).properties or nil
    if type(carried) ~= "table" then return nil end
    local input = type(sink) == "table" and (sink :: Map).input_schema or nil
    local required = type(input) == "table" and (input :: Map).required or nil
    if type(required) ~= "table" then return nil end
    local supplied: { [string]: boolean } = {}
    local config = type(sink_config) == "table" and (sink_config :: Map) or {}
    local fields = type(sink) == "table" and (sink :: Map).config_schema or nil
    for key, field in pairs(type(fields) == "table" and (fields :: Map) or {}) do
        local target = type(field) == "table" and (field :: Map).supplies or nil
        local value = config[key]
        if type(target) == "string" and value ~= nil and value ~= "" then supplied[target :: string] = true end
    end
    local missing: { string } = {}
    for _, key in ipairs(required :: { string }) do
        local name = tostring(key)
        if (carried :: Map)[name] == nil and not supplied[name] then missing[#missing + 1] = name end
    end
    if #missing == 0 then return nil end
    return "the destination needs " .. table.concat(missing, ", ")
        .. ", which the source items do not carry: map it with a transform or set it in the destination's configuration"
end

return M
