local http = require("http")
local security = require("security")
local registry = require("registry")
local funcs = require("funcs")
local agent_types = require("agent_types")

local M = {}

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function provider_sort(a: any, b: any): boolean
    local am = a.meta or {}
    local bm = b.meta or {}
    local ao = tonumber(am.order) or 100
    local bo = tonumber(bm.order) or 100
    if ao ~= bo then return ao < bo end
    return tostring(am.title or a.id) < tostring(bm.title or b.id)
end

local function call_list_targets(target: string, actor: any, scope: any, deps: any): (any, any)
    local funcs_mod = (deps and deps.funcs) or funcs
    local executor, exec_err = funcs_mod.new()
    if exec_err or not executor then
        return nil, exec_err or "funcs.new failed"
    end
    return executor:with_actor(actor):with_scope(scope):call(target, {})
end

function M.list_options(actor: any, scope: any, deps: any?): (any, string?)
    if not actor then return nil, "authentication required" end
    if not scope then return nil, "security scope is required" end

    local registry_mod = (deps and deps.registry) or registry
    local entries, err = registry_mod.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = agent_types.MEMORY_PROVIDER_TYPE,
    })
    if err then
        return nil, tostring(err)
    end

    table.sort(entries or {}, provider_sort)

    local providers = {}
    local items = {}
    for _, entry in ipairs(entries or {}) do
        local meta = entry.meta or {}
        if not meta.private and is_str(meta.implementation_id) and is_str(meta.list_targets) then
            local provider = {
                id = entry.id,
                title = meta.title or entry.id,
                icon = meta.icon,
                implementation_id = meta.implementation_id,
            }
            providers[#providers + 1] = provider

            local listed, list_err = call_list_targets(meta.list_targets :: string, actor, scope, deps)
            if not list_err and listed and listed.success ~= false then
                for _, item in ipairs(listed.items or {}) do
                    if is_str(item.id) then
                        items[#items + 1] = {
                            id = item.id,
                            title = item.title or item.name or item.id,
                            name = item.name or item.title or item.id,
                            description = item.description,
                            provider_id = entry.id,
                            provider_title = provider.title,
                            kind = item.kb_type or item.kind,
                        }
                    end
                end
            end
        end
    end

    return { success = true, providers = providers, items = items, count = #items }, nil
end

local function handler()
    local res = http.response()
    if not res then return nil, "failed to get http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local scope = security.scope()
    if not scope then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "security scope is required" })
        return
    end

    local payload, err = M.list_options(actor, scope)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json(payload)
end

M.handler = handler

return M
