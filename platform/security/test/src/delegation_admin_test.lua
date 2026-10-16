local test = require("test")
local registry = require("registry")
local registry_fixture = require("registry_fixture")
local security = require("security")
local funcs = require("funcs")
local uuid = require("uuid")
local json = require("json")
local channel = require("channel")
local time = require("time")
local reconcile = require("trigger_reconcile")
local scopes = require("scope_store")
local identity = require("execution_identity")
local owned, target, root, group, group2, state, previous_config, projector, composed_slug
local save = "app:delegation_save"
local revoke = "app:delegation_revoke"

local function replace(entry: any)
    test.not_nil(entry.id)
    test.eq(type(entry.kind), "string")
    local _, err = registry_fixture.apply(function(changes, snapshot)
        if snapshot:get(entry.id) then changes:update(entry) else changes:create(entry) end
    end, time.now():add(5 * time.SECOND))
    test.is_nil(err)
end

local function request(extra)
    local args = {principal = {kind = "user", id = target}, root = root, groups = {group}}
    for key, value in pairs(extra or {}) do args[key] = value end
    return args
end

local function invoke(args, policies, operation, actor_id)
    local scope = {}
    for _, id in ipairs(policies or {"app:delegation_admin", "app:delegation_writer"}) do
        scope[#scope + 1] = assert(security.policy(id))
    end
    return funcs.new():with_actor(security.new_actor(actor_id or "authenticated-security-admin", {}))
        :with_scope(security.new_scope(scope)):call(operation or save, args)
end

return {run = test.run_cases(function()
    test.describe("generated native delegation administration", function()
        test.before_each(function()
            owned = {}
            composed_slug = nil
            previous_config = registry.get("kickside.security:delegation_config")
            target, root = uuid.v4(), uuid.v4()
            group, group2 = "app:operators_" .. target, "app:other_operators_" .. target
            for _, id in ipairs({group, group2}) do
                local entry_id = id .. "_baseline"
                owned[#owned + 1] = entry_id
                replace({id = entry_id, kind = "security.policy", data = {groups = {id},
                    policy = {actions = "access", resources = "app:baseline", effect = "allow"}}})
                owned[#owned + 1] = id .. "_role"
                replace({id = id .. "_role", kind = "registry.entry", meta = {type = "kickside.security.role"},
                    data = {role_id = id}})
            end
            state = {id = "app:delegation_validation_state", kind = "registry.entry", data = {target = target, root = root}}
            owned[#owned + 1] = state.id
            replace(state)
            replace({id = "kickside.security:delegation_config", kind = "registry.entry", meta = {validator = "app:delegation_validation"}})
            local pid, spawn_err = process.spawn_monitored("kickside.security.service:scope_projection_proc", "app:processes", {})
            test.is_nil(spawn_err)
            projector = pid
            local reply = "delegation_admin_ready:" .. tostring(process.pid())
            local replies = process.listen(reply)
            test.is_true((process.send(pid, "reconcile", {reply_pid = tostring(process.pid()), reply_topic = reply})))
            local tick = time.after("5s")
            local received = channel.select({replies:case_receive(), tick:case_receive()})
            process.unlisten(replies)
            test.is_true(received.channel == replies)
            test.eq(received.value.success, true)
        end)
        test.after_each(function()
            if composed_slug then test.is_true((scopes.delete(composed_slug))) end
            local changes = assert(registry.snapshot()):changes()
            for _, entry in ipairs(assert(registry.find({["meta.intent"] = "execution_delegation"}))) do
                if (entry.meta or {}).target_id == target then changes:delete(tostring(entry.id)) end
            end
            for _, id in ipairs(owned) do
                if registry.get(id) then changes:delete(id) end
            end
            if previous_config then changes:update(previous_config) else changes:delete("kickside.security:delegation_config") end
            test.is_nil(select(2, changes:apply()))
            test.not_nil((reconcile.trigger()))
            if projector then
                local events = process.events()
                local stopped, stop_err = process.cancel(projector)
                test.is_nil(stop_err)
                test.is_true(stopped)
                local tick = time.after("5s")
                while true do
                    local received = channel.select({events:case_receive(), tick:case_receive()})
                    test.is_false(received.channel == tick)
                    if received.value.kind == process.event.EXIT and received.value.from == projector then
                        test.is_nil(received.value.result.error)
                        break
                    end
                end
                projector = nil
            end
        end)
        test.it("RA-H50 inactive native policy retains its ID without delegation authority", function()
            local id = "app:inactive_delegation_" .. target
            owned[#owned + 1] = id
            replace({id = id, kind = "security.policy", data = {groups = {group},
                policy = {actions = "security.actor.delegate", resources = "*", effect = "allow",
                    conditions = {{field = "resource", operator = "eq", value = "left"},
                        {field = "resource", operator = "eq", value = "right"}}}}})
            local scope = security.new_scope({assert(security.policy(id))})
            test.eq(scope:evaluate(security.new_actor("operator"), "security.actor.delegate", "any-resource"), "undefined")
            test.eq(scope:evaluate(security.new_actor("operator"), "security.actor.delegate", "left"), "undefined")
            test.eq(scope:evaluate(security.new_actor("operator"), "security.actor.delegate", "right"), "undefined")
        end)
        for _, policy in ipairs({"app:delegation_admin", "app:delegation_writer", "app:delegation_component_admin"}) do
            test.it("RA-H06 " .. policy .. " alone cannot generate an act-as grant", function()
                local result, err = invoke(request(), {policy})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            end)
        end
        test.it("RA-H07 writes a native exact-root policy and records authenticated provenance", function()
            local args = request({grantor = "forged-admin", credential_id = "secret-value"})
            local result, err = invoke(args)
            test.is_nil(err)
            test.eq(result.success, true)
            local entry = assert(registry.get(result.policy_id))
            test.eq(entry.meta.managed_by, "kickside.security")
            test.eq(entry.meta.grantor, "authenticated-security-admin")
            test.eq(entry.meta.target_id, target)
            test.eq(entry.data.groups[1], group)
            local allowed = assert(security.named_scope(group))
            test.eq(allowed:evaluate(security.new_actor("operator"), "security.actor.delegate", result.resource), "allow")
            test.eq(allowed:evaluate(security.new_actor("operator"), "security.actor.delegate", "different-root"), "undefined")
            test.is_nil(entry.meta.credential_id)
        end)
        test.it("RA-H51 the administration catalog requires Security access and returns safe provenance", function()
            local saved = assert((invoke(request())))
            local denied, denial = invoke({}, {"app:delegation_writer"}, "app:delegation_list")
            test.is_nil(denied)
            test.is_true(errors.is(denial, errors.PERMISSION_DENIED), tostring(denial))
            local listed, list_err = invoke({}, nil, "app:delegation_list")
            test.is_nil(list_err)
            local found
            for _, row in ipairs(listed.delegations) do if row.policy_id == saved.policy_id then found = row end end
            test.not_nil(found)
            test.eq(found.principal.id, target)
            test.eq(found.grantor, "authenticated-security-admin")
            test.eq(found.root, root)
            test.is_nil(found.request)
        end)
        test.it("RA-H08 explicit all-root grant retains its encoded literal root", function()
            local result, err = invoke(request({root = "*"}))
            test.is_nil(err)
            test.eq(assert(registry.get(result.policy_id)).meta.root, "*")
            test.eq(assert(security.named_scope(group)):evaluate(security.new_actor("operator"),
                "security.actor.delegate", result.resource), "allow")
            test.eq(assert(security.named_scope(group)):evaluate(security.new_actor("operator"),
                "security.actor.delegate", "other-target"), "undefined")
        end)
        test.it("RA-H06 a writer scoped to the canonical native policy can administer its grant", function()
            local id = "app:scoped_delegation_writer_" .. target
            owned[#owned + 1] = id
            replace({id = id, kind = "security.policy", data = {policy = {actions = "registry.apply",
                resources = identity.delegation_policy_id("user", target, root), effect = "allow"}}})
            local saved, save_err = invoke(request(), {"app:delegation_admin", id})
            test.is_nil(save_err)
            test.eq(saved.success, true)
        end)
        test.it("RA-H06 an authorized administrator needs no direct host-validator capability", function()
            local call_id = "app:narrow_delegation_call_" .. target
            local read_id = "app:narrow_delegation_reads_" .. target
            local admin_id = "app:narrow_delegation_admin_" .. target
            owned[#owned + 1], owned[#owned + 2] = call_id, read_id
            owned[#owned + 1] = admin_id
            replace({id = call_id, kind = "security.policy", data = {policy = {
                actions = "funcs.call", resources = save, effect = "allow"}}})
            replace({id = read_id, kind = "security.policy", data = {policy = {
                actions = {"registry.get", "registry.find", "registry.snapshot", "db.get"},
                resources = "*", effect = "allow"}}})
            replace({id = admin_id, kind = "security.policy", data = {policy = {
                actions = "access", resources = "kickside.security.api:delegation_save.endpoint", effect = "allow"}}})
            local writer_id = "app:narrow_delegation_writer_" .. target
            owned[#owned + 1] = writer_id
            replace({id = writer_id, kind = "security.policy", data = {policy = {
                actions = "registry.apply", resources = identity.delegation_policy_id("user", target, root), effect = "allow"}}})
            local caller = {call_id, read_id, writer_id, admin_id}
            local direct, direct_err = invoke({target = "app:delegation_validation",
                args = {principal = {kind = "user", id = target}, root = root}}, caller, "app:delegation_validation_call")
            test.is_nil(direct)
            test.is_true(errors.is(direct_err, errors.PERMISSION_DENIED), tostring(direct_err))
            local saved, save_err = invoke(request(), caller)
            test.is_nil(save_err)
            test.eq(saved.success, true)
        end)
        test.it("RA-H50 retained revocation and regrant preserve scopes composing the canonical policy", function()
            local granted = assert((invoke(request())))
            composed_slug = "composed_delegation_" .. target:gsub("-", "")
            test.not_nil((scopes.upsert({slug = composed_slug, policies = {granted.policy_id}}, "test-admin")))
            test.not_nil((reconcile.trigger()))
            local name = "kickside.security.scopes:" .. composed_slug
            test.eq(assert(security.named_scope(name)):evaluate(security.new_actor("operator"),
                "security.actor.delegate", granted.resource), "allow")
            test.not_nil((invoke(request({groups = {}}), nil, revoke)))
            test.eq(assert(scopes.get(composed_slug)).policies[1], granted.policy_id)
            test.eq(assert(security.named_scope(name)):evaluate(security.new_actor("operator"),
                "security.actor.delegate", granted.resource), "undefined")
            local regranted, regrant_err = invoke(request())
            test.is_nil(regrant_err)
            test.eq(regranted.policy_id, granted.policy_id)
            test.eq(assert(security.named_scope(name)):evaluate(security.new_actor("operator"),
                "security.actor.delegate", granted.resource), "allow")
        end)
        for index, extra in ipairs({{principal = {kind = "group", id = "app:group"}}, {root = ""},
            {groups = {}}, {groups = {"app:missing-group"}}, {groups = {[1] = "app:group", hidden = "app:other"}}}) do
            test.it("RA-H06 refuses malformed or unassignable targets, roots and operator groups " .. tostring(index), function()
                local result, err = invoke(request(extra))
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID) or errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            end)
        end
        test.it("RA-H45 host validation outages retain typed errors and make no grant", function()
            state.data.failure = true
            replace(state)
            local result, err = invoke(request())
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.eq(err:retryable(), true)
            test.eq(err:details().code, "host_validation_outage")
        end)
        for _, validator in ipairs({"", "app:absent-host-validator"}) do
            test.it("RA-H06 unavailable host validation " .. validator .. " keeps administration closed", function()
                replace({id = "kickside.security:delegation_config", kind = "registry.entry", meta = {validator = validator}})
                local result, err = invoke(request())
                test.is_nil(result)
                test.not_nil(err)
            end)
        end
        test.it("RA-H48 a registry change during validation returns a conflict and the same request then succeeds", function()
            state.data.bump_revision = true
            replace(state)
            local args = request()
            local value, err = invoke(args)
            test.is_nil(value)
            test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
            test.is_nil(registry.get(identity.delegation_policy_id("user", target, root)))
            local retried, retry_err = invoke(args)
            test.is_nil(retry_err)
            test.eq(retried.success, true)
            test.eq(assert(registry.get(retried.policy_id)).data.groups[1], group)
        end)
        test.it("RA-H50 revoke removes native authority", function()
            local granted = assert((invoke(request())))
            local args = request({groups = {}})
            local result, err = invoke(args, nil, revoke)
            test.is_nil(err)
            test.eq(result.success, true)
            local inactive = assert(registry.get(granted.policy_id))
            test.eq(inactive.meta.active, false)
            test.eq(assert(security.named_scope(group)):evaluate(security.new_actor("operator"),
                "security.actor.delegate", granted.resource), "undefined")
        end)
        for _, unavailable in ipairs({"empty", "missing", "outage", "withdrawn"}) do
            test.it("RA-H50 revocation reduces existing authority despite host validation " .. unavailable, function()
                local granted = assert((invoke(request())))
                if unavailable == "empty" or unavailable == "missing" then
                    replace({id = "kickside.security:delegation_config", kind = "registry.entry",
                        meta = {validator = unavailable == "empty" and "" or "app:absent-host-validator"}})
                else
                    state.data.failure = unavailable == "outage"
                    if unavailable == "withdrawn" then state.data.target = uuid.v4() end
                    replace(state)
                end
                local result, err = invoke(request({groups = {}}), nil, revoke)
                test.is_nil(err)
                test.eq(result.success, true)
                test.eq(assert(registry.get(granted.policy_id)).meta.active, false)
                test.eq(assert(security.named_scope(group)):evaluate(security.new_actor("operator"),
                    "security.actor.delegate", granted.resource), "undefined")
            end)
        end
    end)
end)}
