local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local lifecycle = require("component_lifecycle_log")
local audit_publisher = require("audit_publisher")
local time = require("time")
local channel = require("channel")

local COMPONENT_SERVICE = "kickside.component:component_service"
local WAKE_TOPIC = "kickside.core.jobs:wake"
local POOL_NAME = "kickside.core.jobs.worker_pool"

local function define_tests()
    test.describe("Component Lifecycle Binding", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner_id = "lifecycle-owner-" .. suffix

        local function scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function service(meta: table?, actor_id: string?)
            local actor = security.new_actor(actor_id or owner_id, meta or { security_groups = {} })
            local def, gerr = contract.get(COMPONENT_SERVICE)
            if gerr or not def then error("component_service unavailable: " .. tostring(gerr)) end
            local inst, oerr = def:with_actor(actor):with_scope(scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst
        end

        local function db()
            local d, err = sql.get("app:db")
            if err or not d then error("db unavailable: " .. tostring(err)) end
            return d
        end

        local function event_types(component_id: string): { string }
            local d = db()
            local rows = sql.builder.select("type")
                :from("kickside_event")
                :where("thread_id = ?", lifecycle.thread_id(component_id))
                :order_by("seq ASC")
                :run_with(d):query()
            d:release()
            local out: { string } = table.create(#(rows or {}), 0)
            for i, row in ipairs(rows or {}) do
                out[i] = tostring((row :: any).type)
            end
            return out
        end

        test.it("records created, updated, and deleted through component CRUD", function()
            local svc = service()
            local reg, rerr = svc:register({
                impl_id = "kickside.test:lifecycle",
                meta = { title = "Lifecycle Test" },
            })
            test.is_nil(rerr)
            test.not_nil(reg)
            local component_id = tostring((reg :: any).component_id)

            local types_after_create = event_types(component_id)
            test.eq(types_after_create[1], lifecycle.EVENT.CREATED)

            local update, uerr = svc:set_meta({
                component_id = component_id,
                fields = { status = "ready" },
            })
            test.is_nil(uerr)
            test.is_true((update :: any).success)

            local del, derr = svc:delete({ component_id = component_id })
            test.is_nil(derr)
            test.is_true((del :: any).success)

            local events = event_types(component_id)
            test.eq(events[1], lifecycle.EVENT.CREATED)
            test.eq(events[2], lifecycle.EVENT.UPDATED)
            test.eq(events[3], lifecycle.EVENT.DELETED)
        end)

        test.it("wires a kind's own lifecycle cursor for root and nested components", function()
            local svc = service()
            local folder, folder_err = svc:register({ impl_id = "app:lifecycle_folder" })
            test.is_nil(folder_err, tostring(folder_err))
            local parent_id = tostring((folder :: any).component_id)
            for _, placement in ipairs({ {}, { parent_id = parent_id } }) do
                local result, create_err = svc:register({ impl_id = "app:lifecycle_observer", parent_id = placement.parent_id })
                test.is_nil(create_err, tostring(create_err))
                test.is_true((result :: any).success)
                local id = tostring((result :: any).component_id)
                local handle = db()
                local function projection(): any
                    local rows, read_err = handle:query([[SELECT p.id,p.thread_id,p.projection_key,c.actor_id,c.job_id,p.body
                        FROM kickside_projection p JOIN kickside_projection_cursor c ON c.projection_id=p.id
                        WHERE p.thread_id=$1 AND p.kind=$2]], { lifecycle.thread_id(id), "test.own.lifecycle" })
                    test.is_nil(read_err, tostring(read_err))
                    test.eq(#rows, 1, "own lifecycle declaration has no durable cursor")
                    test.eq(rows[1].projection_key, "default")
                    test.is_nil(rows[1].actor_id)
                    test.not_nil(rows[1].job_id)
                    return rows[1]
                end
                local created = projection()
                local updated, update_err = svc:set_meta({ component_id = id, fields = { status = "updated" } })
                test.is_nil(update_err, tostring(update_err))
                test.is_true((updated :: any).success)
                test.eq(projection().id, created.id)
                local deleted, delete_err = svc:delete({ component_id = id })
                test.is_nil(delete_err, tostring(delete_err))
                test.is_true((deleted :: any).success)
                test.eq(projection().id, created.id)
                test.eq(event_types(id)[3], lifecycle.EVENT.DELETED)
                handle:release()
            end
        end)

        test.it("notifies the job worker pool after each committed lifecycle mutation", function()
            local mailbox, listen_err = process.listen(WAKE_TOPIC, { message = true })
            test.is_nil(listen_err, tostring(listen_err))
            if not mailbox then error("wake mailbox is absent") end
            local _, register_err = process.registry.register(POOL_NAME, nil, process.registry.CONSISTENT)
            test.is_nil(register_err, tostring(register_err))
            local function drain()
                while channel.select({ mailbox:case_receive(), default = true }).channel == mailbox do end
            end
            local function nudged(label: string)
                local deadline = time.after("2s")
                local selected = channel.select({ mailbox:case_receive(), deadline:case_receive() })
                test.eq(selected.channel, mailbox, label .. " commits lifecycle work without notifying the job worker pool")
                drain()
            end
            local svc = service()
            local folder, folder_err = svc:register({ impl_id = "app:lifecycle_folder" })
            test.is_nil(folder_err, tostring(folder_err))
            drain()
            local created, create_err = svc:register({ impl_id = "app:lifecycle_observer" })
            test.is_nil(create_err, tostring(create_err))
            test.is_true((created :: any).success)
            nudged("register")
            local id = tostring((created :: any).component_id)
            local meta, meta_err = svc:set_meta({ component_id = id, fields = { status = "ready" } })
            test.is_nil(meta_err, tostring(meta_err))
            test.is_true((meta :: any).success)
            nudged("set_meta")
            local updated, update_err = svc:update({ component_id = id,
                commands = { { type = "SET_META", payload = { fields = { status = "updated" } } } } })
            test.is_nil(update_err, tostring(update_err))
            test.is_true((updated :: any).success, tostring((updated :: any).error))
            nudged("update")
            local placed, place_err = svc:set_placement({ component_id = id, parent_id = (folder :: any).component_id })
            test.is_nil(place_err, tostring(place_err))
            test.is_true((placed :: any).success, tostring((placed :: any).error))
            nudged("set_placement")
            local deleted, delete_err = svc:delete({ component_id = id })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true((deleted :: any).success)
            nudged("delete")
            local _, unregister_err = process.registry.unregister(POOL_NAME, process.registry.CONSISTENT)
            process.unlisten(mailbox)
            test.is_nil(unregister_err, tostring(unregister_err))
        end)

        test.it("notifies the job worker pool for a writer without process messaging authority", function()
            local mailbox, listen_err = process.listen(WAKE_TOPIC, { message = true })
            test.is_nil(listen_err, tostring(listen_err))
            if not mailbox then error("wake mailbox is absent") end
            local _, register_err = process.registry.register(POOL_NAME, nil, process.registry.CONSISTENT)
            test.is_nil(register_err, tostring(register_err))
            local function nudged(label: string)
                local deadline = time.after("2s")
                local selected = channel.select({ mailbox:case_receive(), deadline:case_receive() })
                test.eq(selected.channel, mailbox, label .. " under a constrained writer leaves the job worker pool unnotified")
                while channel.select({ mailbox:case_receive(), default = true }).channel == mailbox do end
            end
            local policy, policy_err = security.policy("app:test_constrained_writer_policy")
            if not policy then error("constrained policy missing: " .. tostring(policy_err)) end
            local def, def_err = contract.get(COMPONENT_SERVICE)
            if def_err or not def then error("component_service unavailable: " .. tostring(def_err)) end
            local svc, open_err = def:with_actor(security.new_actor("constrained-" .. suffix, { security_groups = {} }))
                :with_scope(security.new_scope({ policy })):open()
            if open_err or not svc then error("open component_service failed: " .. tostring(open_err)) end

            local created, create_err = svc:register({ impl_id = "app:lifecycle_observer" })
            test.is_nil(create_err, tostring(create_err))
            test.is_true((created :: any).success, tostring((created :: any).error))
            nudged("register")
            local id = tostring((created :: any).component_id)
            local meta, meta_err = svc:set_meta({ component_id = id, fields = { status = "ready" } })
            test.is_nil(meta_err, tostring(meta_err))
            test.is_true((meta :: any).success, tostring((meta :: any).error))
            nudged("set_meta")
            local deleted, delete_err = svc:delete({ component_id = id })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true((deleted :: any).success, tostring((deleted :: any).error))
            nudged("delete")

            local _, unregister_err = process.registry.unregister(POOL_NAME, process.registry.CONSISTENT)
            process.unlisten(mailbox)
            test.is_nil(unregister_err, tostring(unregister_err))
        end)

        test.it("registers a native lifecycle kind under a folder with its lifecycle cursor", function()
            local svc = service()
            local folder, folder_err = svc:register({ impl_id = "app:lifecycle_folder" })
            test.is_nil(folder_err, tostring(folder_err))
            test.not_nil(folder)
            test.is_true((folder :: table).success, tostring((folder :: table).error))
            local parent_id = tostring((folder :: table).component_id)
            local child, child_err = svc:register({
                impl_id = "kickside.core.lifecycle:system_lifecycle", parent_id = parent_id,
            })
            test.is_nil(child_err, tostring(child_err))
            test.not_nil(child)
            test.is_true((child :: table).success, tostring((child :: table).error))
            local id = tostring((child :: table).component_id)
            test.eq(event_types(id)[1], lifecycle.EVENT.CREATED)
            local handle = db()
            local rows, read_err = handle:query([[SELECT p.kind,p.projection_key,c.actor_id,c.job_id
                FROM kickside_projection p JOIN kickside_projection_cursor c ON c.projection_id=p.id
                WHERE p.thread_id=$1]], { lifecycle.thread_id(id) })
            test.is_nil(read_err, tostring(read_err))
            test.eq(#rows, 1)
            test.eq(rows[1].kind, "test.child.lifecycle")
            test.eq(rows[1].projection_key, "parent:" .. parent_id)
            test.is_nil(rows[1].actor_id)
            test.not_nil(rows[1].job_id)
            handle:release()
        end)

        test.it("creates and places a token actor's child without store resolution in the transaction", function()
            local function within(fn: () -> (any?, any?)): any
                local done = channel.new(1)
                coroutine.spawn(function()
                    local value, err = fn()
                    done:send({ value = value, err = err })
                end)
                local deadline = time.after("5s")
                local selected = channel.select({ done:case_receive(), deadline:case_receive() })
                test.eq(selected.channel, done, "component lifecycle does not complete within 5s")
                test.is_nil(selected.value.err, tostring(selected.value.err))
                test.is_true(selected.value.value.success, tostring(selected.value.value.error))
                return selected.value.value
            end
            local token_id = "lifecycle-token-" .. suffix
            local token_meta = { email = token_id .. "@example.test" }
            local svc = service(token_meta, token_id)
            local parent, parent_err = svc:register({ impl_id = "app:lifecycle_folder" })
            test.is_nil(parent_err, tostring(parent_err))
            test.is_true((parent :: table).success, tostring((parent :: table).error))
            local parent_id = tostring((parent :: table).component_id)
            local child = within(function(): (any?, any?)
                local value, err = service(token_meta, token_id):register({ impl_id = "kickside.test:lifecycle", parent_id = parent_id })
                return value, err
            end)
            local loose, loose_err = svc:register({ impl_id = "kickside.test:lifecycle" })
            test.is_nil(loose_err, tostring(loose_err))
            test.is_true((loose :: table).success, tostring((loose :: table).error))
            local loose_id = tostring((loose :: table).component_id)
            within(function(): (any?, any?)
                local value, err = service(token_meta, token_id):set_placement({ component_id = loose_id, parent_id = parent_id })
                return value, err
            end)
            local handle = db()
            for _, id in ipairs({ tostring(child.component_id), loose_id }) do
                local rows, read_err = handle:query([[SELECT p.projection_key,c.actor_id,p.actor_context,c.job_id
                    FROM kickside_projection p JOIN kickside_projection_cursor c ON c.projection_id=p.id
                    WHERE p.thread_id=$1 AND p.kind=$2]], { lifecycle.thread_id(id), "test.child.lifecycle" })
                test.is_nil(read_err, tostring(read_err))
                test.eq(#rows, 1)
                test.eq(rows[1].projection_key, "parent:" .. parent_id)
                test.is_nil(rows[1].actor_id)
                test.is_nil(rows[1].actor_context)
                test.not_nil(rows[1].job_id)
            end
            local _, release_err = handle:release()
            test.is_nil(release_err, tostring(release_err))
        end)

        test.it("retries a lost identity-audit acknowledgment with one stable updated event", function()
            local id = uuid.v7()
            local request = { component_id = id, impl_id = "kickside.test:lifecycle",
                identity_generation = 7, record_json = '{"request_id":"audit-retry"}' }
            local first, first_err = audit_publisher.publish_audit(request)
            test.is_nil(first_err, tostring(first_err))
            test.not_nil(first)
            local second, second_err = audit_publisher.publish_audit(request)
            test.is_nil(second_err, tostring(second_err))
            test.not_nil(second)
            local db = db()
            local rows, read_err = db:query([[SELECT type,external_id FROM kickside_event
                WHERE thread_id=$1 AND external_id=$2]],
                { lifecycle.thread_id(id), "identity_audit:" .. id .. ":7" })
            test.is_nil(read_err, tostring(read_err))
            test.eq(#rows, 1)
            test.eq(rows[1].type, lifecycle.EVENT.UPDATED)
            db:release()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
