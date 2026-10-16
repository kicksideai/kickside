local http = require("http")
local security = require("security")
local funcs = require("funcs")
local env = require("env")
local hash = require("hash")
local registry = require("registry")

local function handler()
    local args = assert(http.request():body_json())
    local result, lookup_err = funcs.call("kickside.users.binding:subject_lookup", {
        subject_id = args.subject_id, authority_only = true,
    })
    local store = assert(security.token_store("kickside.users.security:tokens"))
    local actor, scope, validation_err = store:validate(args.token)
    store:close()
    local native = {}
    local member = assert(security.new_actor(args.subject_id, {}))
    local group = assert(security.named_scope(args.group))
    for _, id in ipairs(args.policies or {}) do
        local policy = assert(security.policy(id))
        local entry = assert(registry.get(id))
        local resources = entry.data.policy.resources
        if type(resources) == "string" then resources = {resources} end
        for _, selector in ipairs(resources) do
            local resource = selector
            native[#native + 1] = {id = id, resource = resource,
                direct = policy:evaluate(member, "access", resource),
                composed = group:evaluate(member, "access", resource),
                foreign = policy:evaluate(member, "access", "unrelated.module:read.endpoint"),
                action = policy:evaluate(member, "delete", resource),
            }
        end
    end
    local signing_material, material_err = env.get("ENCRYPTION_KEY")
    http.response():write_json({
        environment_digest = signing_material and select(1, hash.sha256(signing_material)) or nil,
        environment_error = material_err and tostring(material_err) or nil,
        lookup = result,
        native = native,
        lookup_error = lookup_err and tostring(lookup_err) or nil,
        validation_error = validation_err and tostring(validation_err) or nil,
        actor_id = actor and actor:id() or nil,
        valid = actor ~= nil and scope ~= nil,
    })
end

return {handler = handler}
