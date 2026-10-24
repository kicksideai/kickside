local test = require("test")
local registry = require("registry")
local channel = require("channel")
local time = require("time")
local sql = require("sql")
local store = require("scope_store")
local consts = require("security_consts")
local trigger = require("trigger_reconcile")
local security = require("security")
local projection = require("scope_projection")
local uuid = require("uuid")
local canonical_json = require("canonical_json")
local funcs = require("funcs")

type Map = { [string]: any }
local PROJECTOR = "kickside.security.service:scope_projection_proc"
local REPLY_TIMEOUT = "5s"

local function request(pid: string, extra: Map?): (any?, string?)
    local topic = "test.scope_handoff.reply:" .. tostring(process.pid())
    local replies = process.listen(topic)
    local payload: Map = extra or {}
    payload.reply_pid = tostring(process.pid())
    payload.reply_topic = topic
    local ok, send_err = process.send(pid, "reconcile", payload)
    if not ok then process.unlisten(replies); return nil, tostring(send_err) end
    local tick = time.after(REPLY_TIMEOUT)
    local received = channel.select({ replies:case_receive(), tick:case_receive() })
    process.unlisten(replies)
    if received.channel == tick then return nil, "scope handoff reply times out" end
    return received.value, nil
end

local spawned: { any } = {}

