local source_scope = require("source_scope")
-- The scope projector is a long-lived service: a caller that leaves before its
-- reply never stops it, requests queued behind a projection pass share the next
-- pass instead of one pass each, and a failed pass returns its error while the
-- projector keeps serving under its registered name.

local test = require("test")
local registry = require("registry")
local registry_fixture = require("registry_fixture")
local security = require("security")
local channel = require("channel")
local time = require("time")
local funcs = require("funcs")
local sql = require("sql")
local storage = require("store")
local scope_store = require("scope_store")
local projection = require("scope_projection")
local consts = require("security_consts")

local PROJECTOR = "kickside.security.service:scope_projection_proc"
local PRODUCT_SERVICE = "kickside.security.service:scope_projection.service"
local execution_identity = require("execution_identity")
local GROUPS = { "app:lifecycle_alpha", "app:lifecycle_beta" }
local QUEUED_GROUPS = { "app:lifecycle_g1", "app:lifecycle_g2", "app:lifecycle_g3",
    "app:lifecycle_g4", "app:lifecycle_g5", "app:lifecycle_g6" }
local REPLY_TIMEOUT = "5s"

local function request(pid: string, groups: { string }?): (any?, string?)
    local topic = "test.scope_lifecycle.reply:" .. tostring(process.pid())
    local replies = process.listen(topic)
    local ok, send_err = process.send(pid, "reconcile", { groups = groups,
        reply_pid = tostring(process.pid()), reply_topic = topic })
    if not ok then process.unlisten(replies); return nil, tostring(send_err) end
    local received = channel.select({ replies:case_receive(), time.after(REPLY_TIMEOUT):case_receive() })
    process.unlisten(replies)
    if received.channel ~= replies then return nil, "scope projector reply times out" end
    return received.value, nil
end

local function exit_of(events: any, pid: string, wait: string): any?
    local timer = time.after(wait)
    while true do
        local selected = channel.select({ events:case_receive(), timer:case_receive() })
        if selected.channel == timer then return nil end
        local event = selected.value
        if event.kind == process.event.EXIT and tostring(event.from) == pid then return event end
    end
end

-- The supervised start is asynchronous; wait for the registered owner bounded by
-- a deadline, returning the first pid that differs from `previous`.
local function registered_owner(previous: string?, wait_ms: integer): string?
    local deadline = time.now():add(wait_ms * time.MILLISECOND)
    while time.now():before(deadline) do
        local pid = process.registry.lookup(consts.SCOPE_PROJECTION_TOPIC)
        if pid and tostring(pid) ~= previous then return tostring(pid) end
        time.sleep("50ms")
    end
    return nil
end

local spawned: { string } = {}

