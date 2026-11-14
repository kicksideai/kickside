-- Test-only lifecycle projection worker. It seeds the component named by each
-- created event through the ordinary component access path: an ADMIN access
-- check, then a context write under the ambient actor. The body records the
-- actor the worker ran as.

local security = require("security")
local component = require("component")

local CREATED = "kickside.component.events:created"

local function run(input: table): (table?, error?)
    local input_tbl: table = type(input) == "table" and input or {}
    local projection: table = type(input_tbl.projection) == "table" and input_tbl.projection or {}
    local body: table = type(projection.body) == "table" and projection.body or {}
    local range: table = type(input_tbl.range) == "table" and input_tbl.range or {}
    local events: { any } = type(input_tbl.events) == "table" and input_tbl.events or {}

    local actor = security.actor()
    body.seeded_by = actor and actor:id() or nil
    for _, event in ipairs(events) do
        local payload = type((event :: any).body) == "table" and (event :: any).body or {}
        local component_id = payload.component_id
        if (event :: any).type == CREATED and type(component_id) == "string" then
            local _, access_err = component.validate_access(component_id, component.ACCESS.ADMIN)
            if access_err then return nil, access_err end
            local _, update_err = component.update(component_id, {
                { type = "PATCH_CONTEXT", payload = { patch = { seeded = true } } },
            })
            if update_err then return nil, update_err end
            body.seeded = component_id
        end
    end
    return { body = body, last_seq = tonumber(range.to_seq) or nil }, nil
end

return { run = run }
