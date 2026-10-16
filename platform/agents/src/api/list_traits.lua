local http = require("http")
local security = require("security")
local registry = require("registry")
local query_params = require("query_params")
local capability_context = require("capability_context")

local TRAIT_TYPE = "agent.trait"
local MAX_PICKER_LIMIT = 100

-- What a trait contributes, so the UI can signal that it is more than a tool bundle:
--   tools     adds callable tools
--   behavior  injects context or instructions at runtime via a build/prompt func
--             (the dynamic traits -- roster, curator, time/user awareness -- not a
--             static usage prompt that merely documents a trait's own tools)
--   memory    affects memory recall or token checkpoints
local function tags_have(tags, name)
    if type(tags) ~= "table" then return false end
    for _, t in ipairs(tags) do
        if t == name then return true end
    end
    return false
end

local function trait_affects(meta, data)
    local opts = (type(data.options) == "table" and data.options) or {}
    local tags = meta.tags or {}
    return {
        tools = type(data.tools) == "table" and #data.tools > 0,
        behavior = (type(data.build_func_id) == "string" and data.build_func_id ~= "")
            or (type(data.prompt_func_id) == "string" and data.prompt_func_id ~= ""),
        memory = tags_have(tags, "memory") or tags_have(tags, "checkpoint")
            or opts.memory_scope ~= nil or opts.recall_window ~= nil or opts.checkpoint ~= nil,
    }
end

local function trait_description(meta)
    local desc = tostring(meta.comment or "")
    local schema_note = capability_context.summary(meta.context_schema)
    if schema_note ~= "" then
        if desc ~= "" then desc = desc .. " " .. schema_note else desc = schema_note end
    end
    return desc
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    -- Async multi-select params for the search-based picker: `ids` returns only
    -- the listed traits (resolves selected chips, ignores q/limit), `q` is a
    -- case-insensitive title/description substring filter, `limit` caps rows
    -- (defaults to 20 when q is present). With none present the full list is
    -- is returned unfiltered.
    local ids_param = req:query("ids")
    local want_ids = nil
    if type(ids_param) == "string" and ids_param ~= "" then
        want_ids = {}
        for id in string.gmatch(ids_param, "([^,]+)") do
            local trimmed = id:match("^%s*(.-)%s*$")
            if trimmed ~= "" then want_ids[trimmed] = true end
        end
    end
    local q = nil
    local limit = nil
    if not want_ids then
        local q_param = req:query("q")
        q = (type(q_param) == "string" and q_param ~= "") and string.lower(q_param) or nil
        local parsed_limit, limit_err = query_params.query_int(req, "limit", nil, { min = 1, max = MAX_PICKER_LIMIT })
        if limit_err then
            query_params.bad_request(res, limit_err)
            return
        end
        if parsed_limit ~= nil then
            limit = parsed_limit
        elseif q then
            limit = 20
        end
    end

    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = TRAIT_TYPE,
    })

    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = err })
        return
    end

    -- Whitelist: the picker only surfaces traits explicitly marked public, so
    -- internal/system traits and uncurated framework traits stay out. private
    -- remains a hard override for anything that should never appear.
    local traits = {}
    for _, entry in ipairs(entries) do
        if not entry.meta or not entry.meta.public or entry.meta.private then
            goto continue
        end

        local id = entry.id or ""
        local title = entry.meta.title or ""
        local description = trait_description(entry.meta)

        if want_ids then
            if not want_ids[id] then goto continue end
        else
            if q then
                local matched = string.find(string.lower(title), q, 1, true) ~= nil
                    or string.find(string.lower(description), q, 1, true) ~= nil
                if not matched then goto continue end
            end
        end

        local entry_data = (type(entry.data) == "table" and entry.data) or {}
        local trait = {
            id = id,
            title = title,
            description = description,
            tags = entry.meta.tags or {},
            tools = entry_data.tools or {},
            affects = trait_affects(entry.meta, entry_data),
            context_schema = entry.meta.context_schema,
            context_requirements = capability_context.summary(entry.meta.context_schema),
        }
        if entry.meta.icon then
            trait.icon = entry.meta.icon
        end
        if entry.meta.web_component then
            trait.web_component = entry.meta.web_component
        end
        if entry.meta.provider then
            trait.provider = entry.meta.provider
        end
        table.insert(traits, trait)

        if limit and #traits >= limit then break end

        ::continue::
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #traits,
        traits = traits,
    })
end

return {
    handler = handler
}