local function spawn_projector(): string
    local pid, spawn_err = process.spawn_monitored(PROJECTOR, "app:processes", {})
    if spawn_err or not pid then error("scope lifecycle spawn: " .. tostring(spawn_err)) end
    spawned[#spawned + 1] = tostring(pid)
    local ready, ready_err = request(tostring(pid))
    test.is_nil(ready_err, "scope lifecycle readiness: " .. tostring(ready_err))
    test.is_true(ready and ready.success, tostring(ready and ready.error))
    return tostring(pid)
end

-- Stops every projector a case spawned that is still running, so a failed case
-- never leaves a registered projector behind for the next one.
local function stop_spawned(): ()
    for _, pid in ipairs(spawned) do
        local cancelled = process.cancel(pid)
        if cancelled then exit_of(process.events(), pid, REPLY_TIMEOUT) end
    end
    spawned = {}
end

local function execute(statement: string): ()
    local db, open_err = sql.get("app:db")
    if open_err or not db then error("scope lifecycle fixture database: " .. tostring(open_err)) end
    local _, err = db:execute(statement)
    db:release()
    if err then error("scope lifecycle fixture schema: " .. tostring(err)) end
end

local function projected_replacement(group: string, old_resource: string, new_resource: string): (any, any)
    local deadline = time.now():add(5 * time.SECOND)
    local scope, calls
    while time.now():before(deadline) do
        scope = assert(security.named_scope(group))
        local records = assert(storage.get("app:invalidation_records"))
        calls = records:get("calls") or {}
        records:release()
        if scope:evaluate(security.new_actor("member"), "access", old_resource) == "undefined"
            and scope:evaluate(security.new_actor("member"), "access", new_resource) == "allow"
            and #calls > 0 then break end
        time.sleep("25ms")
    end
    return scope, calls
end

local function define_tests()
    test.describe("scope projector lifecycle", function()
        local original

        test.before_each(function()
            original = assert(registry.current_version())
            local _, apply_err = registry_fixture.apply(function(changes)
                changes:create({ id = "app:lifecycle_alpha_policy", kind = "security.policy", data = {
                    groups = { "app:lifecycle_alpha" }, policy = { actions = "access", resources = "app:alpha", effect = "allow" } } })
                changes:create({ id = "app:lifecycle_beta_policy", kind = "security.policy", data = {
                    groups = { "app:lifecycle_beta" }, policy = { actions = "access", resources = "app:beta", effect = "allow" } } })
                for _, group in ipairs(QUEUED_GROUPS) do
                    changes:create({ id = group .. "_policy", kind = "security.policy", data = {
                        groups = { group }, policy = { actions = "access", resources = group .. "_resource", effect = "allow" } } })
                end
            end, time.now():add(5 * time.SECOND))
            if apply_err then error("scope lifecycle fixture policies: " .. tostring(apply_err)) end
        end)

        test.after_each(function()
            stop_spawned()
            local records = assert(storage.get("app:invalidation_records"))
            records:delete("delay")
            records:delete("record_delay")
            records:delete("fail_at")
            records:release()
            local restored, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            test.is_true(restored)
        end)

        test.it("uses a nonblocking default while a projection queue is empty", function()
            local queue = channel.new(1)
            local selected = channel.select({ queue:case_receive(), default = true })
            test.is_true(selected.default)
        end)

        test.it("keeps serving after a caller leaves before its reply", function()
            local projector = spawn_projector()
            local ready, ready_err = request(projector)
            test.is_nil(ready_err)
            test.is_true(ready.success)

            local sent, call_err = funcs.call("app:scope_request_and_leave", { pid = projector, groups = GROUPS })
            test.is_nil(call_err)
            test.is_true(sent)
            local after, after_err = request(projector)
            local exited = exit_of(process.events(), projector, "200ms")

            test.is_nil(exited, "the projector exits after a caller leaves")
            test.is_nil(after_err)
            test.is_true(after and after.success)
        end)

        test.it("answers requests queued behind a projection pass in one shared pass", function()
            local projector = spawn_projector()
            local ready, ready_err = request(projector)
            test.is_nil(ready_err)
            test.is_true(ready.success)

            -- A delegation fence holds the next pass in a one second session
            -- invalidation, so the requests below queue behind it. Each pass that
            -- composes new group sets applies one registry version; a pass per
            -- request would apply one version per queued request.
            local records = assert(storage.get("app:invalidation_records"))
            records:set("delay", "1s")
            records:release()
            local before = assert(registry.current_version()):id()
            local held = process.send(projector, "reconcile", { fence_groups = { GROUPS[1] },
                reply_pid = tostring(process.pid()), reply_topic = "test.scope_lifecycle.held:" .. tostring(process.pid()) })
            test.is_true(held)
            local topic = "test.scope_lifecycle.queued:" .. tostring(process.pid())
            local replies = process.listen(topic)
            local sent = 0
            for first = 1, #QUEUED_GROUPS do
                for second = first + 1, #QUEUED_GROUPS do
                    local ok = process.send(projector, "reconcile", { groups = { QUEUED_GROUPS[first], QUEUED_GROUPS[second] },
                        reply_pid = tostring(process.pid()), reply_topic = topic })
                    test.is_true(ok)
                    sent = sent + 1
                end
            end
            local deadline = time.after("20s")
            local names: { [string]: boolean } = {}
            local answered, failures = 0, {}
            while answered < sent do
                local selected = channel.select({ replies:case_receive(), deadline:case_receive() })
                if selected.channel ~= replies then break end
                answered = answered + 1
                local reply = selected.value
                if reply.success then names[reply.scope_name] = true else failures[#failures + 1] = tostring(reply.error) end
            end
            process.unlisten(replies)
            local passes = assert(registry.current_version()):id() - before
            local distinct = 0
            for _ in pairs(names) do distinct = distinct + 1 end

            test.eq(answered, sent, "queued requests passed their deadline unanswered")
            test.eq(#failures, 0, table.concat(failures, "; "))
            test.eq(distinct, sent)
            test.is_true(passes <= 1, "queued requests took " .. tostring(passes) .. " projection passes")
        end)

        test.it("reuses a group set current with the registry without the projector", function()
            local projector = spawn_projector()
            local ready, ready_err = request(projector)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local first, first_err = funcs.call("kickside.security.binding:materialize_group_set", { groups = GROUPS })
            test.is_nil(first_err)
            stop_spawned()
            local again, again_err = funcs.call("kickside.security.binding:materialize_group_set", { groups = GROUPS })
            test.is_nil(again_err, "a login with a current group set waits for the projector")
            test.eq(again.scope_name, first.scope_name)
        end)

        test.it("composes source policy scopes without the projector", function()
            local projector = spawn_projector()
            local ready, ready_err = request(projector)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local first = assert(execution_identity.scope_from_groups(GROUPS))
            stop_spawned()
            local again = assert(execution_identity.scope_from_groups(GROUPS))
            test.eq(#again:policies(), #first:policies())
            local actor = assert(security.new_actor("member"))
            test.eq(again:evaluate(actor, "access", "app:alpha"), "allow")
            test.eq(again:evaluate(actor, "access", "app:beta"), "allow")
        end)

        test.it("reconciles a renamed module policy into the live members group after its registry commit", function()
            local projector = spawn_projector()
            local ready, ready_err = request(projector)
            test.is_nil(ready_err)
            test.is_true(ready.success)

            local old_id = "app:hub_policy_before"
            local new_id = "app:hub_policy_after"
            local old_resource = "app:hub.before.endpoint"
            local new_resource = "app:hub.after.endpoint"
            local _, fixture_err = registry_fixture.apply(function(changes)
                changes:create({ id = old_id, kind = "security.policy", meta = { intent = "module_access" }, data = {
                    policy = { actions = "access", resources = old_resource, effect = "allow" } } })
            end, time.now():add(5 * time.SECOND))
            test.is_nil(fixture_err)

            local deadline = time.now():add(5 * time.SECOND)
            local old_scope
            while time.now():before(deadline) do
                old_scope = assert(security.named_scope("kickside.security.groups:members"))
                if old_scope:evaluate(security.new_actor("member"), "access", old_resource) == "allow" then break end
                time.sleep("25ms")
            end
            test.eq(old_scope:evaluate(security.new_actor("member"), "access", old_resource), "allow",
                "the members group never projects the installed policy")

            local records = assert(storage.get("app:invalidation_records"))
            records:set("calls", {})
            records:set("record_delay", "100ms")
            records:release()
            local _, fixture_err = registry_fixture.apply(function(changes)
                changes:delete(old_id)
                changes:create({ id = new_id, kind = "security.policy", meta = { intent = "module_access" }, data = {
                    policy = { actions = "access", resources = new_resource, effect = "allow" } } })
            end, time.now():add(5 * time.SECOND))
            test.is_nil(fixture_err)

            local updated_scope, calls = projected_replacement("kickside.security.groups:members", old_resource, new_resource)
            test.eq(updated_scope:evaluate(security.new_actor("member"), "access", old_resource), "undefined",
                "the members group retains a removed policy")
            test.eq(updated_scope:evaluate(security.new_actor("member"), "access", new_resource), "allow",
                "the members group never receives a replacement policy")
            test.eq(#calls, 1, "native compatibility replacement retains reduction fencing")
            test.eq(calls[1].allow_only, true)
        end)

        test.it("removes a missing composition source from a live direct member group after its registry commit", function()
            local projector = spawn_projector()
            local ready, ready_err = request(projector)
            test.is_nil(ready_err)
            test.is_true(ready.success)

            local group = "app:hub_direct_members"
            local old_id = "app:hub_direct_policy_before"
            local new_id = "app:hub_direct_policy_after"
            local old_resource = "app:hub.direct.before.endpoint"
            local new_resource = "app:hub.direct.after.endpoint"
            local _, fixture_err = registry_fixture.apply(function(changes)
                changes:create({ id = "app:hub_direct_members_composition", kind = "registry.entry",
                    meta = { type = "kickside.security.group_composition" }, data = { group_id = group, policies = { old_id } } })
                changes:create({ id = old_id, kind = "security.policy", data = {
                    groups = { group }, policy = { actions = "access", resources = old_resource, effect = "allow" } } })
            end, time.now():add(5 * time.SECOND))
            test.is_nil(fixture_err)

            local deadline = time.now():add(5 * time.SECOND)
            local old_scope
            while time.now():before(deadline) do
                old_scope = assert(source_scope.resolve(group))
                if old_scope:evaluate(security.new_actor("member"), "access", old_resource) == "allow" then break end
                time.sleep("25ms")
            end
            test.eq(old_scope:evaluate(security.new_actor("member"), "access", old_resource), "allow",
                "the direct member group never projects its initial policy")

            local generated
            deadline = time.now():add(5 * time.SECOND)
            while time.now():before(deadline) do
                generated = assert(registry.find({ [".kind"] = "security.policy",
                    ["meta.scope_projection_policy"] = old_id }))
                if #generated == 1 then break end
                time.sleep("25ms")
            end
            test.eq(#generated, 1, "the original policy was never materialized for the composed group")

            local records = assert(storage.get("app:invalidation_records"))
            records:set("calls", {})
            records:release()
            local _, fixture_err = registry_fixture.apply(function(changes)
                changes:delete(old_id)
                changes:create({ id = new_id, kind = "security.policy", data = {
                    groups = { group }, policy = { actions = "access", resources = new_resource, effect = "allow" } } })
            end, time.now():add(5 * time.SECOND))
            test.is_nil(fixture_err)

            local updated_scope, calls = projected_replacement(group, old_resource, new_resource)
            test.eq(updated_scope:evaluate(security.new_actor("member"), "access", old_resource), "undefined",
                "the direct member group retains a removed composition policy")
            test.eq(updated_scope:evaluate(security.new_actor("member"), "access", new_resource), "allow",
                "the direct member group never receives a replacement policy")
            test.eq(#calls, 1, "native compatibility source replacement retains reduction fencing")
            test.eq(calls[1].allow_only, true)
        end)

        -- A scope saved during a pass references a policy the pass's snapshot
        -- predates; the pass answers from the registry the scope was saved against.
        test.it("answers a pass whose snapshot predates a scope saved during it", function()
            local projector = spawn_projector()
            local ready, ready_err = request(projector)
            test.is_nil(ready_err)
            test.is_true(ready.success)
            local records = assert(storage.get("app:invalidation_records"))
            records:set("delay", "1s")
            records:release()
            local topic = "test.scope_lifecycle.stale:" .. tostring(process.pid())
            local replies = process.listen(topic)
            local sent = process.send(projector, "reconcile", { fence_groups = { GROUPS[1] },
                reply_pid = tostring(process.pid()), reply_topic = topic })
            test.is_true(sent, "stale pass request")
            time.sleep("200ms")
            local _, policy_err = registry_fixture.apply(function(changes)
                changes:create({ id = "app:lifecycle_late_policy", kind = "security.policy", data = {
                    policy = { actions = "access", resources = "app:late", effect = "allow" } } })
            end, time.now():add(5 * time.SECOND))
            test.is_nil(policy_err)
            local slug = "lifecycle_late_" .. tostring(math.floor(time.now():unix_nano() % 1000000))
            local row, row_err = scope_store.upsert({ slug = slug, policies = { "app:lifecycle_late_policy" }, enabled = true }, "test-actor")
            test.is_nil(row_err)
            test.not_nil(row)
            local selected = channel.select({ replies:case_receive(), time.after("15s"):case_receive() })
            process.unlisten(replies)
            test.eq(selected.channel, replies, "the stale pass never answered")
            test.is_true(selected.value.success, tostring(selected.value.error))
            local settled, settled_err = request(projector)
            test.is_nil(settled_err)
            test.is_true(settled.success, tostring(settled.error))
            test.not_nil((registry.get(consts.CUSTOM_SCOPE_NS .. ":" .. slug)), "the saved scope was never projected")
            test.is_true((scope_store.delete(slug)))
        end)

        test.it("keeps answering requests after a source selection fence fails", function()
            local projector = spawn_projector()
            local slug, policy = "lifecycle_fence_failure", "app:lifecycle_fence_failure_policy"
            local _, policy_err = registry_fixture.apply(function(changes)
                changes:create({ id = policy, kind = "security.policy", data = {
                    policy = { actions = "access", resources = "app:fence_failure_before", effect = "allow" } } })
            end, time.now():add(5 * time.SECOND))
            test.is_nil(policy_err)
            test.not_nil((scope_store.upsert({ slug = slug, policies = { policy } }, "test-actor")))
            local ready, ready_err = request(projector)
            test.is_nil(ready_err)
            test.is_true(ready.success, tostring(ready.error))
            local records = assert(storage.get("app:invalidation_records"))
            records:set("calls", {})
            records:set("delay", "1s")
            records:set("fail_at", 1)
            records:release()
            local row, write_err = scope_store.upsert({slug = slug, policies = {}}, "test-actor")
            test.is_nil(row)
            test.is_true(errors.is(write_err, errors.INTERNAL))
            test.eq(assert(scope_store.get(slug)).policies[1], policy, "a failed authority fence prevents the source selection write")
            local reply, reply_err = request(projector)
            records = assert(storage.get("app:invalidation_records"))
            records:delete("fail_at")
            records:release()
            test.is_nil(reply_err, "a request queued behind a failed commit pass is never answered")
            test.is_true(reply.success, tostring(reply.error))
            test.is_true((scope_store.delete(slug)))
            test.is_true(request(projector).success)
        end)

        test.it("keeps serving under its registered name after a failed registry reconcile", function()
            local product = assert(registry.get(PRODUCT_SERVICE))
            local lifecycle = {}
            for key, value in pairs(product.data.lifecycle) do lifecycle[key] = value end
            lifecycle.auto_start = true
            local _, apply_err = registry_fixture.apply(function(changes)
                changes:create({ id = "app:scope_projection_supervised", kind = "process.service",
                    data = { process = product.data.process, host = product.data.host, lifecycle = lifecycle } })
            end, time.now():add(5 * time.SECOND))
            test.is_nil(apply_err)

            local first = registered_owner(nil, 10000)
            test.not_nil(first, "the supervised projector never registered")
            local settled, settled_err = request(first :: string)
            test.is_nil(settled_err)
            test.is_true(settled.success)

            execute("ALTER TABLE kickside_security_scopes RENAME COLUMN target TO lifecycle_target")
            local _, commit_err = registry_fixture.apply(function(commit)
                commit:create({ id = "app:scope_lifecycle_commit", kind = "registry.entry", data = {} })
            end, time.now():add(5 * time.SECOND))
            local failed, failed_err = request(first :: string)
            execute("ALTER TABLE kickside_security_scopes RENAME COLUMN lifecycle_target TO target")
            test.is_nil(commit_err)
            test.is_nil(failed_err, "a failed registry reconcile leaves the request unanswered")
            test.is_false(failed.success)
            test.contains(tostring(failed.error), "target")

            test.eq(tostring(process.registry.lookup(consts.SCOPE_PROJECTION_TOPIC)), first)
            local scope, scope_err = execution_identity.scope_from_groups(GROUPS)
            test.is_nil(scope_err)
            test.eq(scope:evaluate(security.new_actor("lifecycle_member"), "access", "app:alpha"), "allow")
            test.eq(scope:evaluate(security.new_actor("lifecycle_member"), "access", "app:beta"), "allow")

            -- Removing the supervised service stops it; the next case starts
            -- only once its registered name is released.
            local restored, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            test.is_true(restored)
            local monitored = process.monitor(first :: string)
            test.is_true(monitored)
            test.not_nil(exit_of(process.events(), first :: string, "10s"), "the removed service kept running")
        end)
    end)
end

return test.run_cases(define_tests)
