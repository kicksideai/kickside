-- Private-context revisions through the component_service contract and the client
-- helpers. Readers that return private context report its revision; every context
-- write advances it.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local contract = require("contract")
local security = require("security")
local funcs = require("funcs")
local json = require("json")
local channel = require("channel")
local time = require("time")
local ops = require("ops")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local PROBE = "app:context_revision_probe"

local function define_tests()
    test.describe("Component private-context revision", function()
        local owner = "rev-owner-" .. uuid.v4():sub(1, 8)
        local impl = "kickside.test:context_revision"

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function owner_actor()
            return security.new_actor(owner, { security_groups = {} })
        end

        local function open_as_owner()
            local svc, err = contract.get(COMPONENT_SERVICE)
            if err or not svc then error("component_service unavailable: " .. tostring(err)) end
            local inst, oerr = svc:with_actor(owner_actor()):with_scope(test_scope()):open()
            if oerr or not inst then error("open failed: " .. tostring(oerr)) end
            return inst
        end

        local function probe(args)
            local res, err = funcs.new():with_actor(owner_actor()):with_scope(test_scope()):call(PROBE, args)
            if err then error("probe call failed: " .. tostring(err)) end
            return res
        end

        local function stored(component_id)
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end
            local rows = sql.builder.select("private_context", "context_revision"):from("kickside_components")
                :where("component_id = ?", component_id):limit(1):run_with(d):query()
            local title_rows = sql.builder.select("value"):from("kickside_component_meta")
                :where("component_id = ?", component_id):where("key = ?", "title"):run_with(d):query()
            d:release()
            local row = rows and rows[1] or {}
            local decoded, derr = json.decode(tostring(row.private_context or "{}"))
            if derr then error("private context decode failed: " .. tostring(derr)) end
            return {
                context = decoded,
                revision = tonumber(row.context_revision),
                title = title_rows and title_rows[1] and title_rows[1].value or nil,
            }
        end

        local function register(context)
            local reg = open_as_owner():register({
                impl_id = impl,
                meta = { title = "before", label = "rev-" .. uuid.v4():sub(1, 8) },
                private_context = context,
            })
            if not reg or not reg.success then error("register failed: " .. tostring(reg and reg.error)) end
            return reg.component_id, reg
        end

        test.it("checks the context version without decoding the stored context value", function()
            local cid = register({ v = 1 })
            local db, connect_err = sql.get(DB)
            test.is_nil(connect_err)
            db = assert(db)
            local _, write_err = sql.builder.update("kickside_components"):set("private_context", "42")
                :where("component_id = ?", cid):run_with(db):exec()
            test.is_nil(write_err)
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            local current = ops.check_context_revision(tx, cid, 0)
            local stale = ops.check_context_revision(tx, cid, 1)
            tx:rollback()
            db:release()
            test.is_nil(current)
            test.is_true(errors.is(stale, errors.CONFLICT))
            test.eq(stale:details().version, 0)
        end)

        test.it("get_access_context reports the revision of the returned private context", function()
            local cid = register({ v = 1 })
            local res = open_as_owner():get_access_context({ component_id = cid, include_context = true })
            test.is_true(res.success, tostring(res.error))
            test.eq(res.context.v, 1)
            test.eq(res.context_revision, 0)
        end)

        test.it("get_access_context_by_meta reports the revision of the returned private context", function()
            local cid, reg = register({ v = 1 })
            local inst = open_as_owner()
            inst:update({ component_id = cid, commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } } })
            local get = inst:get({ component_id = cid })
            local res = inst:get_access_context_by_meta({ meta = { label = get.meta.label }, include_context = true })
            test.is_true(res.success, tostring(res.error))
            test.eq(res.id, reg.component_id)
            test.eq(res.context.v, 2)
            test.eq(res.context_revision, 1)
        end)

        test.it("each context write advances the revision", function()
            local cid = register({ v = 1 })
            local inst = open_as_owner()
            local a = inst:update({ component_id = cid, commands = { { type = "PATCH_CONTEXT", payload = { patch = { a = 1 } } } } })
            local b = inst:update({ component_id = cid, commands = { { type = "SET_CONTEXT", payload = { private_context = { b = 2 } } } } })
            test.is_true(a.success and b.success, tostring(a.error or b.error))
            test.eq(a.context_revision, 1)
            test.eq(b.context_revision, 2)
            local row = stored(cid)
            test.eq(row.context.b, 2)
            test.is_nil(row.context.a)
        end)

        test.it("matches the context subject and advances once per context command", function()
            local cid = register({ v = 1 })
            local result = open_as_owner():update({ component_id = cid, expected_revision = 0,
                commands = {
                    { type = "PATCH_CONTEXT", payload = { patch = { a = 1 } } },
                    { type = "SET_CONTEXT", payload = { private_context = { v = 2 } } },
                } })
            test.is_true(result.success, tostring(result.error))
            test.eq(result.context_revision, 2)
            test.eq(stored(cid).context.v, 2)
        end)

        test.it("conflicts on a stale context subject and rolls back context and metadata", function()
            local cid = register({ v = 1 })
            local updated = open_as_owner():update({ component_id = cid, commands = {
                { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } } })
            test.is_true(updated.success)
            local result = open_as_owner():update({ component_id = cid, expected_revision = 0,
                commands = {
                    { type = "SET_META", payload = { fields = { title = "after" } } },
                    { type = "PATCH_CONTEXT", payload = { patch = { v = 3 } } },
                } })
            test.eq(result.success, false)
            test.eq(result.kind, errors.CONFLICT)
            test.eq(result.details.reason, "version_mismatch")
            test.eq(result.details.subject, "context")
            test.eq(result.details.version, 1)
            test.eq(result.details.expected, 0)
            local row = stored(cid)
            test.eq(row.context.v, 2)
            test.eq(row.revision, 1)
            test.eq(row.title, "before")
        end)

        test.it("passes the client expectation and carries conflict details", function()
            local cid = register({ v = 1 })
            local commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } }
            local first = probe({ op = "update", component_id = cid, commands = commands,
                opts = { expected_revision = 0 } })
            test.eq(first.ok, true)
            test.eq(first.revision, 1)
            local stale = probe({ op = "update", component_id = cid, commands = commands,
                opts = { expected_revision = 0 } })
            test.eq(stale.ok, false)
            test.eq(stale.conflict, true)
            test.eq(stale.details.reason, "version_mismatch")
            test.eq(stale.details.subject, "context")
            test.eq(stale.details.version, 1)
            test.eq(stale.details.expected, 0)
            test.eq(stored(cid).revision, 1)
        end)

        test.it("allows exactly one expected revision across concurrent transactions", function()
            test.not_nil(ops.check_context_revision)
            local cid = register({ v = 1 })
            local db, connect_err = sql.get(DB)
            test.is_nil(connect_err)
            db = assert(db)
            local dialect = tostring(db:type())
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            test.is_nil(ops.check_context_revision(tx, cid, 0))
            local first, first_err = ops.dispatch(tx, db, {
                type = "PATCH_CONTEXT", payload = { component_id = cid, patch = { first = true } } })
            test.is_nil(first_err)
            local done = channel.new(1)
            coroutine.spawn(function()
                local second = open_as_owner():update({ component_id = cid, expected_revision = 0,
                    commands = { { type = "PATCH_CONTEXT", payload = { patch = { second = true } } } } })
                done:send(second)
            end)
            if dialect == sql.type.POSTGRES then
                local monitor, monitor_err = sql.get(DB)
                test.is_nil(monitor_err)
                monitor = assert(monitor)
                local waiting = false
                for _ = 1, 500 do
                    local rows, read_err = monitor:query("SELECT count(*) AS n FROM pg_stat_activity"
                        .. " WHERE datname=current_database() AND wait_event_type='Lock'")
                    test.is_nil(read_err)
                    if tonumber(rows[1].n) > 0 then waiting = true; break end
                    time.sleep("10ms")
                end
                monitor:release()
                test.is_true(waiting, "second writer waits on the component row lock")
            end
            local _, commit_err = tx:commit()
            db:release()
            test.is_nil(commit_err)
            local second = done:receive()
            test.is_true(first.changes_made)
            test.eq(second.success, false)
            test.eq(second.kind, errors.CONFLICT)
            test.eq(second.details.version, 1)
            local row = stored(cid)
            test.eq(row.revision, 1)
            test.eq(row.context.first, true)
            test.is_nil(row.context.second)
        end)

        test.it("rejects malformed client options before writing", function()
            local cid = register({ v = 1 })
            for _, opts in ipairs({ false, 1, { unknown = true }, { expected_revision = false } }) do
                local result = probe({ op = "update", component_id = cid, opts = opts,
                    commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } } })
                test.eq(result.ok, false)
                test.eq(result.invalid, true)
            end
            test.eq(stored(cid).revision, 0)
        end)

        test.it("rejects malformed expected revisions before writing", function()
            local cid = register({ v = 1 })
            for _, expected in ipairs({ false, -1, 0.5, "0", {}, math.huge }) do
                local result = open_as_owner():update({ component_id = cid, expected_revision = expected,
                    commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } } })
                test.eq(result.success, false)
                test.eq(result.kind, errors.INVALID)
            end
            test.eq(stored(cid).revision, 0)
        end)

        for _, field in ipairs({ "expected_revision", "options", "unexpected" }) do
            test.it("rejects invalid update field " .. field .. " before writing", function()
                local cid = register({ v = 1 })
                local request = {
                    component_id = cid,
                    commands = {
                        { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } },
                        { type = "SET_META", payload = { fields = { title = "after" } } },
                    },
                }
                request[field] = false
                local res = open_as_owner():update(request)
                test.eq(res.success, false)
                test.eq(res.kind, errors.INVALID)
                test.contains(tostring(res.error), field)
                local row = stored(cid)
                test.eq(row.context.v, 1)
                test.eq(row.revision, 0)
                test.eq(row.title, "before")
            end)
        end

        -- The service classifies every failed update: a storage failure is
        -- INTERNAL, a failing command keeps its own kind, and only an access
        -- refusal is PERMISSION_DENIED.
        test.it("classifies a storage failure inside the update transaction as INTERNAL", function()
            local reg = open_as_owner():register({
                impl_id = "kickside.test:failing_lifecycle_update",
                meta = { title = "before" },
                private_context = { v = 1 },
            })
            test.is_true(reg.success, tostring(reg.error))
            local res = open_as_owner():update({
                component_id = reg.component_id,
                commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } },
            })
            test.eq(res.success, false)
            test.eq(res.kind, errors.INTERNAL)
            test.contains(tostring(res.error), "lifecycle")
            test.eq(stored(reg.component_id).context.v, 1)

            local through_client = probe({
                op = "update",
                component_id = reg.component_id,
                commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 3 } } } },
            })
            test.eq(through_client.ok, false)
            test.is_true(through_client.internal, "storage failure must surface as INTERNAL: " .. tostring(through_client.err))
            test.eq(through_client.permission_denied, false)
        end)

        test.it("preserves the native failed access query inside update", function()
            local cid = register({ v = 1 })
            local d, derr = sql.get(DB)
            if derr then error("db connect failed: " .. tostring(derr)) end
            local _, rename_err = d:execute("ALTER TABLE kickside_component_access RENAME TO kickside_component_access_hidden")
            if rename_err then d:release(); error("hide access table failed: " .. tostring(rename_err)) end
            local _, source = d:query("SELECT * FROM kickside_component_access WHERE 1=0")
            local ok, res = pcall(function()
                return open_as_owner():update({
                    component_id = cid,
                    commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } },
                })
            end)
            local _, restore_err = d:execute("ALTER TABLE kickside_component_access_hidden RENAME TO kickside_component_access")
            d:release()
            if restore_err then error("restore access table failed: " .. tostring(restore_err)) end
            if not ok then error(res) end
            test.eq(res.success, false)
            if not source then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "access-query guard requires a native failure"})) end
            test.eq(res.kind, source:kind())
            test.eq(res.retryable, source:retryable())
            test.eq(res.details.cause.kind, source:kind())
            test.eq(res.details.cause.retryable, source:retryable())
            local actual_details, actual_err = json.encode(res.details.cause.details)
            if actual_err then error(actual_err) end
            local source_details, source_err = json.encode(source:details())
            if source_err then error(source_err) end
            test.eq(actual_details, source_details)
            test.eq(stored(cid).context.v, 1)
        end)

        test.it("keeps a failing command's own error kind", function()
            local cid = register({ v = 1 })
            local res = open_as_owner():update({
                component_id = cid,
                commands = { { type = "PATCH_CONTEXT", payload = { patch = "not a table" } } },
            })
            test.eq(res.success, false)
            test.eq(res.kind, errors.INVALID)
            test.eq(stored(cid).revision, 0)
        end)

        test.it("classifies an update without access as PERMISSION_DENIED", function()
            local cid = register({ v = 1 })
            local svc, err = contract.get(COMPONENT_SERVICE)
            if err or not svc then error("component_service unavailable: " .. tostring(err)) end
            local stranger = security.new_actor("rev-stranger-" .. uuid.v4():sub(1, 8), { security_groups = {} })
            local inst = svc:with_actor(stranger):with_scope(test_scope()):open()
            local res = inst:update({
                component_id = cid,
                commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } },
            })
            test.eq(res.success, false)
            test.eq(res.kind, errors.PERMISSION_DENIED)
            test.eq(stored(cid).context.v, 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
