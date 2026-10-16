-- GET /api/v1/transfer/exportable[?q=...]
--
-- The picker's data source. Lists the CURRENT actor's own components, filtered to
-- those whose impl binding is exportable — i.e. it declares meta.portable_schema
-- (shell-exportable) OR implements kickside.contract:portable (data-bearing). This
-- is a capability check on the binding, not a tag. Default actor-scoped read.

local http = require("http")
local security = require("security")
local registry = require("registry")
local contract = require("contract")
local consts = require("consts")

local SERVICE = "kickside.component:component_service"
local PORTABLE_CONTRACT = consts.PORTABLE_CONTRACT

local function meta_of(entry: any): any
    if type(entry) ~= "table" then return {} end
    return (entry :: any).meta or ((entry :: any).data and (entry :: any).data.meta) or {}
end

-- impl_ids whose binding is exportable. has_data = the binding also implements the
-- portable data contract (it owns backing tables, e.g. a KB), vs a shell-only impl.
local function exportable_impls(): { [string]: any }
    local out: { [string]: any } = {}
    local entries = registry.find({ [".kind"] = "contract.binding" })
    for _, e in ipairs((entries or {}) :: { any }) do
        local m = meta_of(e)
        local data: any = (e :: any).data or e
        local has_data = false
        if type(data.contracts) == "table" then
            for _, c in ipairs(data.contracts :: { any }) do
                if (c :: any).contract == PORTABLE_CONTRACT then
                    has_data = true
                    break
                end
            end
        end
        if type(m.portable_schema) == "table" or has_data then
            out[(e :: any).id] = { has_data = has_data }
        end
    end
    return out
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    local scope = security.scope()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local impls = exportable_impls()

    local def, derr = contract.get(SERVICE)
    if not def then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "service: " .. tostring(derr) })
        return
    end
    local inst, open_err = def:with_actor(actor):with_scope(scope):open()
    if open_err or not inst then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "open: " .. tostring(open_err) })
        return
    end
    local page, query_err = inst:query({})
    if query_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "query: " .. tostring(query_err) })
        return
    end

    local rows: any = (type(page) == "table" and (page :: any).components) or page or {}
    local q = string.lower(tostring(req:query("q") or ""))

    local out: { any } = {}
    for _, comp in ipairs(rows :: { any }) do
        local impl_id: any = (comp :: any).impl_id
        local exp: any = (type(impl_id) == "string") and impls[impl_id] or nil
        if exp then
            local m: any = (comp :: any).meta or {}
            local title: any = m.title or m.name or (comp :: any).component_id
            if q == "" or (type(title) == "string" and string.find(string.lower(title :: string), q, 1, true) ~= nil) then
                out[#out + 1] = {
                    component_id = (comp :: any).component_id,
                    impl_id = impl_id,
                    title = title,
                    class = m.class,
                    icon = m.icon,
                    has_data = exp.has_data == true,
                }
            end
        end
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, count = #out, components = out })
end

return { handler = handler }
