-- Engine fixtures for the execution-identity control suites: real drive,
-- command and op rows in the automation DB on both engines, with the component
-- service, funcs builder and caller frame as stubbed seams.

local sql = require("sql")
local drive = require("drive")
local command = require("command")
local automation_types = require("types")
local execution_identity = require("execution_identity")
local automation_test_engine = require("automation_test_engine")

type Map = { [string]: any }

local M = {}

M.ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8 }

function M.open_db(): sql.DB
    local db, err = sql.get(automation_types.db_id())
    if err or not db then error("control test: db connect failed: " .. tostring(err)) end
    return db :: sql.DB
end

function M.in_tx(fn: (sql.Transaction) -> (any?, error?)): (any?, error?)
    local db = M.open_db()
    local tx = db:begin()
    local result, err = fn(tx :: sql.Transaction)
    if err then tx:rollback() else tx:commit() end
    db:release()
    return result, err
end

function M.seed_drive(automation_id: string, drive_key: string, fields: Map?)
    local _, err = M.in_tx(function(tx)
        local spec: Map = { automation_id = automation_id, drive_key = drive_key, source_kind = "timer",
            applied = {}, applied_hash = "seed" }
        for k, v in pairs(fields or {}) do spec[k] = v end
        return drive.insert_tx(tx, spec)
    end)
    if err then error("seed drive: " .. tostring(err)) end
end

function M.set_drive(automation_id: string, drive_key: string, columns: Map)
    local db = M.open_db()
    local _, err = sql.builder.update(drive.TABLE):set_map(columns)
        :where("automation_id = ?", automation_id):where("drive_key = ?", drive_key)
        :run_with(db):exec()
    db:release()
    if err then error("update drive: " .. tostring(err)) end
end

function M.pending(automation_id: string): Map?
    local db = M.open_db()
    local row, err = command.pending(db, automation_id)
    db:release()
    if err then error(tostring(err)) end
    return row
end

function M.op(automation_id: string, request_id: string): Map?
    local db = M.open_db()
    local row, err = command.read_op(db, automation_id, request_id)
    db:release()
    if err then error(tostring(err)) end
    return row
end

function M.actor_frame(actor_id: string?): Map
    return {
        actor = function(): any
            if not actor_id then return nil end
            return { id = function(): any return actor_id end, meta = function(): any return {} end }
        end,
        scope = function(): any return {} end,
    }
end

type ComponentSpy = { sets: { Map }, access: { Map } }
M.ComponentSpy = ComponentSpy

-- component_stub models the component service: validate_access answers the
-- caller's mask from `levels`, set_execution_identity records the call and
-- answers `set_result`.
function M.component_stub(spy: ComponentSpy, levels: { [string]: integer }, opts: Map?): Map
    local o = opts or {}
    local stored: Map? = nil
    -- The declaration fence the component holds: the hash the drives applied.
    local declaration_hash = o.declaration_hash or "seed"
    return {
        ACCESS = M.ACCESS,
        validate_access = function(component_id: string, mask: integer): (integer, any)
            spy.access[#spy.access + 1] = { component_id = component_id, mask = mask }
            local level = levels[component_id] or 0
            if math.floor(level / mask) % 2 == 1 then return level, nil end
            return 0, errors.new({ message = "insufficient access to component", kind = errors.PERMISSION_DENIED })
        end,
        get_private_context = function(_component_id: string): (any?, any)
            return { _portable_input = o.declaration or { title = "Declared" } }, nil
        end,
        set_execution_identity = function(component_id: string, principal: Map, request_id: string, expected: number, command_generation: number?): (any?, any)
            spy.sets[#spy.sets + 1] = { component_id = component_id, principal = principal, request_id = request_id,
                expected = expected }
            if o.set_error then return nil, o.set_error end
            stored = { component_id = component_id, principal = principal, identity_generation = expected + 1,
                identity_hash = "identity:" .. request_id, declaration_hash = declaration_hash,
                declaration_command_generation = command_generation, declaration_command_id = request_id }
            return { component_id = component_id, principal = principal, identity_generation = expected + 1,
                request_id = request_id, changes_made = true }, nil
        end,
        get_identity_receipt = function(): (any?, any)
            if o.receipt_error then return nil, o.receipt_error end
            if o.durable_mismatch and stored then return { component_id = stored.component_id, principal = { kind = "user", id = "other" },
                identity_generation = stored.identity_generation, identity_hash = stored.identity_hash,
                declaration_hash = stored.declaration_hash }, nil end
            return stored, nil
        end,
        list_system = function(filter: Map): (any?, any)
            if o.list_error then return nil, o.list_error end
            return { { component_id = filter.component_ids[1], impl_id = "kickside.test:kind", meta = {} } }, nil
        end,
        query = function(args: Map): (any?, any)
            if o.query then return o.query(args) end
            return {}, nil
        end,
    }
end

-- funcs_stub mirrors the funcs builder the identity command executor calls: the
-- identity writer entry writes through the component stub's
-- set_execution_identity, as the real writer does under the operator's frame.
local IDENTITY_WRITER = "kickside.automation:identity_writer"
function M.funcs_stub(component: Map): Map
    return {
        new = function(): any
            return {
                call = function(_self: any, target: string, args: Map): (any?, any)
                    if target ~= IDENTITY_WRITER then error("unexpected funcs call " .. target) end
                    return component.set_execution_identity(args.component_id, args.principal, args.request_id,
                        args.expected_identity_generation, args.command_generation)
                end,
            }, nil
        end,
    }
end

function M.engine_with(actor_id: string?, component: Map, extra: Map?): any
    local captured_identity: Map = {}
    for name, method in pairs(execution_identity) do captured_identity[name] = method end
    captured_identity.capture = function(input)
        local principal, err = execution_identity.principal_of_key(actor_id)
        if err then return nil, err end
        return {version = 2, principal = principal, authorized_by = principal,
            component_id = input.component_id, captured_at = "2026-10-10T00:00:00Z"}, nil
    end
    local overrides: Map = { security = M.actor_frame(actor_id), component = component, funcs = M.funcs_stub(component),
        execution_identity = captured_identity }
    for k, v in pairs(extra or {}) do overrides[k] = v end
    return (select(1, automation_test_engine.new(overrides)))
end


return M
