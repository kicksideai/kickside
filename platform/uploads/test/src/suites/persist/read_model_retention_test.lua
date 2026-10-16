local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local funcs = require("funcs")
local retention_module = require("upload_read_model_retention")
local policy = require("uploads_retention_policy")
local read_model = require("upload_read_model")
local upload_types = require("upload_types")
local channel = require("channel")

local DB = "app:db"
local core_thread_watermarks: { [string]: integer } = {}

local function core_threads(): any
    return {
        prune_boundary = function(_self: any, args: any): (any?, error?)
            local watermark = core_thread_watermarks[args.thread_id]
            if watermark == nil then
                return nil, errors.new({ message = "thread not found", kind = errors.NOT_FOUND })
            end
            return { max_pruned_seq = watermark }, nil
        end,
    }
end

local retention = retention_module.new({ core_threads = core_threads() })

local function stamp(days: integer): string
    return time.now():utc():add(days * 24 * time.HOUR):format_rfc3339()
end

local function write(statement: string, params: { any }): ()
    local db = assert(sql.get(DB))
    local _, err = db:execute(statement, params)
    db:release()
    test.is_nil(err, tostring(err))
end

local function count(id: string): integer
    local db = assert(sql.get(DB))
    local rows, err = db:query("SELECT COUNT(*) AS n FROM kickside_upload_read_model WHERE upload_id=$1", { id })
    db:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

