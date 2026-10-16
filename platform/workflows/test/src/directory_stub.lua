-- Harness implementation of the principal-directory contract. A workflow test
-- actor is the only user provisioned by this lightweight fixture, so validation
-- remains meaningful without pulling the production users persistence into the
-- workflow engine integration harness.
local security = require("security")

local M = {}

local function current_actor_id(): string
    local actor = security.actor()
    return actor and tostring(actor:id() or "") or ""
end

local function current_principal(): any?
    local id = current_actor_id()
    if id == "" then return nil end
    return { type = "user", id = id, label = id, sublabel = "workflow test actor" }
end

function M.search(input: any): any
    input = type(input) == "table" and input or {}
    local principal = current_principal()
    if not principal then return { principals = {} } end

    local query = string.lower(tostring(input.query or ""))
    if query ~= "" and not string.lower(principal.id):find(query, 1, true) then
        return { principals = {} }
    end
    return { principals = { principal } }
end

function M.resolve(input: any): any
    input = type(input) == "table" and input or {}
    local actor_id = current_actor_id()
    local principals = {}
    for _, ref in ipairs(input.refs or {}) do
        if type(ref) == "table" and ref.type == "user" and ref.id == actor_id then
            principals[#principals + 1] = {
                type = "user", id = actor_id, label = actor_id,
                sublabel = "workflow test actor",
            }
        end
    end
    return { principals = principals }
end

function M.exists(input: any): any
    input = type(input) == "table" and input or {}
    local kind = input.type or "user"
    return {
        exists = kind == "user"
            and type(input.id) == "string"
            and input.id ~= ""
            and input.id == current_actor_id(),
    }
end

-- groups answers the live memberships of the one user this harness directory
-- holds, the current test actor: the security groups its actor carries.
function M.groups(input: any): any
    local actor = security.actor()
    if type(input) ~= "table" or not actor or input.id ~= current_actor_id() then return { active = false, groups = {} } end
    local meta = actor:meta()
    local groups = type(meta) == "table" and type(meta.security_groups) == "table" and meta.security_groups or {}
    return { active = true, groups = groups }
end

return M
