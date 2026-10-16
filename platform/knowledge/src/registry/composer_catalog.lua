local util = require("util")
local contract = require("contract")
local security = require("security")

local M = {}

type Map = { [string]: any }

local KNOWLEDGE_BASES_CONTRACT = "kickside.knowledge:knowledge_bases"

local trim = util.trim

local function open_knowledge_bases(): (any?, string?)
    local def, err = contract.get(KNOWLEDGE_BASES_CONTRACT)
    if err or not def then return nil, "knowledge_bases contract unavailable: " .. tostring(err) end
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then return nil, "security actor and scope are required" end
    local inst, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not inst then return nil, "knowledge_bases open failed: " .. tostring(open_err) end
    return inst, nil
end

local function list_kbs(deps: any): (any, any?)
    local list = type(deps) == "table" and (deps :: Map).list or nil
    if type(list) == "function" then return (list :: any)({}) end
    local inst, err = open_knowledge_bases()
    if not inst then return nil, err end
    return (inst :: any):list({})
end

-- knowledge_bases() is a composer catalog projection. It returns rows:
-- { id, title, description }.
function M.knowledge_bases(_args: any, deps: any): (any, any?)
    local kbs, err = list_kbs(deps)
    if err then return nil, "list knowledge bases: " .. tostring(err) end
    local rows: { any } = {}
    for _, kb in ipairs((kbs or {}) :: { any }) do
        local meta = type((kb :: Map).meta) == "table" and ((kb :: Map).meta :: Map) or {}
        local id = trim((kb :: Map).component_id)
        if id ~= "" then
            rows[#rows + 1] = {
                id = id,
                title = trim(meta.title) ~= "" and trim(meta.title) or id,
                description = trim(meta.comment),
            }
        end
    end
    table.sort(rows, function(a: any, b: any): boolean
        local at = tostring((a :: Map).title or "")
        local bt = tostring((b :: Map).title or "")
        if at ~= bt then return at < bt end
        return tostring((a :: Map).id or "") < tostring((b :: Map).id or "")
    end)
    return rows, nil
end

return M
