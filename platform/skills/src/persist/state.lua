-- Skill read model. Operational reads load only the last committed projection
-- body through the read-model contract. Event history and cursor state are not
-- observable here, and this path can never advance a projection.

local errors = require("errors")
local contract = require("contract")
local security = require("security")

local types = require("types")

local M = {}
local READ_MODELS = "kickside.core:read_models"

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function read_models(): (any?, error?)
    local actor = security.actor()
    if not actor or trim(actor:id()) == "" then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "an authenticated actor is required" }) end
    local scope = security.scope()
    if not scope then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "a security scope is required" }) end
    local def, derr = contract.get(READ_MODELS)
    if derr or not def then return nil, errors.wrap(derr or errors.new({ kind = errors.UNAVAILABLE, message = "read-model contract missing" }), "read-model contract unavailable") end
    local instance, oerr = (def :: any):with_actor(actor):with_scope(scope):open()
    if oerr or not instance then return nil, errors.wrap(oerr or errors.new({ kind = errors.UNAVAILABLE, message = "read-model instance missing" }), "read-model open failed") end
    return instance, nil
end

function M.thread_for(skill_id: string): (string?, error?)
    skill_id = trim(skill_id)
    if skill_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end
    return skill_id, nil
end

function M.read_body(skill_id: string): (any, error?)
    skill_id = trim(skill_id)
    if skill_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end
    local models, merr = read_models()
    if not models then return nil, merr end
    local result, rerr = models:get({
        owner_id = skill_id,
        kind = types.PROJECTION_KIND,
        projection_key = "default",
    })
    if rerr then return nil, rerr end
    if type(result) ~= "table" or type((result :: any).body) ~= "table" then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "skill read model is missing" })
    end
    local body = (result :: any).body
    if type(body.versions) ~= "table" or type(body.current_version) ~= "number" then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "skill read model is malformed" })
    end
    return body, nil
end

function M.body_for(skill_id: string): (any, error?)
    return M.read_body(skill_id)
end

function M.versions(body: any): { any }
    local raw = type(body) == "table" and type((body :: any).versions) == "table" and (body :: any).versions or {}
    local out: { any } = {}
    for _, value in ipairs(raw :: { any }) do out[#out + 1] = value end
    table.sort(out, function(a, b) return (tonumber(a.version) or 0) < (tonumber(b.version) or 0) end)
    return out
end

function M.current_version(body: any): integer
    local current = type(body) == "table" and tonumber((body :: any).current_version) or nil
    if current then return current :: integer end
    local versions = M.versions(body)
    if #versions == 0 then return 0 end
    return (tonumber(versions[#versions].version) or 0) :: integer
end

function M.pick(body: any, selector: any): (any?, error?)
    local versions = M.versions(body)
    if #versions == 0 then return nil, errors.new({ kind = errors.NOT_FOUND, message = "skill has no versions" }) end
    if selector == nil then return versions[#versions], nil end
    local wanted = tonumber(selector)
    if not wanted then return nil, errors.new({ kind = errors.INVALID, message = "version must be a number" }) end
    for _, version in ipairs(versions) do
        if (tonumber(version.version) or 0) == wanted then return version, nil end
    end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "version not found" })
end

return M
