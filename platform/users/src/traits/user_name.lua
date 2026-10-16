local security = require("security")
local consts = require("consts")

local MAX_NAME = consts.LIMITS.MAX_FULL_NAME_LENGTH

local function sanitize(value: any): string
    if type(value) ~= "string" then return "Unknown" end
    local name = value :: string
    -- Collapse anything non-printable (newlines above all) into a space.
    name = name:gsub("%c", " ")
    -- Quotes would let the value close its own delimiter.
    name = name:gsub('"', "'")
    name = name:gsub("^%s*(.-)%s*$", "%1")
    if #name > MAX_NAME then
        name = name:sub(1, MAX_NAME)
    end
    if name == "" then return "Unknown" end
    return name
end

local function handler()
    local actor = security.actor()
    if not actor then
        return "User: Not authenticated"
    end

    local actor_meta = actor:meta() or {}
    return 'User: "' .. sanitize(actor_meta.full_name) .. '"'
end

return { handler = handler, sanitize = sanitize }
