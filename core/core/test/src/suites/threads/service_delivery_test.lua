-- Post-commit deliveries (projection cursor progress and realtime thread
-- updates) run under the threads service identity, so a writer whose scope
-- carries no process messaging authority still commits, wakes its cursor
-- waiters, and reaches the audience's hubs.

local test = require("test")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local funcs = require("funcs")
local process = require("process")
local channel = require("channel")
local time = require("time")
local consts = require("consts")

local THREADS = "kickside.core:threads"
local PROBE = "kickside.core.threads:cursor_waiter_probe"
local TEST_WORKER = "app:test_count_worker"

local function define_tests()
    test.describe("Threads service-identity delivery", function()
        local owner = "delivery-owner-" .. uuid.v4():sub(1, 8)

        local function constrained_scope()
            local policy, policy_err = security.policy("app:test_constrained_writer_policy")
            if not policy then error("constrained policy missing: " .. tostring(policy_err)) end
            return security.new_scope({ policy })
        end

        local function owner_actor()
            return security.new_actor(owner, { security_groups = {} })
        end

        local function constrained(method: string, args: table): (any?, error?)
            local def, def_err = contract.get(THREADS)
            if def_err or not def then error("threads contract unavailable: " .. tostring(def_err)) end
            local svc, open_err = def:with_actor(owner_actor()):with_scope(constrained_scope()):open()
            if open_err or not svc then error("open threads contract failed: " .. tostring(open_err)) end
            return svc[method](svc, args)
        end

        test.it("notifies a cursor waiter registered and committed by a writer without process messaging authority", function()
            local created, create_err = constrained("create", { thread_class = "delivery_cursor_" .. uuid.v4():sub(1, 8) })
            test.is_nil(create_err, tostring(create_err))
            local thread_id = (created :: any).thread_id
            local pause = { thread_id = thread_id, kind = "count", projection_key = "delivery", cursor_key = "default" }
            local _, register_err = constrained("register_projection", {
                thread_id = thread_id, kind = "count", projection_key = "delivery", cursor_key = "default",
                worker_ref = "func://" .. TEST_WORKER, debounce_idle_ms = 600000, debounce_max_ms = 600000,
            })
            test.is_nil(register_err, tostring(register_err))
            local listed, list_err = constrained("list_projections", { thread_id = thread_id })
            test.is_nil(list_err, tostring(list_err))
            local cursor_id = tostring(((listed :: any).cursors[1] :: any).id)

            local result, probe_err = funcs.new():with_actor(owner_actor()):with_scope(constrained_scope())
                :call(PROBE, { cursor_id = cursor_id, target_seq = 1000, pause = pause })
            test.is_nil(probe_err, tostring(probe_err))
            test.not_nil(result)
            test.eq((result :: any).paused.status, "paused")
            test.is_false((result :: any).timed_out, "the paused cursor never reached its waiter")
            test.eq((result :: any).notice.kind, "changed")
            test.eq((result :: any).notice.status, "paused")
        end)

        test.it("delivers the realtime update of an append by a writer without process messaging authority", function()
            local hub_name = consts.USER_HUB_PREFIX .. owner
            local mailbox, listen_err = process.listen(consts.DEFAULT_TOPIC)
            test.is_nil(listen_err, tostring(listen_err))
            if not mailbox then error("hub mailbox is absent") end
            local _, hub_err = process.registry.register(hub_name)
            test.is_nil(hub_err, tostring(hub_err))

            local created, create_err = constrained("create", { id = uuid.v4(),
                impl_id = "kickside.test.threads:thread_kind", thread_class = "delivery_emit_" .. uuid.v4():sub(1, 8) })
            test.is_nil(create_err, tostring(create_err))
            local thread_id = (created :: any).thread_id
            while channel.select({ mailbox:case_receive(), default = true }).channel == mailbox do end

            local appended, append_err = constrained("append_event", { thread_id = thread_id,
                event = { type = "kickside.test.threads:trigger", role = "user", body = {} } })
            local selected = channel.select({ mailbox:case_receive(), time.after("2s"):case_receive() })
            process.registry.unregister(hub_name)
            process.unlisten(mailbox)

            test.is_nil(append_err, tostring(append_err))
            test.not_nil(appended)
            test.eq(selected.channel, mailbox, "the append's realtime update never reached the owner's hub")
            test.eq((selected.value :: any).thread_id, thread_id)
            test.eq((selected.value :: any).event_type, "events.appended")
        end)

        test.it("delivers a direct emit only to the stored thread audience, never to a caller-named user", function()
            local outsider = "delivery-outsider-" .. uuid.v4():sub(1, 8)
            local topic = "delivery.audience:" .. uuid.v4()
            local created, create_err = constrained("create", { id = uuid.v4(),
                impl_id = "kickside.test.threads:thread_kind", thread_class = "delivery_audience_" .. uuid.v4():sub(1, 8) })
            test.is_nil(create_err, tostring(create_err))
            local thread_id = (created :: any).thread_id
            local forged = {
                thread_id = thread_id, topic = topic, event_type = "delivery.audience",
                user_ids = { outsider }, actor_id = outsider,
                thread_attrs = { user_ids = { outsider }, owner_principal = { kind = "user", id = outsider } },
            }
            local mailbox = process.listen(topic)
            if not mailbox then error("audience mailbox is absent") end

            local function emit_as_hub(user_id: string): (any, error?)
                local hub_name = consts.USER_HUB_PREFIX .. user_id
                local _, reg_err = process.registry.register(hub_name)
                if reg_err then error("hub registration failed: " .. tostring(reg_err)) end
                local _, emit_err = funcs.new():with_actor(owner_actor()):with_scope(constrained_scope())
                    :call("kickside.core.threads:emit_update", forged)
                local selected = channel.select({ mailbox:case_receive(), time.after("1s"):case_receive() })
                process.registry.unregister(hub_name)
                return selected, emit_err
            end

            local outsider_selected, outsider_err = emit_as_hub(outsider)
            local owner_selected, owner_err = emit_as_hub(owner)
            process.unlisten(mailbox)

            test.is_nil(outsider_err, tostring(outsider_err))
            test.is_nil(owner_err, tostring(owner_err))
            test.neq(outsider_selected.channel, mailbox, "a caller-named user outside the audience received the update")
            test.eq(owner_selected.channel, mailbox, "the stored owner never received the update")
            test.eq((owner_selected.value :: any).thread_id, thread_id)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
