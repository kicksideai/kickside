-- Read-only automation-management tool for agents: installed automations, the
-- installable-type and source/sink catalog, one automation's full
-- config, its portable export, its drive/command status, and the caller's
-- automation health. Every action maps onto one automations_lib
-- read call; access is enforced by the library's own access-masked component
-- queries, never checked here.

local security = require("security")
local automations_lib = require("automations_lib")
local tool_result = require("tool_result")
local keyset = require("keyset")

type Map = { [string]: any }

local function require_id(args: Map): (string?, error?)
    local id = args.id
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({ message = "id is required", kind = errors.INVALID })
    end
    return id, nil
end

local function automation_summary(automation: Map): Map
    local availability = automation.availability
    return {
        id = automation.id,
        type = automation.type,
        title = automation.title,
        class = automation.class,
        owner_id = automation.owner_id,
        is_owner = automation.is_owner,
        created_at = automation.created_at,
        updated_at = automation.updated_at,
        availability = type(availability) == "table" and { code = availability.code, message = availability.message } or availability,
    }
end

local function type_summary(automation_type: Map): Map
    return {
        id = automation_type.id,
        title = automation_type.title,
        icon = automation_type.icon,
        category = automation_type.category,
        class = automation_type.class,
        primary = automation_type.primary,
        installable = automation_type.installable,
        reconfigurable = automation_type.reconfigurable,
        exportable = automation_type.exportable,
    }
end

local function port_summary(port: Map): Map
    return {
        id = port.id,
        title = port.title,
        icon = port.icon,
        surface = port.surface,
        class = port.class,
        provider = port.provider,
        group = port.group,
    }
end

-- list pages the caller's automations at the component query, newest first;
-- the cursor is the query position of the next page.
local function do_list(args: Map, actor: any): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local offset = 0
    if cursor ~= nil then
        local position = tonumber(cursor)
        if not position or position ~= math.floor(position) or position < 0 then
            return tool_result.fail(errors.INVALID, "cursor must be a next_cursor value from a previous page")
        end
        offset = position :: integer
    end
    local automations, err = automations_lib.list_installed({
        actor_id = actor:id(),
        class = args.class,
        limit = (limit :: integer) + 1,
        offset = offset,
    })
    if err then return nil, err end
    local rows: { any } = {}
    for index = 1, math.min(#(automations or {}), limit :: integer) do
        rows[#rows + 1] = automation_summary((automations :: { Map })[index])
    end
    local more = #(automations or {}) > (limit :: integer)
    return { success = true, count = #rows, automations = rows,
        next_cursor = more and tostring(offset + (limit :: integer)) or nil }
end

local function do_types(args: Map): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local types, err = automations_lib.list_types({})
    if err then return nil, err end
    local rows, next_cursor = keyset.page(types, keyset.field("id"), limit :: integer, cursor)
    for index, row in ipairs(rows) do rows[index] = type_summary(row :: Map) end
    return { success = true, count = #rows, types = rows, next_cursor = next_cursor }
end

local function do_type(args: Map): (any, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local types, err = automations_lib.list_types({})
    if err then return nil, err end
    for _, automation_type in ipairs(types or {}) do
        if automation_type.id == id then return { success = true, type = automation_type }, nil end
    end
    return tool_result.fail(errors.NOT_FOUND, "automation type not found: " .. (id :: string))
end

-- catalog pages sources and sinks together in registry id order; each row
-- lands in the list of its own port direction. One binding can serve both
-- directions, so the page key pairs the id with the direction.
local function do_catalog(args: Map): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local sources, sources_err = automations_lib.list_sources()
    if sources_err then return nil, sources_err end
    local sinks, sinks_err = automations_lib.list_sinks()
    if sinks_err then return nil, sinks_err end
    local ports: { any } = {}
    for _, row in ipairs(sources or {}) do ports[#ports + 1] = { direction = "source", row = row } end
    for _, row in ipairs(sinks or {}) do ports[#ports + 1] = { direction = "sink", row = row } end
    local selected, next_cursor = keyset.page(ports, function(port: any): string return tostring(port.row.id) .. "#" .. port.direction end,
        limit :: integer, cursor)
    local page_sources: { any } = {}
    local page_sinks: { any } = {}
    for _, port in ipairs(selected) do
        if port.direction == "source" then page_sources[#page_sources + 1] = port_summary(port.row)
        else page_sinks[#page_sinks + 1] = port_summary(port.row) end
    end
    return {
        success = true,
        sources = page_sources,
        sinks = page_sinks,
        next_cursor = next_cursor,
    }
end

local function do_catalog_entry(args: Map): (any, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local direction = args.direction
    if direction ~= "source" and direction ~= "sink" then
        return tool_result.fail(errors.INVALID, "direction must be source or sink")
    end
    local ports, err
    if direction == "source" then ports, err = automations_lib.list_sources()
    else ports, err = automations_lib.list_sinks() end
    if err then return nil, err end
    for _, port in ipairs(ports or {}) do
        if port.id == id then return { success = true, entry = port }, nil end
    end
    return tool_result.fail(errors.NOT_FOUND, "catalog entry not found: " .. (id :: string))
end

local function do_read_config(args: Map): (any, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local config, err = automations_lib.read_config(id :: string)
    if err then return nil, err end
    return { success = true, id = id, config = config }
end

local function do_export(args: Map): (any, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local artifact, err = automations_lib.export_artifact(id :: string)
    if err then return nil, err end
    return { success = true, artifact = artifact }
end

-- status pages one automation's drives with its command state (READ).
local function do_status(args: Map): (any, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local status, err = automations_lib.status(id :: string, { page_token = args.page_token, page_size = args.page_size })
    if err then return nil, err end
    local response: Map = { success = true, id = id }
    for key, value in pairs(status :: Map) do response[key] = value end
    return response
end

-- health aggregates the caller's readable automations.
local function do_health(args: Map): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local health, err = automations_lib.health()
    if err then return nil, err end
    local response: Map = {}
    for key, value in pairs(health :: Map) do response[key] = value end
    local page, next_cursor = keyset.page(response.delivery_failures, keyset.field("automation_id"), limit :: integer, cursor)
    local failures: { Map } = {}
    for _, failure in ipairs(page) do
        failures[#failures + 1] = { automation_id = failure.automation_id, count = failure.count }
    end
    response.delivery_failures = failures
    return { success = true, health = response, next_cursor = next_cursor }
end

local function handler(args: any): (any, error?)
    local a: Map = (type(args) == "table") and (args :: Map) or {}
    local actor = security.actor()
    if not actor or tostring(actor:id() or "") == "" then return tool_result.fail(errors.PERMISSION_DENIED, "authentication required") end

    local action = tostring(a.action or "")
    if action == "list" then return do_list(a, actor) end
    if action == "types" then return do_types(a) end
    if action == "type" then return do_type(a) end
    if action == "catalog" then return do_catalog(a) end
    if action == "catalog_entry" then return do_catalog_entry(a) end
    if action == "read_config" then return do_read_config(a) end
    if action == "export" then return do_export(a) end
    if action == "status" then return do_status(a) end
    if action == "health" then return do_health(a) end
    return tool_result.fail(errors.INVALID, "unknown action: " .. action)
end

return { handler = handler }
