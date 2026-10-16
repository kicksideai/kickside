local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local contract = require("contract")
local security = require("security")
local channel = require("channel")
local time = require("time")
local json = require("json")
local ops = require("ops")
local command = require("command")
local autoinit = require("autoinit")

local OWNER = "placement-owner"
local PARENT = "app:placement_parent"
local CHILD = "app:placement_child"
local FIXED = "app:placement_fixed"
local ROOT = "app:placement_root"

local function db(): any
    local d, err = sql.get("app:db")
    if err then error(tostring(err)) end
    return d
end

local function service(actor_id: string): any
    local policy, policy_err = security.policy("app:test_scope_policy")
    if policy_err then error(tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err then error(tostring(scope_err)) end
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err then error(tostring(actor_err)) end
    local svc, svc_err = contract.get("kickside.component:component_service")
    if svc_err then error(tostring(svc_err)) end
    local instance, open_err = svc:with_actor(actor):with_scope(scope):open()
    if open_err then error(tostring(open_err)) end
    return instance
end

local function create(kind: string, parent: string?): string
    local result, err = service(OWNER):register({ impl_id = kind, parent_id = parent })
    if err or not result.success then error(tostring(err or result.error)) end
    return result.component_id
end

local function row(id: string): any
    local d = db()
    local rows, err = d:query("SELECT * FROM kickside_components WHERE component_id=$1", { id })
    d:release()
    if err then error(tostring(err)) end
    return rows[1]
end

local function count(table_name: string): number
    local d = db()
    local rows, err = d:query("SELECT COUNT(*) AS n FROM " .. table_name)
    d:release()
    if err then error(tostring(err)) end
    return tonumber(rows[1].n) :: number
end

local function violation(result: any, kind: string, parent_kind: string)
    test.eq(result.success, false)
    test.eq(result.kind, errors.INVALID, tostring(result.error))
    test.eq(result.details.reason, "placement")
    test.eq(result.details.kind, kind)
    test.eq(result.details.parent_kind, parent_kind)
    test.is_true(tostring(result.error):find("allowed parents: " .. (kind == ROOT and "root" or PARENT), 1, true) ~= nil,
        tostring(result.error))
end

local function untouched(id: string, before: any)
    local after = row(id)
    test.eq(after.parent_id, before.parent_id)
    test.eq(after.path, before.path)
    test.eq(after.position, before.position)
    test.eq(after.updated_at, before.updated_at)
end

local run_cases = test.run_cases(function()
    test.describe("declarative placement rules", function()
        test.it("creates under the stored allowed parent kind", function()
            local parent = create(PARENT, nil)
            local child = create(CHILD, parent)
            test.eq(row(child).parent_id, parent)
        end)

        test.it("rejects a disallowed create before writing component, grants, meta, ancestry or audit", function()
            local parent = create(ROOT, nil)
            local tables = { "kickside_components", "kickside_component_access", "kickside_component_meta",
                "kickside_component_ancestor", "kickside_execution_identity_audit" }
            local before = {}
            for _, name in ipairs(tables) do before[name] = count(name) end
            local result = service(OWNER):register({ impl_id = CHILD, parent_id = parent,
                parent_kind = PARENT, meta = { title = "refused" } })
            for _, name in ipairs(tables) do test.eq(count(name), before[name]) end
            violation(result, CHILD, ROOT)
        end)

        test.it("enforces root on create and move", function()
            local parent = create(PARENT, nil)
            violation(service(OWNER):register({ impl_id = CHILD }), CHILD, "root")
            violation(service(OWNER):register({ impl_id = ROOT, parent_id = parent }), ROOT, PARENT)
            local root = create(ROOT, nil)
            local before = row(root)
            violation(service(OWNER):set_placement({ component_id = root, parent_id = parent }), ROOT, PARENT)
            untouched(root, before)
        end)

        test.it("moves between allowed parents and refuses disallowed and root moves atomically", function()
            local a, b = create(PARENT, nil), create(PARENT, nil)
            local child = create(CHILD, a)
            test.eq(service(OWNER):set_placement({ component_id = child, parent_id = b }).success, true)
            test.eq(row(child).parent_id, b)
            local before = row(child)
            local wrong = create(ROOT, nil)
            local refused = service(OWNER):set_placement({ component_id = child, parent_id = wrong })
            untouched(child, before)
            violation(refused, CHILD, ROOT)
            violation(service(OWNER):set_placement({ component_id = child, parent_id = false }), CHILD, "root")
            untouched(child, before)
        end)

        test.it("fixed blocks owner and admin parent changes and permits reorder", function()
            local a, b = create(PARENT, nil), create(PARENT, nil)
            local child = create(FIXED, a)
            local grant = service(OWNER):grant_subtree({ root_component_id = a,
                subject = { subject_id = "placement-admin", subject_type = "user" }, access_mask = 15 })
            test.eq(grant.success, true)
            test.eq(service(OWNER):grant_subtree({ root_component_id = b,
                subject = { subject_id = "placement-admin", subject_type = "user" }, access_mask = 15 }).success, true)
            for _, actor in ipairs({ OWNER, "placement-admin" }) do
                for _, target in ipairs({ b, false }) do
                    local before = row(child)
                    local result = service(actor):set_placement({ component_id = child, parent_id = target })
                    test.eq(result.success, false)
                    test.eq(result.kind, errors.INVALID)
                    test.eq(result.details.reason, "placement_fixed")
                    test.eq(result.details.kind, FIXED)
                    local detail_count = 0
                    for _ in pairs(result.details) do detail_count = detail_count + 1 end
                    test.eq(detail_count, 3)
                    local cause = result.details.cause
                    test.eq(cause.kind, result.kind); test.eq(cause.retryable, result.retryable)
                    test.eq(cause.details.reason, "placement_fixed"); test.eq(cause.details.kind, FIXED)
                    local source_count = 0
                    for _ in pairs(cause.details) do source_count = source_count + 1 end
                    test.eq(source_count, 2)
                    untouched(child, before)
                end
            end
            test.eq(service(OWNER):set_placement({ component_id = child, parent_id = a, position = "b" }).success, true)
            test.eq(service(OWNER):set_placement({ component_id = child, position = "c" }).success, true)
            test.eq(row(child).parent_id, a)
        end)

        test.it("moves an ancestor subtree while its fixed child stays attached", function()
            local a, b = create(PARENT, nil), create(PARENT, nil)
            local child = create(FIXED, a)
            test.eq(service(OWNER):set_placement({ component_id = a, parent_id = b }).success, true)
            test.eq(row(child).parent_id, a)
            test.is_true(tostring(row(child).path):find(tostring(row(b).path), 1, true) == 1)
        end)

        test.it("keeps deletion reroot and cascade teardown available for fixed children", function()
            local parent = create(PARENT, nil)
            local child = create(FIXED, parent)
            test.eq(service(OWNER):delete({ component_id = parent, child_policy = "reparent_root" }).success, true)
            test.is_nil(row(child).parent_id)
            test.eq(service(OWNER):delete({ component_id = child }).success, true)
            test.is_nil(row(child))
        end)

        test.it("enforces placement when transfer imports a portable component shell", function()
            local allowed, wrong = create(PARENT, nil), create(ROOT, nil)
            local child = create(CHILD, allowed)
            local exported = service(OWNER):export({ component_id = child })
            test.eq(exported.success, true)
            local shell, decode_err = json.decode(exported.shell)
            test.is_nil(decode_err)
            test.is_nil(shell.context._execution_identity)
            test.is_nil(shell.context._portable_input)
            test.is_nil(shell.context._rollback)
            local imported = service(OWNER):import({ shell = exported.shell, parent_id = allowed })
            test.eq(imported.success, true)
            test.eq(row(imported.component_id).parent_id, allowed)
            local before = count("kickside_components")
            local refused = service(OWNER):import({ shell = exported.shell, parent_id = wrong })
            test.eq(count("kickside_components"), before)
            violation(refused, CHILD, ROOT)
            violation(service(OWNER):import({ shell = exported.shell }), CHILD, "root")
            test.eq(count("kickside_components"), before)
        end)

        test.it("enforces the direct writer and verified declared create", function()
            local d = db()
            local tx, begin_err = d:begin()
            test.is_nil(begin_err)
            local id = uuid.v7()
            local _, err = ops.dispatch(tx, d, { type = "CREATE_COMPONENT", payload = {
                component_id = id, impl_id = CHILD, actor_id = OWNER } })
            tx:rollback()
            d:release()
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:details().reason, "placement")
            test.is_nil(row(id))
            local input = { component_id = id, impl_id = CHILD, automation_id = id,
                command_id = "install:" .. id, generation = 1, declaration_hash = "placement", rollback = {} }
            local result, declared_err = command.create_declared(input, function(request)
                return { valid = true, operator_valid = true, subject_valid = true, pins_lowered = true,
                    operator_id = OWNER, execution_subject_id = OWNER,
                    component_id = request.component_id, automation_id = request.automation_id,
                    command_id = request.command_id, generation = request.generation,
                    declaration_hash = request.declaration_hash, declaration = {}, affected_drive_keys = { "main" } }
            end)
            test.is_nil(result)
            test.is_true(errors.is(declared_err, errors.INVALID))
            test.eq(declared_err:details().reason, "placement")
            test.is_nil(row(id))
        end)

        test.it("preserves no-declaration create and move behavior", function()
            local a = create(PARENT, nil)
            local b = create(ROOT, nil)
            local plain = create("kickside.test:undeclared", a)
            test.eq(service(OWNER):set_placement({ component_id = plain, parent_id = b }).success, true)
            test.eq(service(OWNER):set_placement({ component_id = plain, parent_id = false }).success, true)
            test.is_nil(row(plain).parent_id)
        end)

        test.it("enforces provisioned kind placement through its registration path", function()
            local provisioned = nil
            for _, declaration in ipairs(autoinit.declarations()) do
                if declaration.impl_id == "app:placement_provisioned" then provisioned = declaration end
            end
            test.not_nil(provisioned)
            local id = autoinit.component_id(OWNER, assert(provisioned.class))
            local created = service(OWNER):register({ component_id = id, impl_id = provisioned.impl_id })
            test.eq(created.success, true)
            test.is_nil(row(id).parent_id)
            local parent = create(PARENT, nil)
            local refused = service(OWNER):register({ impl_id = provisioned.impl_id, parent_id = parent })
            test.eq(refused.success, false)
            test.eq(refused.kind, errors.INVALID)
            test.eq(refused.details.reason, "placement")
            test.eq(refused.details.kind, provisioned.impl_id)
            test.eq(refused.details.parent_kind, PARENT)
            test.is_true(tostring(refused.error):find("allowed parents: root", 1, true) ~= nil, tostring(refused.error))
        end)

        test.it("serializes a create under a moving ancestor on Postgres and SQLite", function()
            local a, b = create(PARENT, nil), create(PARENT, nil)
            local parent = create(PARENT, a)
            local d = db()
            local dialect = d:type()
            local tx, begin_err = d:begin()
            test.is_nil(begin_err)
            local moved, move_err = ops.dispatch(tx, d, { type = "SET_PLACEMENT", payload = {
                component_id = a, has_parent_arg = true, parent_id = b } })
            if move_err then tx:rollback(); d:release(); error(tostring(move_err)) end
            local done = channel.new(1)
            coroutine.spawn(function()
                local result, call_err = service(OWNER):register({ impl_id = CHILD, parent_id = parent })
                done:send({ result = result, err = call_err })
            end)
            local waiting = dialect ~= sql.type.POSTGRES
            if dialect == sql.type.POSTGRES then
                local monitor = db()
                for _ = 1, 500 do
                    local rows, err = monitor:query("SELECT count(*) AS n FROM pg_stat_activity"
                        .. " WHERE datname=current_database() AND wait_event_type='Lock'")
                    if err then tx:rollback(); d:release(); monitor:release(); error(tostring(err)) end
                    if tonumber(rows[1].n) > 0 then waiting = true; break end
                    time.sleep("10ms")
                end
                monitor:release()
            end
            local _, commit_err = tx:commit()
            d:release()
            test.is_nil(commit_err)
            local completed = channel.select({ done:case_receive(), time.after(10 * time.SECOND):case_receive() })
            test.eq(completed.channel, done, "create finishes after the move commits")
            test.is_true(waiting, "create waits for the moving ancestor")
            local created = completed.value
            test.is_nil(created.err)
            test.eq(created.result.success, true)
            test.eq(moved.changes_made, true)
            local child = created.result.component_id
            test.eq(row(child).parent_id, parent)
            test.is_true(tostring(row(child).path):find(tostring(row(b).path), 1, true) == 1)
            local read = db()
            local ancestors, read_err = read:query("SELECT ancestor_id FROM kickside_component_ancestor WHERE component_id=$1", { child })
            read:release()
            test.is_nil(read_err)
            test.eq(#ancestors, 4)
        end)
    end)
end)

return { run = function(options) return run_cases(options) end }
