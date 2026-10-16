-- Trait curator prompt func. Runs every step and lists the traits the agent turned on
-- (read from the curator's own context, master_active, which rides active_traits), so
-- the agent stays aware of what it activated and can deactivate when done. Their actual
-- tools/prompt come from the recompiled trait set; this is the running reminder of the
-- dynamic additions. Returns "" when nothing is active so it adds nothing to the prompt.

local ctx = require("ctx")
local registry = require("registry")
local id_set = require("id_set")
local master_ns = require("master_ns")
local capability_context = require("capability_context")

local TRAIT_TYPE = "agent.trait"

local function configured_traits(): { string }
    return id_set.parse(ctx.get("trait_ids"))
end

local function trait_id_allowed(trait_id: string, trait_ids: { string }): boolean
    if #trait_ids == 0 then return true end
    return id_set.has(trait_ids, trait_id)
end

local function trait_title(entry: any): string
    local meta = (entry :: any).meta or {}
    return tostring(meta.title or (entry :: any).id)
end

local function trait_description(meta: any): string
    local desc = tostring(meta.comment or "")
    local schema_note = capability_context.summary(meta.context_schema)
    if schema_note ~= "" then
        if desc ~= "" then desc = desc .. " " .. schema_note else desc = schema_note end
    end
    return desc
end

local function active_section(): string
    local ids = id_set.parse(ctx.get("master_active"))
    if #ids == 0 then return "" end

    local lines: { string } = {}
    for _, id in ipairs(ids) do
        local title = id
        local entry = registry.get(id)
        if entry and (entry :: any).meta then
            local meta = (entry :: any).meta
            title = meta.title or id
        end
        lines[#lines + 1] = "- " .. tostring(title) .. " (`" .. id .. "`)"
    end

    return "## Capabilities you activated\n\n" ..
        "You turned these on for this session; deactivate one with the Capabilities tool's " ..
        "`deactivate` action when you no longer need it.\n\n" ..
        table.concat(lines, "\n")
end

local function catalog_section(): string
    if ctx.get("inject_trait_catalog") ~= true then return "" end

    local namespaces = ctx.get("namespaces")
    local trait_ids = configured_traits()
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = TRAIT_TYPE })
    if err or not entries then return "" end

    local rows: { any } = {}
    for _, entry in ipairs(entries :: { any }) do
        local meta = (entry :: any).meta or {}
        local id = tostring((entry :: any).id or "")
        if id ~= "" and meta.public and not meta.private and master_ns.allowed(namespaces, id)
            and trait_id_allowed(id, trait_ids) then
            rows[#rows + 1] = entry
        end
    end
    table.sort(rows, function(a: any, b: any): boolean
        local at, bt = trait_title(a), trait_title(b)
        if at ~= bt then return at < bt end
        return tostring(a.id) < tostring(b.id)
    end)

    if #rows == 0 then return "" end
    local lines: { string } = {}
    for _, entry in ipairs(rows) do
        local meta = (entry :: any).meta or {}
        local id = tostring((entry :: any).id)
        local desc = trait_description(meta)
        local context_note = meta.web_component and " _(context configurable)_" or ""
        if desc ~= "" then
            lines[#lines + 1] = "- **" .. trait_title(entry) .. "** (`" .. id .. "`)" .. context_note .. " - " .. desc
        else
            lines[#lines + 1] = "- **" .. trait_title(entry) .. "** (`" .. id .. "`)" .. context_note
        end
    end

    return "## Capabilities you can activate\n\n" ..
        "Use the Capabilities tool's `activate` action with one of these ids. If a capability needs " ..
        "configuration, pass it as the activation `context`.\n\n" ..
        table.concat(lines, "\n")
end

local function execute(): string
    -- The dynamic set rides the curator's own context (master_active), carried in
    -- active_traits -- so it persists with the session and resets on an agent switch.
    local sections: { string } = {}
    local catalog = catalog_section()
    local active = active_section()
    if catalog ~= "" then sections[#sections + 1] = catalog end
    if active ~= "" then sections[#sections + 1] = active end
    return table.concat(sections, "\n\n")
end

return { execute = execute }
