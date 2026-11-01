-- Transaction-scoped component command dispatcher. Grants and access checks
-- live behind access_ops, ancestry behind placement; context, metadata,
-- placement and delete writes are split into their own modules. The caller owns
-- commit and rollback.

local sql = require("sql")
local time = require("time")
local component_types = require("component_types")
local context_ops = require("context_ops")
local declaration_ops = require("declaration_ops")
local declaration_fence = require("declaration_fence")
local meta_ops = require("meta_ops")
local delete_ops = require("delete_ops")
local placement_ops = require("placement_ops")
local access_ops = require("access_ops")
local declared_create = require("declared_create")

-- A pooled connection or an open transaction.
type Executor = sql.DB | sql.Transaction

-- Define command handlers for component operations.
type Handler = (Executor, Executor, component_types.Command) -> (component_types.CommandResult?, error?)
local handlers: { [string]: Handler } = {}

handlers[component_types.COMMAND_TYPES.CREATE_COMPONENT] = function(tx: Executor, db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    return placement_ops.create_component(tx, db, command)
end

handlers[component_types.COMMAND_TYPES.DELETE_COMPONENT] = function(tx: Executor, db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    return delete_ops.delete_component(tx, db, command)
end

handlers[component_types.COMMAND_TYPES.SET_META] = meta_ops.set_meta

-- Generic context commands are handled by context_ops, which guards every
-- runtime-owned key before touching SQL.
handlers[component_types.COMMAND_TYPES.SET_CONTEXT] = function(tx: Executor, _db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    return context_ops.set_context(tx, command.payload or {})
end

handlers[component_types.COMMAND_TYPES.PATCH_CONTEXT] = function(tx: Executor, _db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    return context_ops.patch_context(tx, command.payload or {})
end

handlers[component_types.COMMAND_TYPES.GRANT_ACCESS] = access_ops.grant_access
handlers[component_types.COMMAND_TYPES.REVOKE_ACCESS] = access_ops.revoke_access

handlers[component_types.COMMAND_TYPES.SET_PLACEMENT] = function(tx: Executor, db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    return placement_ops.set_placement(tx, db, command)
end

-- SET_EXECUTION_IDENTITY is not a generic context write: it carries a
-- validated one-use token from prepare_identity. A forged payload without
-- that token refuses before any read.
handlers["SET_EXECUTION_IDENTITY"] = function(tx: Executor, _db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    local payload = command.payload or {}
    local result, err = context_ops.set_execution_identity_tx(tx, (payload :: any).identity_token)
    return (result :: component_types.CommandResult?), err
end

-- Dispatch a command to its handler. Returns a NOT_FOUND error for an unknown
-- command type so callers never index a nil handler.
local function dispatch(tx: Executor, db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    local handler = handlers[command.type]
    if not handler then
        return nil, (errors.new({ message = "no handler for command type: " .. tostring(command.type), kind = errors.NOT_FOUND }) :: error)
    end
    return handler(tx, db, command)
end

local function component_summary_tx(tx: Executor, component_id: string?): (any?, error?)
    if not component_id or component_id == "" then
        return nil, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    local rows, err = sql.builder.select("component_id", "impl_id", "parent_id", "position", "path")
        :from(component_types.TABLES.COMPONENTS)
        :where("component_id = ?", component_id)
        :limit(1)
        :run_with(tx):query()
    if err then
        return nil, errors.wrap(err, "failed to read component summary")
    end
    return rows and rows[1] or nil, nil
end

-- The existence fence a consumer's write to a component's backing data runs
-- behind, inside the consumer's own transaction: the component must exist and
-- no delete of it may have begun. On PostgreSQL the component row is locked for
-- share until that transaction ends, so a delete marking the component waits
-- for a write already past the fence, and a write after the mark is refused.
-- SQLite serializes every transaction on its one connection. The transaction
-- must be on the component database; db_id names the database it was begun on.
local function fence(tx: Executor, component_id: string, db_id: string): error?
    if type(component_id) ~= "string" or component_id == "" then
        return (errors.new({ message = "fence: component_id is required", kind = errors.INVALID }) :: error)
    end
    local home = component_types.db_id()
    if db_id ~= home then
        return (errors.new({
            message = "fence: the transaction must be on the component database " .. tostring(home) .. ", not " .. tostring(db_id),
            kind = errors.INVALID,
        }) :: error)
    end
    local dialect, dialect_err = (tx :: any):db_type()
    if dialect_err then
        return errors.wrap(dialect_err, "fence: component dialect unavailable")
    end
    if type(dialect) ~= "string" or dialect == "" then
        return errors.new({ message = "fence: component dialect unavailable", kind = errors.INTERNAL,
            retryable = false, details = {code = "component_dialect", field = "db.type"} })
    end
    local query = sql.builder.select("deleting_at"):from(component_types.TABLES.COMPONENTS)
        :where("component_id = ?", component_id)
    if dialect == sql.type.POSTGRES then query = query:suffix("FOR SHARE") end
    local rows, err = query:run_with(tx):query()
    if err then
        return errors.wrap(err, "fence: component lookup failed")
    end
    if type(rows) ~= "table" or #rows == 0 or (rows[1] :: any).deleting_at ~= nil then
        return (errors.new({ message = "component " .. component_id .. " does not exist or is being deleted", kind = errors.NOT_FOUND }) :: error)
    end
    return nil
end

-- Claim the delete mark and its attempt lease atomically, or abandon that lease.
local function mark_deleting_tx(tx: Executor, component_id: string, deleting: boolean, lease_token: string): (error?, boolean?)
    local statement: string
    local params: { any }
    if deleting then
        local now = time.now():utc()
        statement = "UPDATE kickside_components SET deleting_at=COALESCE(deleting_at,$1),lease_token=$2,lease_until=$3"
            .. " WHERE component_id=$4 AND (lease_until IS NULL OR lease_until < $1)"
        params = {now:format_rfc3339(), lease_token,
            now:add(component_types.DELETE_LEASE_SECONDS * time.SECOND):format_rfc3339(), component_id}
    else
        statement = "UPDATE kickside_components SET deleting_at=NULL,lease_token=NULL,lease_until=NULL"
            .. " WHERE component_id=$1 AND lease_token=$2"
        params = {component_id, lease_token}
    end
    local result, err = tx:execute(statement, params)
    if err then return errors.wrap(err, "delete mark failed") end
    if not result or tonumber(result.rows_affected) == nil then
        return errors.new({message = "delete mark returned no affected-row count", kind = errors.INTERNAL,
            retryable = false, details = {code = "component_delete_response", field = "mark.rows_affected"}})
    end
    if tonumber(result.rows_affected) == 0 and not deleting then return component_types.lease_lost_error() end
    return nil, tonumber(result.rows_affected) == 1
end

return {
    ACCESS = component_types.ACCESS,
    fence = fence,
    mark_deleting_tx = mark_deleting_tx,
    COMMAND_TYPES = component_types.COMMAND_TYPES,
    db_id = component_types.db_id,
    DEFAULTS = component_types.DEFAULTS,
    handlers = handlers,
    dispatch = dispatch,
    check_user_access = access_ops.check_user_access,
    effective_mask_query = access_ops.effective_mask_query,
    reaching_grants = access_ops.reaching_grants,
    principal_masks = access_ops.principal_masks,
    validate_delete_tx = delete_ops.validate_delete_tx,
    component_summary_tx = component_summary_tx,
    set_public_meta = meta_ops.set_public_meta,
    raise_meta_floor = meta_ops.raise_meta_floor,
    public_meta_tx = meta_ops.public_meta_tx,
    lock_component_tx = meta_ops.lock_component_tx,
    context_revision_tx = context_ops.context_revision_tx,
    check_context_revision = context_ops.check_context_revision,
    apply_subtree_access = access_ops.apply_subtree_access,
    list_access = access_ops.list_access,
    component_owner = access_ops.component_owner,
    component_owner_record = access_ops.component_owner_record,
    set_execution_identity_tx = context_ops.set_execution_identity_tx,
    prepare_identity = context_ops.prepare_identity,
    declaration_owner = declaration_fence.owner,
    apply_declaration_tx = declaration_ops.apply_declaration_tx,
    prepare_declaration = declaration_ops.prepare_declaration,
    prepare_creation = declaration_ops.prepare_creation,
    create_declared_tx = declared_create.create_tx,
    redact_context = context_ops.redact,
}
