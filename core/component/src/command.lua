-- Privileged component commands. External validation and identity preparation
-- happen before opening a component transaction; the persist functions receive
-- its tx.
local sql = require("sql")
local contract = require("contract")
local ops = require("component_ops")
local component_lifecycle = require("component_lifecycle")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")

local M = {}

local function failure(message: string, kind: string, error_kind: string?): error
    return (errors.new({ message = message, kind = kind,
        details = error_kind and { error_kind = error_kind } or nil }) :: error)
end

function M.response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "component command response is invalid", details = {code = "component_command_response", field = field}})
end

function M.with_component_tx(work: (sql.Transaction, sql.DB) -> (any?, error?)): (any?, error?)
    local db, db_err = sql.get(ops.db_id())
    if db_err then return nil, errors.wrap(db_err, "component database unavailable") end
    if not db then return nil, M.response_error("database") end
    local tx, begin_err = db:begin()
    if begin_err then begin_err = errors.wrap(begin_err, "component transaction failed") end
    if not begin_err and type(tx) ~= "table" and type(tx) ~= "userdata" then begin_err = M.response_error("transaction") end
    if begin_err then
        return nil, error_envelope.cleanup(function(): (any, error?) return db:release() end, begin_err, "release component command database")
    end
    local result, err = work(tx :: sql.Transaction, db)
    if result == nil and not err then err = M.response_error("result") end
    if err then
        err = error_envelope.cleanup(function(): (any, error?) return tx:rollback() end, err, "rollback component command")
        return nil, error_envelope.cleanup(function(): (any, error?) return db:release() end, err, "release component command database")
    end
    local committed, commit_err = tx:commit()
    if not commit_err and committed ~= true then commit_err = M.response_error("commit") end
    commit_err = error_envelope.cleanup(function(): (any, error?) return db:release() end, commit_err, "release component command database")
    if commit_err then return nil, committed_error.new(commit_err) end
    return result, nil
end

local DECLARATION_OWNER = "kickside.component:declaration_owner"

-- The declaration owner's confirmation of a pending set_execution_identity command, through the
-- contract the owner module binds.
local function verify_with_owner(request: any): (any?, error?)
    local def, def_err = contract.get(DECLARATION_OWNER)
    if def_err then return nil, errors.wrap(def_err, "declaration owner contract unavailable") end
    if not def then return nil, M.response_error("owner_contract") end
    local instance, open_err = (def :: any):open()
    if open_err then return nil, errors.wrap(open_err, "declaration owner unavailable") end
    if not instance then return nil, M.response_error("owner_instance") end
    local confirmed, call_err = (instance :: any):verify_identity_command(request)
    if call_err then
        return nil, errors.wrap(call_err, "declaration owner verification failed")
    end
    return confirmed, nil
end

-- SET_EXECUTION_IDENTITY {component_id, principal, request_id,
-- expected_identity_generation}. The authenticated caller authorizes the
-- selection: ADMIN on the component plus may_act_as for the requested
-- principal, fenced by the identity generation with an immutable audit row.
-- A declaration-fenced component additionally needs its declaration owner to
-- confirm the request as its pending set_execution_identity command (OWNERSHIP A16). Caller
-- identity, act-as and owner checks run before the transaction opens.
function M.set_execution_identity(component_id: string, principal: any, request_id: string,
    expected_identity_generation: number): (any?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, failure("component ID is required", errors.INVALID, "declaration")
    end
    local db, db_err = sql.get(ops.db_id())
    if db_err then return nil, errors.wrap(db_err, "component database unavailable") end
    if not db then return nil, M.response_error("database") end
    local owner_id, owner_err = ops.declaration_owner(db, component_id)
    owner_err = error_envelope.cleanup(function(): (any, error?) return db:release() end, owner_err, "release declaration owner database")
    if owner_err then return nil, owner_err end
    local owner: any = nil
    if owner_id ~= nil then owner = { automation_id = owner_id, verify = verify_with_owner } end
    local token, prepare_err = ops.prepare_identity({
        component_id = component_id,
        principal = principal,
        request_id = request_id,
        expected_identity_generation = expected_identity_generation,
    }, owner)
    if prepare_err then return nil, prepare_err end
    return M.with_component_tx(function(tx: sql.Transaction, _db: sql.DB): (any?, error?)
        return ops.set_execution_identity_tx(tx, token)
    end)
end

-- The automation caller reserves its command, validates operator and subject,
-- lowers new-source pins, then invokes this as its framework system actor.
-- `verify` reads that durable command outside this module's component tx.
function M.apply_declaration(input: any, verify: any): (any?, error?)
    local token, prepare_err = ops.prepare_declaration(input, verify)
    if prepare_err then return nil, prepare_err end
    return M.with_component_tx(function(tx: sql.Transaction, _db: sql.DB): (any?, error?)
        return ops.apply_declaration_tx(tx, token)
    end)
end

-- The one privileged create path for an automation install (design v4 §6.3,
-- OWNERSHIP A14). The automation engine reserves its install command, then
-- invokes this as its framework system actor; `verify` reads that durable
-- command outside the component transaction. input = { component_id,
-- impl_id, parent_id?, context?, meta?, rollback, automation_id, command_id,
-- generation = 1, declaration_hash }. One component transaction creates the
-- component with the operator as creator (initial ADMIN and identity),
-- _portable_input at declaration generation 1, the rollback chain, and the
-- lifecycle created event.
function M.create_declared(input: any, verify: any): (any?, error?)
    local token, prepare_err = ops.prepare_creation(input, verify)
    if prepare_err then return nil, prepare_err end
    local result, err = M.with_component_tx(function(tx: sql.Transaction, db: sql.DB): (any?, error?)
        local created, create_err = ops.create_declared_tx(tx, db, token)
        if create_err or not created then return nil, create_err end
        local c = created :: any
        if c.existing then
            return { component_id = c.component_id, impl_id = c.impl_id, parent_id = c.parent_id, success = true, changes_made = false }, nil
        end
        local parent_impl_id: string? = nil
        if c.parent_id ~= nil then
            local parent, parent_err = ops.component_summary_tx(tx, c.parent_id)
            if parent_err then return nil, parent_err end
            if parent then parent_impl_id = tostring((parent :: any).impl_id) end
        end
        local dbtype, dbtype_err = db:type()
        if dbtype_err then return nil, errors.wrap(dbtype_err, "failed to resolve database type") end
        if dbtype == nil then return nil, M.response_error("database_type") end
        local lifecycle_err = component_lifecycle.created({
            tx = tx,
            dbtype = tostring(dbtype),
            component_id = c.component_id,
            impl_id = c.impl_id,
            parent_id = c.parent_id,
            parent_impl_id = parent_impl_id,
            actor_id = c.operator_id,
            meta = c.meta,
        })
        if lifecycle_err then return nil, lifecycle_err end
        return { component_id = c.component_id, impl_id = c.impl_id, parent_id = c.parent_id, success = true, changes_made = true }, nil
    end)
    if err or not result then return nil, err end
    if (result :: any).changes_made then
        local committed_err = component_lifecycle.committed()
        if committed_err then return nil, committed_error.new(committed_err) end
    end
    return result, nil
end

return M
