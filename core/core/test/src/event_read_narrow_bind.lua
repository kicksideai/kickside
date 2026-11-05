local contract = require("contract")
local security = require("security")
local sql = require("sql")
local crud = require("crud")
local declaration = require("event_declaration")
local M = {}
function M.bind(args: table): (any?, error?)
    if args.operation == "level" then return declaration.load(args.impl_id, args.required) end
    if args.operation == "register" then
        local service = assert(assert(contract.get("kickside.component:component_service"))
            :with_actor(security.actor()):with_scope(security.scope()):open())
        return service:register({component_id = args.id, impl_id = args.impl_id,
            thread = args.thread and {thread_class = "narrow", attrs = "{}"} or nil})
    end
    local db, db_err = sql.get("app:db")
    if db_err then return nil, db_err end
    local value, err = crud.create(db, {component_id = args.id, impl_id = args.impl_id,
        trusted_audit = args.mode == "trusted_audit"}, security.actor():id(), {system = true}, nil,
        args.mode == "maintenance")
    db:release()
    return value, err
end
return M