local function spawn(): string
    local pid, err = process.spawn_monitored(PROJECTOR, "app:processes", {})
    if err or not pid then error("scope test spawn: " .. tostring(err)) end
    spawned[#spawned + 1] = pid
    return tostring(pid)
end

local function stop_spawned(): ()
    local events = process.events()
    for _, pid in ipairs(spawned) do
        local cancelled, cancel_err = process.cancel(pid)
        test.is_nil(cancel_err)
        test.is_true(cancelled)
        local timer = time.after(REPLY_TIMEOUT)
        while true do
            local selected = channel.select({ events:case_receive(), timer:case_receive() })
            test.is_false(selected.channel == timer, "scope projector stops before the next fixture starts")
            local event = selected.value
            if event.kind == process.event.EXIT and event.from == pid then
                test.is_nil(event.result.error)
                break
            end
        end
    end
    spawned = {}
end

local function execute(db: any, statement: string): ()
    local _, err = db:execute(statement)
    if err then error("scope test schema fixture: " .. tostring(err)) end
end

local function define_tests()
    test.describe("scope reconcile handoff", function()
        test.after_each(stop_spawned)
        test.it("declares scope projector startup after the migration boot chain", function()
            local entry, err = registry.get("kickside.security.service:scope_projection.service")
            test.is_nil(err)
            test.eq(entry.data.lifecycle.depends_on[1], "wippy.bootloader:bootloader.service")
            test.is_true(entry.data.lifecycle.auto_start == false)
        end)

        test.it("returns the registered destination when the projector is unavailable", function()
            test.is_nil((process.registry.lookup(consts.SCOPE_PROJECTION_TOPIC)))
            local stats, err = trigger.trigger({ slug = "missing-projector" })
            test.is_nil(stats)
            test.contains(tostring(err), consts.SCOPE_PROJECTION_TOPIC)
        end)

        test.it("the shared client returns acknowledged projection statistics", function()
            local pid = spawn()
            local ready, ready_err = request(pid)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local stats, err = trigger.trigger({ slug = "client-roundtrip" })
            test.is_nil(err)
            test.is_true(stats.success)
            test.eq(stats.created, 0)
            test.eq(stats.updated, 0)
            test.eq(stats.deleted, 0)
        end)

        test.it("acknowledges a reconcile requested without caller process messaging authority", function()
            local pid = spawn()
            local ready, ready_err = request(pid)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local policy = assert(security.policy("app:reconcile_constrained"))
            local stats, err = funcs.new():with_actor(security.new_actor("principal:group:reconcile", {}))
                :with_scope(security.new_scope({ policy })):call("app:reconcile_probe", { slug = "constrained-request" })
            test.is_nil(err, tostring(err))
            test.is_true(stats and stats.success)
        end)

        test.it("declares the scope projection wait as a registry observer", function()
            local entry, err = registry.get("kickside.security.binding:registry_observer")
            test.is_nil(err)
            test.not_nil(entry)
            test.eq(entry.meta.type, "registry.observer")
            test.not_nil(entry.meta.priority)
        end)

        test.it("the registry observer returns after the projection applies", function()
            local pid = spawn()
            local ready, ready_err = request(pid)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local slug = "observer_projection"
            local row, write_err = store.upsert({ slug = slug, policies = {}, enabled = true }, "test-actor")
            test.is_nil(write_err)
            test.not_nil(row)
            local stats, err = funcs.call("kickside.security.binding:registry_observer",
                { changeset = {}, request_id = "observer-test" })
            test.is_nil(err, tostring(err))
            test.is_true(stats and stats.success)
            test.not_nil((registry.get(consts.CUSTOM_SCOPE_NS .. ":" .. slug)))
            local ok, delete_err = store.delete(slug)
            test.is_nil(delete_err)
            test.is_true(ok)
            stats, err = funcs.call("kickside.security.binding:registry_observer", { changeset = {}, request_id = "observer-test" })
            test.is_nil(err, tostring(err))
            test.is_nil((registry.get(consts.CUSTOM_SCOPE_NS .. ":" .. slug)))
        end)

        test.it("the registry observer reports when the projection does not finish", function()
            test.is_nil((process.registry.lookup(consts.SCOPE_PROJECTION_TOPIC)))
            local stats, err = funcs.call("kickside.security.binding:registry_observer", { changeset = {}, request_id = "observer-missing" })
            test.is_nil(stats)
            test.contains(tostring(err), "scope projection did not finish after registry changeset observer-missing")
        end)

        test.it("acknowledges admin writes only after their registry projection", function()
            local pid = spawn()
            local slug = "handoff_projection"
            local row, write_err = store.upsert({ slug = slug, policies = {}, enabled = true }, "test-actor")
            test.is_nil(write_err)
            test.not_nil(row)
            -- A receipt from any source other than the two internal
            -- registry-only callers never suppresses a DB-backed pass.
            local version = assert(registry.current_version()):id()
            local reply, err = request(pid, {source = "untrusted.fixture",
                observed_registry_version = tostring(version)})
            test.is_nil(err)
            test.is_true(reply.success)
            local entry, read_err = registry.get(consts.CUSTOM_SCOPE_NS .. ":" .. slug)
            test.is_nil(read_err)
            test.not_nil(entry)
            local ok, delete_err = store.delete(slug)
            test.is_nil(delete_err)
            test.is_true(ok)
            reply, err = request(pid)
            test.is_nil(err)
            test.is_true(reply.success)
            test.is_nil((registry.get(consts.CUSTOM_SCOPE_NS .. ":" .. slug)))
        end)

        test.it("acknowledges a covered registry observer without rereading the DB projection", function()
            local pid = spawn()
            local ready, ready_err = request(pid)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local version = assert(registry.current_version()):id()
            local db = assert(sql.get("app:db"))
            execute(db, "ALTER TABLE kickside_security_scopes RENAME COLUMN target TO fixture_target")
            local ok, failure = pcall(function()
                local stats, observer_err = funcs.call("kickside.security.binding:registry_observer", {
                    request_id = "covered-observer", result = {success = true, version = tostring(version)}})
                test.is_nil(observer_err, tostring(observer_err))
                test.is_true(stats and stats.success)
                test.eq(stats.created + stats.updated + stats.deleted, 0)
            end)
            execute(db, "ALTER TABLE kickside_security_scopes RENAME COLUMN fixture_target TO target")
            db:release()
            if not ok then error(failure) end
        end)

        test.it("acknowledges a committed registry observer after its event-driven projection", function()
            local original = assert(registry.current_version())
            local ok, failure = pcall(function()
                local pid = spawn()
                local ready, ready_err = request(pid)
                test.is_nil(ready_err)
                test.is_true(ready.success)
                local changes = assert(registry.snapshot()):changes()
                for index = 1, 12000 do
                    changes:create({id = "app:observer_barrier_" .. index, kind = "security.policy",
                        meta = {intent = "module_access"}, data = {
                            groups = {"app:observer_barrier_group_" .. (index % 12)}, policy = {
                                actions = {"access", "registry.get"},
                                resources = {"app:observer_barrier_endpoint_" .. index,
                                    "app:observer_barrier_view_" .. index}, effect = "allow"}}})
                end
                test.is_nil(select(2, changes:apply()))
                -- Let the registry subscription establish current authority.
                -- The observer receipt then arrives after that event-driven
                -- pass, just as it does after a governance changeset.
                local deadline = time.now():add(30 * time.SECOND)
                local projected = false
                while time.now():before(deadline) do
                    local scope = security.named_scope("app:declared_members")
                    if scope and scope:evaluate(security.new_actor("member"), "access",
                        "app:observer_barrier_endpoint_12000") == "allow" then
                        projected = true
                        break
                    end
                    time.sleep("25ms")
                end
                test.is_true(projected, "the registry event did not project the committed policy")
                local version = assert(registry.current_version()):id()
                local stats, observer_err = funcs.call("kickside.security.binding:registry_observer", {
                    request_id = "observer-barrier", result = {success = true, version = tostring(version)}})
                test.is_nil(observer_err, tostring(observer_err))
                test.is_true(stats and stats.success)
                test.eq(stats.created + stats.updated + stats.deleted, 0)
            end)
            -- Stop the registry writer before restoring the fixture version.
            -- Otherwise it can react to the restore and start another pass.
            local stopped, stop_err = pcall(stop_spawned)
            local restored, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            test.is_true(restored)
            if not stopped then error(stop_err) end
            if not ok then error(failure) end
        end)

        test.it("propagates a delegation fence failure from a covered registry receipt", function()
            local original = assert(registry.current_version())
            local ok, failure = pcall(function()
                local pid = spawn()
                local ready, ready_err = request(pid)
                test.is_nil(ready_err)
                test.is_true(ready.success)
                local config = assert(registry.get("kickside.security:composition_config"))
                local meta = {}
                for key, value in pairs(config.meta or {}) do meta[key] = value end
                meta.delegation_fencer = ""
                local changes = assert(registry.snapshot()):changes()
                changes:update({id = tostring(config.id), kind = config.kind, meta = meta, data = config.data})
                changes:create({id = "app:delegation_fence_barrier", kind = "security.policy",
                    meta = {intent = "module_access"}, data = {
                        policy = {actions = "access", resources = "app:delegation_fence_barrier", effect = "allow"}}})
                test.is_nil(select(2, changes:apply()))
                local deadline = time.now():add(5 * time.SECOND)
                local projected = false
                while time.now():before(deadline) do
                    local scope = security.named_scope("app:declared_members")
                    if scope and scope:evaluate(security.new_actor("member"), "access",
                        "app:delegation_fence_barrier") == "allow" then
                        projected = true
                        break
                    end
                    time.sleep("25ms")
                end
                test.is_true(projected, "the registry event did not establish the delegation barrier")
                local version = assert(registry.current_version()):id()
                local reply, reply_err = request(pid, {source = "security.delegation",
                    observed_registry_version = tostring(version), fence_groups = {"app:delegation_fence_barrier"}})
                test.is_nil(reply_err)
                test.is_false(reply.success)
                test.contains(tostring(reply.error), "host delegation fencer is unconfigured")
            end)
            local stopped, stop_err = pcall(stop_spawned)
            local restored, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            test.is_true(restored)
            if not stopped then error(stop_err) end
            if not ok then error(failure) end
        end)

        for _, fixture in ipairs({
            {policies = "{", kind = errors.INTERNAL, code = "persisted_data"},
            {policies = '["app:producer_capability"]', kind = errors.PERMISSION_DENIED, code = "policy_service_only"},
        }) do
            for _, boundary in ipairs({"process reply", "shared client"}) do
                test.it("preserves native projection failure through " .. boundary .. ": " .. fixture.code, function()
                    local pid = spawn()
                    local ready, ready_err = request(pid)
                    test.is_nil(ready_err)
                    test.is_true(ready.success)
                    local db = assert(sql.get("app:db"))
                    local slug = "native_reply_" .. uuid.v7():gsub("-", "")
                    local _, seed_err = db:execute([[INSERT INTO kickside_security_scopes
                        (slug,label,description,policies,target,internal,enabled,created_at,updated_at)
                        VALUES ($1,'','',$2,'','0','1','before','before')]], {slug, fixture.policies})
                    test.is_nil(seed_err)
                    local ok, check_err = pcall(function()
                        local direct, direct_err = projection.reconcile()
                        test.is_nil(direct)
                        test.is_true(errors.is(direct_err, fixture.kind))
                        test.eq(direct_err:retryable(), false)
                        test.eq(direct_err:details().code, fixture.code)
                        if boundary == "process reply" then
                            local reply, reply_err = request(pid)
                            test.is_nil(reply_err)
                            test.is_false(reply.success)
                            test.eq(type(reply.error), "string")
                            test.eq(type(reply.error_native), "table")
                            test.eq(reply.error_native.kind, direct_err:kind())
                            test.eq(reply.error_native.message, direct_err:message())
                            test.eq(reply.error_native.retryable, direct_err:retryable())
                            test.eq(assert(canonical_json.encode(reply.error_native.details)), assert(canonical_json.encode(direct_err:details())))
                        else
                            local stats, err = trigger.trigger({slug = slug})
                            test.is_nil(stats)
                            test.is_true(errors.is(err, fixture.kind))
                            test.eq(err:retryable(), direct_err:retryable())
                            test.eq(assert(canonical_json.encode(err:details())), assert(canonical_json.encode(direct_err:details())))
                        end
                    end)
                    local _, delete_err = db:execute("DELETE FROM kickside_security_scopes WHERE slug=$1", {slug})
                    test.is_nil(delete_err)
                    db:release()
                    local cleared, clear_err = request(pid)
                    test.is_nil(clear_err)
                    test.is_true(cleared.success)
                    if not ok then error(check_err) end
                end)
            end
        end

        test.it("preserves a rejected group-set validation error in the reply", function()
            local pid = spawn()
            local ready, ready_err = request(pid)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local _, direct_err = projection.group_set({})
            test.is_true(errors.is(direct_err, errors.INVALID))
            local reply, reply_err = request(pid, {groups = {}})
            test.is_nil(reply_err)
            test.is_false(reply.success)
            test.eq(type(reply.error), "string")
            test.eq(type(reply.error_native), "table")
            test.eq(reply.error_native.kind, direct_err:kind())
            test.eq(reply.error_native.retryable, false)
            local result, err = trigger.trigger({groups = {}})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:retryable(), false)
        end)

        test.it("returns a failed boot pass error to the next request and keeps serving", function()
            local db = assert(sql.get("app:db"))
            local slug = "native_boot_" .. uuid.v7():gsub("-", "")
            local _, seed_err = db:execute([[INSERT INTO kickside_security_scopes
                (slug,label,description,policies,target,internal,enabled,created_at,updated_at)
                VALUES ($1,'','','{','','0','1','before','before')]], {slug})
            test.is_nil(seed_err)
            local ok, check_err = pcall(function()
                local _, direct_err = projection.reconcile()
                test.is_true(errors.is(direct_err, errors.INTERNAL))
                test.eq(direct_err:details().code, "persisted_data")
                local pid = spawn()
                local reply, reply_err = request(pid)
                test.is_nil(reply_err)
                test.is_false(reply.success)
                test.eq(reply.error_native.kind, direct_err:kind())
                test.eq(reply.error_native.message, direct_err:message())
                test.eq(assert(canonical_json.encode(reply.error_native.details)), assert(canonical_json.encode(direct_err:details())))
            end)
            local _, delete_err = db:execute("DELETE FROM kickside_security_scopes WHERE slug=$1", {slug})
            test.is_nil(delete_err)
            db:release()
            if not ok then error(check_err) end
            local settled, settled_err = request(spawned[#spawned])
            test.is_nil(settled_err)
            test.is_true(settled.success, tostring(settled.error))
        end)

        test.it("retains the materialization facade and native projection cause through funcs.call", function()
            local original = assert(registry.current_version())
            local suffix = uuid.v7():gsub("-", "")
            local group = "app:native_materialize_" .. suffix
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = group .. "_policy", kind = "security.policy", data = {
                groups = {group}, policy = {actions = "access", resources = group, effect = "allow"}}})
            test.is_nil(select(2, changes:apply()))
            local pid = spawn()
            local ready, ready_err = request(pid)
            test.is_nil(ready_err, "materialization setup: " .. tostring(ready_err))
            test.is_true(ready.success)
            local checked, check_err = projection.group_set({group})
            test.is_nil(check_err)
            test.is_false(checked.current)
            local db = assert(sql.get("app:db"))
            local slug = "native_materialize_" .. suffix
            local _, seed_err = db:execute([[INSERT INTO kickside_security_scopes
                (slug,label,description,policies,target,internal,enabled,created_at,updated_at)
                VALUES ($1,'','','{','','0','1','before','before')]], {slug})
            test.is_nil(seed_err)
            local ok, failure = pcall(function()
                local _, direct_err = trigger.trigger({groups = {group}})
                test.is_true(errors.is(direct_err, errors.INTERNAL))
                test.eq(direct_err:retryable(), false)
                test.eq(direct_err:details().code, "persisted_data")
                local result, err = funcs.call("kickside.security.binding:materialize_group_set", {groups = {group}})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(err:retryable(), direct_err:retryable())
                local cause = err:details().cause
                test.eq(cause.kind, direct_err:kind())
                test.eq(cause.message, direct_err:message())
                test.eq(cause.retryable, direct_err:retryable())
                test.eq(assert(canonical_json.encode(cause.details)), assert(canonical_json.encode(direct_err:details())))
            end)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_security_scopes WHERE slug=$1", {slug})))
            test.is_nil(select(2, db:execute("DELETE FROM kickside_security_group_sets WHERE scope_name=$1", {checked.scope_name})))
            db:release()
            local cleared, clear_err = request(pid)
            test.is_nil(clear_err, "materialization cleanup: " .. tostring(clear_err))
            test.is_true(cleared.success)
            stop_spawned()
            test.is_nil(select(2, registry.apply_version(original)))
            if not ok then error(failure) end
        end)

        test.it("returns schema reconciliation errors to the request caller", function()
            local pid = spawn()
            local ready, ready_err = request(pid)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local db, open_err = sql.get("app:db")
            test.is_nil(open_err)
            execute(db, "ALTER TABLE kickside_security_scopes RENAME COLUMN target TO fixture_target")
            local reply, err = request(pid)
            -- The failed same-version pass must clear the successful
            -- watermark: a covered observer receipt has to retry it, not
            -- acknowledge stale success.
            local version = assert(registry.current_version()):id()
            local barrier, barrier_err = request(pid, {source = "registry.observer",
                observed_registry_version = tostring(version)})
            execute(db, "ALTER TABLE kickside_security_scopes RENAME COLUMN fixture_target TO target")
            db:release()
            test.is_nil(err)
            test.is_false(reply.success)
            test.contains(tostring(reply.error), "target")
            test.is_nil(barrier_err)
            test.is_false(barrier.success)
            test.contains(tostring(barrier.error), "target")
        end)
    end)
end

return test.run_cases(define_tests)
