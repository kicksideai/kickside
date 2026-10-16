local actual = require("actual")
local state = require("state")
local security = require("security")
local contract = require("contract")
local M = {
    register_thread_component = actual.register_thread_component,
    remove_thread_component = actual.remove_thread_component,
    create = actual.create,
    attach = actual.attach,
    apply_thread_declaration = actual.apply_thread_declaration,
    complete = actual.complete,
}
function M.ensure_thread_component(args: table, actor_id: string?, maintenance: boolean?,
    owner_principal: any?): (string?, boolean?, error?)
    local definition, definition_err = contract.get("kickside.component:component_service")
    if definition_err then return nil, false, definition_err end
    local actor, actor_err = security.new_actor(state.winner_actor, { security_groups = {} })
    if actor_err then return nil, false, actor_err end
    local service, open_err = definition:with_actor(actor):with_scope(security.scope()):open()
    if open_err then return nil, false, open_err end
    local winner, winner_err = service:register({ component_id = args.component_id, impl_id = state.winner_kind })
    if winner_err then return nil, false, winner_err end
    if not winner or winner.success ~= true then
        return nil, false, errors.new({ message = "first-touch winner registration fails: " .. tostring(winner and winner.error), kind = errors.INTERNAL })
    end
    return actual.ensure_thread_component(args, actor_id, maintenance, owner_principal)
end
return M
