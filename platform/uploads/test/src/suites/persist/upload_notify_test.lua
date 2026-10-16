-- Owner upload notifications run through the core projection runner: the
-- declared uploads projection is provisioned for its owner, lifecycle events are
-- appended by the engine, and each fold is dispatched by the core Jobs pool
-- under the projection's admission and stored owner identity.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local security = require("security")
local contract = require("contract")
local channel = require("channel")
local time = require("time")
local json = require("json")
local repo = require("upload_record_repo")
local read_model = require("upload_read_model")
local types = require("types")
local provision = require("provision")
local threads_writer = require("threads_writer")

local THREADS = "kickside.core:threads"
local SUMMARY = "kickside.uploads:summary"
local JOBS_POOL = "app.uploads_suites.persist:projection_jobs_pool"
local CONSTRAINED_GROUP = "app.uploads_suites.persist:notify_constrained"

local function receive(listener: any): any
    local selected = channel.select({ listener:case_receive(), time.after("5s"):case_receive() })
    test.eq(selected.channel, listener, "relay probe reply within 5s")
    return selected.value
end

local run_cases = test.run_cases(function()
    test.describe("committed upload relay notifications", function()
        local probes = {}
        local ids = {}
        local components = {}
        local pool_pid: string? = nil
        local pool_events: any = nil

        local function start_jobs_pool()
            if pool_pid then return end
            pool_events = process.events()
            local pid, spawn_err = process.spawn_monitored(JOBS_POOL, "app:processes")
            if spawn_err or not pid then error("projection Jobs pool failed to start: " .. tostring(spawn_err)) end
            pool_pid = tostring(pid)
        end

        local function stop_jobs_pool()
            local pid = pool_pid
            if not pid then return end
            local _, cancel_err = process.cancel(pid, "5s")
            if cancel_err then error("projection Jobs pool cancellation failed: " .. tostring(cancel_err)) end
            while true do
                local event = channel.select({ pool_events:case_receive() }).value
                if type(event) == "table" and tostring(event.from) == pid and event.kind == process.event.EXIT then
                    pool_pid, pool_events = nil, nil
                    return
                end
            end
        end

        test.after_each(function()
            stop_jobs_pool()
            for _, probe in ipairs(probes) do
                process.cancel(probe.pid, "5s")
                process.unlisten(probe.listener)
            end
            probes = {}
            local db = assert(sql.get("app:db"))
            for _, id in ipairs(ids) do
                assert(db:execute("DELETE FROM kickside_upload_read_model WHERE upload_id=$1", { id }))
                assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", { id }))
            end
            ids = {}
            for _, item in ipairs(components) do
                local threads = assert(contract.get(THREADS)):with_actor(item.actor):with_scope(item.scope):open()
                local _, delete_err = threads:delete({ thread_id = item.component_id })
                test.is_nil(delete_err, tostring(delete_err))
                assert(db:execute("DELETE FROM app_user_groups WHERE user_id=$1", { item.owner }))
                assert(db:execute("DELETE FROM app_users WHERE user_id=$1", { item.owner }))
            end
            db:release()
            components = {}
        end)

        local function probe(user_id: string, upload_id: string): any
            local topic = "upload.probe.reply." .. uuid.v4()
            local listener = assert(process.listen(topic))
            local pid, err = process.spawn_monitored("app.uploads_suites.persist:upload_relay_probe", "app:processes",
                { user_id = user_id, parent = tostring(process.pid()), reply_topic = topic, upload_topic = "upload:" .. upload_id })
            test.is_nil(err)
            local item = { pid = tostring(pid), listener = listener }
            probes[#probes + 1] = item
            test.is_true(receive(listener).ready)
            return item
        end

        local function receipts(item: any): any
            local _, send_err = process.send(item.pid, "upload.probe.flush", {})
            test.is_nil(send_err)
            return receive(item.listener).receipts
        end

        -- An active owner whose live groups are exactly group_id, with the uploads
        -- component provisioned as the upload pipeline does on first touch. The
        -- projection resolves the owner's identity from these groups at each tick.
        local function provision_owner(owner: string, group_id: string): any
            local db = assert(sql.get("app:db"))
            assert(db:execute([[INSERT INTO app_users (user_id, email, full_name, password_hash, status)
                VALUES ($1, $2, $3, $4, 'active')]], { owner, owner .. "@uploads.test", owner, "test-only" }))
            assert(db:execute("INSERT INTO app_user_groups (user_id, group_id) VALUES ($1, $2)", { owner, group_id }))
            db:release()
            local actor = security.new_actor(owner, { security_groups = { "app:uploads_test" } })
            local scope = security.new_scope({ assert(security.policy("app:test_scope_policy")) })
            local _, provision_err = provision.ensure_user(actor, scope, owner)
            test.is_nil(provision_err, tostring(provision_err))
            local item = { owner = owner, actor = actor, scope = scope, component_id = types.component_id_for_owner(owner) }
            components[#components + 1] = item
            return item
        end

        local function append(component_id: string, upload_id: string, step: integer, event_type: string, body: any)
            local body_json = assert(json.encode(body))
            local db = assert(sql.get("app:db"))
            local _, append_err = threads_writer.append_system(db, component_id, { {
                type = event_type, body_json = body_json,
                external = { external_source = types.EVENT_SOURCE, external_id = upload_id .. ":" .. tostring(step),
                    external_version = event_type },
            } })
            db:release()
            test.is_nil(append_err, tostring(append_err))
        end

        local function catch_up(item: any)
            local threads = assert(contract.get(THREADS)):with_actor(item.actor):with_scope(item.scope):open()
            local deadline = time.now():add(15 * time.SECOND):utc():format(time.RFC3339)
            local result, catch_err = threads:catch_up_projection({ thread_id = item.component_id, kind = SUMMARY,
                deadline = deadline })
            test.is_nil(catch_err, tostring(catch_err))
            test.not_nil(result)
            test.is_true((result :: any).done, "the uploads projection reached its thread head")
        end

        test.it("sends processing completed and error payloads only to the persisted owner through the projection runner", function()
            local owner = "notify-owner-" .. uuid.v4()
            local other = "notify-other-" .. uuid.v4()
            local id = uuid.v4()
            local own_probe, other_probe = probe(owner, id), probe(other, id)
            ids[#ids + 1] = id
            local created, create_err = repo.create(id, owner, 24, "application/pdf", "app:uploads", "notify/" .. id,
                "document", { filename = "fixture.pdf", title = "Fixture", __upload_token = "private", storage_path = "private" }, "processing")
            test.is_nil(create_err)
            test.not_nil(created)
            local component = provision_owner(owner, "app:uploads_test")
            start_jobs_pool()
            for step, transition in ipairs({
                { type = types.EVENT.QUEUED, status = "processing" },
                { type = types.EVENT.COMPLETED, status = "completed" },
                { type = types.EVENT.QUEUED, status = "processing" },
                { type = types.EVENT.FAILED, status = "error", error = "corrupt PDF" },
            }) do
                append(component.component_id, id, step, transition.type, { upload_id = id, actor_id = other,
                    filename = "fixture.pdf", size = 24, mime_type = "application/pdf", error = transition.error })
                catch_up(component)
                local row, row_err = read_model.get_for_actor(owner, id)
                test.is_nil(row_err)
                test.eq(row.status, transition.status)
                local own = receipts(own_probe)
                test.eq(#own, step, "one upload notification per lifecycle event")
                test.eq(own[step].topic, "upload:" .. id)
                local payload = own[step].data
                test.eq(payload.uuid, id)
                test.eq(payload.status, transition.status)
                test.eq(payload.size, 24)
                test.eq(payload.mime_type, "application/pdf")
                test.eq(payload.meta.filename, "fixture.pdf")
                test.eq(payload.meta.title, "Fixture")
                test.is_nil(payload.meta.__upload_token)
                test.is_nil(payload.meta.storage_path)
                test.not_nil(payload.updated_at)
                if transition.error then
                    test.eq(payload.error, "Upload processing failed. Check the file and try again.")
                else
                    test.is_nil(payload.error)
                end
                test.eq(#receipts(other_probe), 0)
            end
            append(component.component_id, id, 5, types.EVENT.DELETED, { upload_id = id })
            catch_up(component)
            test.eq(#receipts(own_probe), 4, "deleted events do not notify chat")
            test.eq(#receipts(other_probe), 0)
        end)

        test.it("notifies the persisted owner from a projection whose owner scope lacks process messaging and realtime authority", function()
            local owner = "notify-scoped-" .. uuid.v4()
            local id = uuid.v4()
            local own_probe = probe(owner, id)
            ids[#ids + 1] = id
            local created, create_err = repo.create(id, owner, 24, "application/pdf", "app:uploads", "notify/" .. id,
                "document", { filename = "fixture.pdf" }, "processing")
            test.is_nil(create_err)
            test.not_nil(created)
            local component = provision_owner(owner, CONSTRAINED_GROUP)
            start_jobs_pool()
            append(component.component_id, id, 1, types.EVENT.COMPLETED,
                { upload_id = id, filename = "fixture.pdf", size = 24, mime_type = "application/pdf" })
            catch_up(component)
            local own = receipts(own_probe)
            test.eq(#own, 1, "the completed upload never reached the owner's hub")
            test.eq(own[1].topic, "upload:" .. id)
            test.eq(own[1].data.uuid, id)
            test.eq(own[1].data.status, "completed")
        end)
    end)
end)
return { run = function(options: any): any return run_cases(options) end }
