-- The component contract `adopt` method. An instance operator (a user
-- principal whose frame holds component.adopt on the components resource)
-- takes a component that no principal holds access to. A confined identity,
-- a framework maintenance actor, a group or service frame, and a frame
-- without the capability are refused before any read.
local sql = require("sql")
local security = require("security")
local component_command = require("component_command")
local envelope = require("envelope")
local component_types = require("component_types")
local access_subjects = require("access_subjects")
local adoption = require("adoption")
local execution_identity = require("execution_identity")

local function denied(message: string): any
    return envelope.fail(message, errors.PERMISSION_DENIED)
end

local function handle(request_dto)
    if type(request_dto) ~= "table" then
        return envelope.fail("Invalid request: must be a table", errors.INVALID)
    end
    local component_id = request_dto.component_id
    if type(component_id) ~= "string" or component_id == "" then
        return envelope.fail("component_id is required and must be a non-empty string", errors.INVALID)
    end

    local actor = security.actor()
    if not actor then return denied("No authenticated actor found") end
    local actor_id = actor:id()
    if type(actor_id) ~= "string" or actor_id == "" then return denied("Invalid actor ID") end
    if execution_identity.is_maintenance_key(actor_id) then
        return denied("framework maintenance actors never adopt components")
    end
    local adopter, key_err = execution_identity.principal_of_key(actor_id)
    if key_err or not adopter or adopter.kind ~= execution_identity.KIND.USER then
        return denied("only a user principal adopts components")
    end
    local filter, filter_err = access_subjects.access_filter(actor_id)
    if filter_err then return envelope.from_error(filter_err) end
    if filter ~= nil then return denied("a confined identity cannot adopt components") end
    if security.can(component_types.ADOPT_ACTION, component_types.AUTHZ.COMPONENTS_RESOURCE) ~= true then
        return denied("adopting a component requires the " .. component_types.ADOPT_ACTION .. " capability")
    end

    local adopted, adopt_err = component_command.with_component_tx(function(tx: sql.Transaction, db: sql.DB): (any?, error?)
        return adoption.adopt_tx(tx, db, component_id, adopter)
    end)
    if adopt_err then return envelope.from_error(adopt_err, "Failed to adopt component") end
    return {
        component_id = adopted.component_id,
        adopted_by = adopted.adopted_by,
        identity_generation = adopted.identity_generation,
        request_id = adopted.request_id,
        prior_access = adopted.prior_access,
        success = true,
    }
end

return { handle = handle }