local run_cases = test.run_cases(function()
    test.describe("uploads deleted read-model retention", function()
        local ids: { string } = {}
        local threads: { string } = {}

        test.after_each(function()
            for _, id in ipairs(ids) do
                write("DELETE FROM kickside_upload_read_model WHERE upload_id=$1", { id })
                write("DELETE FROM kickside_uploads WHERE uuid=$1", { id })
            end
            for _, id in ipairs(threads) do core_thread_watermarks[id] = nil end
            ids, threads = {}, {}
        end)

        local function thread(watermark: integer): string
            local id = uuid.v4()
            threads[#threads + 1] = id
            core_thread_watermarks[id] = watermark
            return id
        end

        local function model(component_id: string, status: string, age: integer, seq: integer): string
            local id = uuid.v4()
            ids[#ids + 1] = id
            write([[INSERT INTO kickside_upload_read_model
                (upload_id,component_id,status,deleted_at,last_event_seq)
                VALUES ($1,$2,$3,$4,$5)]], { id, component_id, status, stamp(age), seq })
            return id
        end

        test.it("reclaims only old deleted rows whose event is past the Core contract watermark", function()
            local safe_thread = thread(10)
            local blocked_thread = thread(5)
            local old_a = model(safe_thread, "deleted", -40, 7)
            local old_b = model(safe_thread, "deleted", -40, 8)
            local blocked = model(blocked_thread, "deleted", -40, 7)
            local fresh = model(safe_thread, "deleted", -1, 9)
            local live = model(safe_thread, "completed", -40, 6)
            local no_event = model(safe_thread, "deleted", -40, 0)
            local still_stored = model(safe_thread, "deleted", -40, 6)
            write([[INSERT INTO kickside_uploads
                (uuid,actor_id,size,mime_type,storage_state,storage_id,storage_path,type_id)
                VALUES ($1,'retention-test',1,'text/plain','completed','app:uploads',$1,'text')]], { still_stored })

            local removed, err = retention.prune_deleted(stamp(-30), 1)
            test.is_nil(err, tostring(err))
            test.eq(removed, 1, "first watermark-safe tombstone pass")
            removed, err = retention.prune_deleted(stamp(-30), 1)
            test.is_nil(err, tostring(err))
            test.eq(removed, 1, "second watermark-safe tombstone pass")
            test.eq(count(old_a) + count(old_b), 0)
            removed, err = retention.prune_deleted(stamp(-30), 1)
            test.is_nil(err, tostring(err))
            test.eq(removed, 0)
            test.eq(count(blocked), 1)
            test.eq(count(fresh), 1)
            test.eq(count(live), 1)
            test.eq(count(no_event), 1)
            test.eq(count(still_stored), 1)

            core_thread_watermarks[blocked_thread] = 7
            removed, err = retention.prune_deleted(stamp(-30), 1)
            test.is_nil(err, tostring(err))
            test.eq(removed, 1, "blocked thread after Core watermark advances")
            test.eq(count(blocked), 0)
        end)

        test.it("uses a validated owner policy on the existing retention callback", function()
            local settings, policy_err = policy.resolve({ retention = {
                deleted_read_model = "30d", batch_deleted_read_model = 500,
                orphan_blob = "30d", batch_orphan_blob = 100 } })
            test.is_nil(policy_err)
            test.eq(settings.deleted_read_model_ms, 30 * 24 * 60 * 60 * 1000)
            test.eq(settings.orphan_blob_ms, 30 * 24 * 60 * 60 * 1000)
            test.eq(settings.batch_orphan_blob, 100)
            settings, policy_err = policy.resolve({ retention = {
                deleted_read_model = "30d", batch_deleted_read_model = 501,
                orphan_blob = "30d", batch_orphan_blob = 100 } })
            test.is_nil(settings)
            test.not_nil(policy_err)
            settings, policy_err = policy.resolve({ retention = {
                deleted_read_model = "30d", batch_deleted_read_model = 500,
                orphan_blob = "30d", batch_orphan_blob = 501 } })
            test.is_nil(settings)
            test.not_nil(policy_err)

            local id = model(thread(10), "deleted", -40, 7)
            local result, call_err = funcs.new():call("kickside.uploads:retention", {})
            test.is_nil(call_err, tostring(call_err))
            test.is_true(result.success, tostring(result.error))
            test.eq(count(id), 0)
        end)

        test.it("does not recreate a deleted owner's model from delayed nondelete events", function()
            local owner_thread = thread(10)
            local id = uuid.v4()
            ids[#ids + 1] = id
            for seq, event_type in ipairs({ upload_types.EVENT.QUEUED,
                upload_types.EVENT.COMPLETED, upload_types.EVENT.FAILED }) do
                local _, apply_err = read_model.apply_events(owner_thread, { {
                    id = "late-" .. tostring(seq) .. "-" .. id, seq = seq,
                    type = event_type, created_at = "2000-01-01T00:00:00Z",
                    body = { upload_id = id, size = 1 },
                } })
                test.is_nil(apply_err, tostring(apply_err))
                test.eq(count(id), 0)
            end
            local _, delete_err = read_model.apply_events(owner_thread, { {
                id = "late-delete-" .. id, seq = 4,
                type = upload_types.EVENT.DELETED, created_at = "2000-01-01T00:00:00Z",
                body = { upload_id = id },
            } })
            test.is_nil(delete_err, tostring(delete_err))
            test.eq(count(id), 1)
            local pruned, prune_err = retention.prune_deleted(stamp(-30), 1)
            test.is_nil(prune_err, tostring(prune_err))
            test.eq(pruned, 1)
            test.eq(count(id), 0)
        end)

        test.it("serializes a live projection against owner deletion", function()
            local owner_thread = thread(0)
            local id = uuid.v4()
            ids[#ids + 1] = id
            write([[INSERT INTO kickside_uploads
                (uuid,actor_id,size,mime_type,storage_state,storage_id,storage_path,type_id)
                VALUES ($1,'retention-race',1,'text/plain','uploaded','app:uploads',$1,'text')]], { id })
            local locked = assert(sql.get(DB))
            local dialect = locked:type()
            local tx = assert(locked:begin())
            if dialect == sql.type.POSTGRES then
                local _, lock_err = tx:query("SELECT uuid FROM kickside_uploads WHERE uuid=$1 FOR UPDATE", { id })
                test.is_nil(lock_err, tostring(lock_err))
            else
                local _, lock_err = tx:execute("UPDATE kickside_uploads SET updated_at=updated_at WHERE uuid=$1", { id })
                test.is_nil(lock_err, tostring(lock_err))
            end
            local started, done = channel.new(1), channel.new(1)
            local finished = false
            coroutine.spawn(function()
                started:send(true)
                local _, err = read_model.apply_events(owner_thread, { {
                    id = "race-" .. id, seq = 1, type = upload_types.EVENT.QUEUED,
                    created_at = "2000-01-01T00:00:00Z", body = { upload_id = id },
                } })
                finished = true
                done:send(err)
            end)
            started:receive()
            local blocked = false
            if dialect == sql.type.POSTGRES then
                local probe = assert(sql.get(DB))
                for _ = 1, 100 do
                    local rows = probe:query([[SELECT COUNT(*) AS n FROM pg_stat_activity
                        WHERE datname=current_database() AND wait_event_type='Lock'
                          AND query LIKE '%kickside_uploads%']])
                    if tonumber(rows[1].n) > 0 and not finished then blocked = true; break end
                    time.sleep("10ms")
                end
                probe:release()
            else
                time.sleep("100ms")
                blocked = not finished
            end
            local _, upload_delete_err = tx:execute("DELETE FROM kickside_uploads WHERE uuid=$1", { id })
            test.is_nil(upload_delete_err, tostring(upload_delete_err))
            local _, model_delete_err = tx:execute("DELETE FROM kickside_upload_read_model WHERE upload_id=$1", { id })
            test.is_nil(model_delete_err, tostring(model_delete_err))
            local _, commit_err = tx:commit()
            locked:release()
            test.is_nil(commit_err, tostring(commit_err))
            test.is_nil((done:receive()))
            test.is_true(blocked, "projection must wait for the upload owner row lock")
            test.eq(count(id), 0)
        end)

        test.it("reclaims a deleted tombstone after its owner thread is purged", function()
            local owner_thread = thread(0)
            local old = model(owner_thread, "deleted", -40, 7)
            local unproved = model(owner_thread, "deleted", -40, 0)
            core_thread_watermarks[owner_thread] = nil
            local removed, err = retention.prune_deleted(stamp(-30), 1)
            test.is_nil(err, tostring(err))
            test.eq(removed, 1)
            test.eq(count(old), 0)
            test.eq(count(unproved), 1)
        end)
    end)
end)

return { run = run_cases }
