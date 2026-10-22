-- Workflows projection of the canonical Block catalog. Workflows does not discover
-- registry functions or own executable declarations: kickside.blocks supplies the
-- unified explicit + virtual-tool descriptors used by both the compiler and editor.
local blocks = require("blocks")

local M = {}

type Map = { [string]: any }

M._blocks = blocks

local function str(value: any): string
    return type(value) == "string" and value or ""
end

local function map(value: any): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function normalize(descriptor: Map): (Map?, string?)
    local d = descriptor :: Map
    local id = str(d.id)
    if id == "" then return nil, "Block descriptor id is required" end
    local presentation = map(d.presentation)
    local execution = map(d.execution)
    local ports: { any } = {}
    for _, raw_port in ipairs(d.ports :: { any }) do
        if type(raw_port) == "table" then
            local port: Map = {}
            for key, value in pairs(raw_port :: Map) do port[key] = value end
            if port.schema == nil then
                local port_id = str(port.id)
                if port_id == "failed" then port.schema = d.error
                elseif port_id == "result" then port.schema = d.output end
            end
            ports[#ports + 1] = port
        else
            ports[#ports + 1] = raw_port
        end
    end
    return {
        id = id,
        kind = "block",
        label = str(d.title) ~= "" and d.title or d.id,
        category = str(presentation.category) ~= "" and presentation.category or "Blocks",
        icon = str(presentation.icon) ~= "" and presentation.icon or "tabler:box",
        hue = str(presentation.hue) ~= "" and presentation.hue or "violet",
        blurb = str(presentation.blurb) ~= "" and presentation.blurb or d.description,
        waits = execution.kind == "wait",
        input_schema = d.input,
        config_schema = d.config,
        -- config_schema is the canvas-facing name; `config` is the canonical
        -- field the Blocks library validates a tool instance against, so it
        -- rides along the same way `declaration` does. Dropping it makes every
        -- tool-backed Block fail materialization with "schema is required".
        config = d.config,
        config_wc = presentation.config_wc,
        output_schema = d.output,
        error_schema = d.error,
        ports = ports,
        public = d.public == true,
        source_kind = str(d.source_kind) ~= "" and d.source_kind or "block",
        tool = d.tool == true or d.source_kind == "tool",
        execution = d.execution,
        -- Explicit Blocks lower from their canonical registry declaration so
        -- instance validation and execution policy have one source of truth.
        -- The public Blocks API deliberately omits this internal field.
        declaration = d.declaration,
    }, nil
end

-- catalog is keyed by exact Block id. A Flow node always freezes that id in
-- node.ref, so display labels and module-local presentation never become runtime
-- identity.
function M.catalog(): (Map?, error?)
    local entries, err = M._blocks.catalog()
    if err then return nil, err end
    local out: Map = {}
    local failures: { string } = {}
    for key, raw in pairs(type(entries) == "table" and entries or {}) do
        local source = map(raw)
        local descriptor, descriptor_err = normalize(source)
        if descriptor then
            out[str((descriptor :: Map).id)] = descriptor
        elseif descriptor_err then
            failures[#failures + 1] = (str(source.id) ~= "" and str(source.id) or tostring(key))
                .. ": " .. tostring(descriptor_err)
        end
    end
    if #failures > 0 then return nil, errors.new({ kind = errors.INTERNAL, message = "invalid Block declarations: " .. table.concat(failures, "; ") }) end
    return out, nil
end

function M.resolve(block_id: any): (Map?, error?)
    local id = str(block_id)
    if id == "" then return nil, errors.new({ kind = errors.INVALID, message = "Block reference is required" }) end
    local catalog, err = M.catalog()
    if err then return nil, err end
    local descriptor = (catalog :: Map)[id]
    if type(descriptor) ~= "table" then return nil, errors.new({ kind = errors.NOT_FOUND, message = "Block not found: " .. id }) end
    return descriptor :: Map, nil
end

return M
