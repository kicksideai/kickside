-- Settings block catalog. A block is the unit of the Settings page's left-nav:
-- either a bespoke editor (component_tag) or the generic per-value_type form
-- scoped to one settings namespace. Blocks are declared as
-- kickside.settings:block registry entries; every settings namespace that has a
-- visible definition and is not already claimed by an explicit block gets an
-- auto-block so no namespace is unreachable from the UI.

local registry = require("registry")

local M = {}

M.BLOCK_TYPE = "kickside.settings:block"

type Block = {
    key: string,
    title: string,
    icon: string?,
    order: number?,
    group: string?,
    component_tag: string?,
    namespace: string?,
    -- Extra namespaces this block owns beyond `namespace`. A bespoke block that
    -- consolidates several namespaces lists them here so none of them also gets
    -- a synthesized auto-block.
    namespaces: { string }?,
    -- Opaque config handed to a component_tag editor as its `config` attribute.
    -- Lets one bespoke component drive several blocks (e.g. per-provider).
    config: { [string]: any }?,
}

-- Last-resort title for a namespace with no declared block: drop a leading
-- "kickside." segment, split on separators, capitalize each token. Modules that
-- want a real title/group declare a kickside.settings:block instead of relying
-- on this.
function M.humanize(ns: string): string
    local base = ns:gsub("^kickside%.", "")
    local words: { string } = {}
    for token in base:gmatch("[^%._%-]+") do
        words[#words + 1] = token:sub(1, 1):upper() .. token:sub(2)
    end
    if #words == 0 then return ns end
    return table.concat(words, " ")
end

-- Explicit blocks declared in the registry.
function M.declared(): { Block }
    local entries, err = registry.find({ ["meta.type"] = M.BLOCK_TYPE })
    local out: { Block } = {}
    if err or type(entries) ~= "table" then return out end
    for _, entry in ipairs(entries) do
        local e = (entry :: { data: { [string]: any } }).data
        if type(e.key) == "string" and (e.key :: string) ~= "" then
            local extra: { string }? = nil
            if type(e.namespaces) == "table" then
                local list: { string } = {}
                for _, v in ipairs(e.namespaces :: { any }) do
                    if type(v) == "string" and (v :: string) ~= "" then list[#list + 1] = v :: string end
                end
                if #list > 0 then extra = list end
            end
            out[#out + 1] = {
                key = e.key :: string,
                title = (type(e.title) == "string" and (e.title :: string) ~= "")
                    and (e.title :: string) or (e.key :: string),
                icon = (type(e.icon) == "string") and (e.icon :: string) or nil,
                order = tonumber(e.order),
                group = (type(e.group) == "string" and (e.group :: string) ~= "")
                    and (e.group :: string) or nil,
                component_tag = (type(e.component_tag) == "string" and (e.component_tag :: string) ~= "")
                    and (e.component_tag :: string) or nil,
                namespace = (type(e.namespace) == "string" and (e.namespace :: string) ~= "")
                    and (e.namespace :: string) or nil,
                namespaces = extra,
                config = (type(e.config) == "table") and (e.config :: { [string]: any }) or nil,
            }
        end
    end
    return out
end

-- Order blocks by (group, order, title). Ungrouped blocks sort after grouped
-- ones so declared sections lead and auto-blocks trail.
local UNGROUPED = "\255"
function M.sort(blocks: { Block })
    table.sort(blocks, function(a: Block, b: Block): boolean
        local ga = a.group or UNGROUPED
        local gb = b.group or UNGROUPED
        if ga ~= gb then return ga < gb end
        local oa = a.order or 100
        local ob = b.order or 100
        if oa ~= ob then return oa < ob end
        return a.title < b.title
    end)
end

-- Compose the ordered catalog: the declared blocks plus an auto-block for every
-- visible namespace not already claimed by an explicit block's namespace. An
-- explicit block always wins over the auto-block for the same namespace.
function M.build(declared: { Block }, visible_ns: { [string]: boolean }): { Block }
    local covered: { [string]: boolean } = {}
    local out: { Block } = {}
    for _, b in ipairs(declared) do
        out[#out + 1] = b
        if type(b.namespace) == "string" then covered[b.namespace :: string] = true end
        if type(b.namespaces) == "table" then
            for _, ns in ipairs(b.namespaces :: { string }) do covered[ns] = true end
        end
    end

    local names: { string } = {}
    for ns in pairs(visible_ns) do
        if not covered[ns] then names[#names + 1] = ns end
    end
    table.sort(names)
    for _, ns in ipairs(names) do
        out[#out + 1] = { key = ns, title = M.humanize(ns), namespace = ns }
    end

    M.sort(out)
    return out
end

return M
