local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local time = require("time")
local process = require("process")
local contract = require("contract")
local security = require("security")
local funcs = require("funcs")
local json = require("json")
local env = require("env")
local fs = require("fs")
local provision = require("provision")
local notifier = require("retention_notifier")
local upload_types = require("types")
local upload_tokens = require("upload_tokens")
local secret_cipher = require("secret_cipher")
local upload_query_repo = require("upload_query_repo")
local upload_read_model = require("upload_read_model")
local process_job = require("process_job")
local threads_writer = require("threads_writer")
local jobs_retention = require("jobs_retention")

local DB = "app:db"
local WAIT_MS = 15000

local function exec(statement: string, params: { any }): ()
    local db = assert(sql.get(DB))
    local _, err = db:execute(statement, params)
    db:release()
    test.is_nil(err, tostring(err))
end

local function query(statement: string, params: { any }): { table }
    local db = assert(sql.get(DB))
    local rows, err = db:query(statement, params)
    db:release()
    test.is_nil(err, tostring(err))
    return rows
end

local function count(id: string): integer
    return tonumber(query("SELECT COUNT(*) AS n FROM kickside_upload_read_model WHERE upload_id=$1", { id })[1].n) :: integer
end

local function sweeper_pid(): string?
    local pid = process.registry.lookup(notifier.NAME)
    return pid
end

local function await_sweeper(): string
    local deadline = time.now():unix_nano() + WAIT_MS * 1000000
    while time.now():unix_nano() < deadline do
        local pid = sweeper_pid()
        if pid then return pid :: string end
        time.sleep("50ms")
    end
    error("the Core retention sweeper service is not running")
end

local function stamp(days: integer): string
    return time.now():utc():add(days * 24 * time.HOUR):format_rfc3339()
end

local function user_container(): (string, string)
    local owner = "uploads-retention-sweeper-" .. uuid.v4()
    exec([[INSERT INTO app_users (user_id,email,full_name,password_hash,status)
        VALUES ($1,$2,$1,'test-only','active')]], { owner, owner .. "@uploads.test" })
    for _, group_id in ipairs({ "app:uploads_test", "wippy.security:process" }) do
        exec("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,$2)", { owner, group_id })
    end
    local actor = security.new_actor(owner, { security_groups = { "app:uploads_test" } })
    local scope = security.named_scope("wippy.security:process")
    local _, ensure_err = provision.ensure_user(actor, scope, owner)
    test.is_nil(ensure_err, tostring(ensure_err))
    return assert(upload_types.component_id_for_owner(owner)), owner
end

local function model(component_id: string, seq: integer): string
    local id = uuid.v4()
    exec([[INSERT INTO kickside_upload_read_model
        (upload_id,component_id,status,deleted_at,last_event_seq)
        VALUES ($1,$2,'deleted',$3,$4)]], { id, component_id, stamp(-40), seq })
    return id
end

local function checkpoint(component_id: string, owner: string, upload_id: string, job_id: string?, metadata: string, state: string?)
    exec([[INSERT INTO kickside_uploads
        (uuid,actor_id,mime_type,size,storage_id,storage_path,type_id,storage_state,metadata,
            processing_intent_state,processing_job_id)
        VALUES ($1,$2,'text/plain',1,'app:uploads',$1,'text',$3,$4,$5,$6)]],
        { upload_id, owner, state or "completed", metadata, job_id and "acknowledged" or sql.as.null(),
            job_id or sql.as.null() })
    exec([[INSERT INTO kickside_upload_read_model (upload_id,component_id,status)
        VALUES ($1,$2,'processing')]], { upload_id, component_id })
end

local function terminal_events(component_id: string, upload_id: string): { table }
    return query([[SELECT id,type,seq,body,external_version,created_at FROM kickside_event
        WHERE thread_id=$1 AND external_source='uploads' AND external_id=$2 AND type IN ($3,$4)
        ORDER BY seq]], { component_id, upload_id, upload_types.EVENT.COMPLETED, upload_types.EVENT.FAILED })
end

local function lifecycle_event(component_id: string, upload_id: string, etype: string, version: string)
    local body = assert(json.encode({ upload_id = upload_id, mime_type = "text/plain", size = 1, type_id = "text" }))
    local db = assert(sql.get(DB))
    local tx = assert(db:begin())
    local _, append_err = threads_writer.append_system_tx(tx, tostring(db:type()), component_id, {
        { type = etype, body_json = body,
            external = { external_source = "uploads", external_id = upload_id, external_version = version } },
    })
    if append_err then tx:rollback(); db:release(); error(tostring(append_err)) end
    local _, commit_err = tx:commit()
    db:release()
    test.is_nil(commit_err, tostring(commit_err))
end

return test.run_cases(function()
    test.describe("uploads retention under the Core retention sweeper service", function()
        test.it("recognizes a committed released completion while its projection is processing", function()
            local component_id, owner = user_container()
            local upload_id, job_id = uuid.v4(), uuid.v4()
            local token = assert(upload_tokens.pack({ upload_id = upload_id, function_id = "app:callback_probe",
                actor_id = owner, actor_context = "{}" }))
            checkpoint(component_id, owner, upload_id, job_id, assert(json.encode({ __upload_token = token })), "uploaded")
            lifecycle_event(component_id, upload_id, upload_types.EVENT.QUEUED, upload_types.EVENT.QUEUED)
            lifecycle_event(component_id, upload_id, upload_types.EVENT.COMPLETED, upload_types.EVENT.COMPLETED)
            exec("UPDATE kickside_uploads SET storage_state='completed' WHERE uuid=$1", { upload_id })

            test.eq(assert(upload_read_model.get_for_actor(owner, upload_id)).status, "processing")
            local db = assert(sql.get(DB))
            local page, read_err = upload_query_repo.list_checkpoints(500, upload_id:sub(1, -2), db)
            db:release()
            test.is_nil(read_err, tostring(read_err))
            for _, row in ipairs(page) do
                test.is_false(row.uuid == upload_id, "discovery recognizes the committed completion")
            end
            -- Also pass a candidate captured before publication to exercise the locked recheck.
            local row = query("SELECT * FROM kickside_uploads WHERE uuid=$1", { upload_id })[1]
            local _, recover_err = process_job.recover(row)
            test.is_nil(recover_err, tostring(recover_err))
            local events = terminal_events(component_id, upload_id)
            test.eq(#events, 1)
            test.eq(events[1].external_version, upload_types.EVENT.COMPLETED)
            test.eq(#query("SELECT id FROM kickside_job WHERE thread_id=$1 AND job_type=$2",
                { component_id, "kickside.uploads.service:callback_job" }), 0)
            if type(events[1].body) == "string" then events[1].body = assert(json.decode(events[1].body)) end
            local _, apply_err = upload_read_model.apply_events(component_id, events)
            test.is_nil(apply_err, tostring(apply_err))
            test.eq(assert(upload_read_model.get_for_actor(owner, upload_id)).status, "completed")
        end)

        test.it("does not mistake a prior attempt's event or projection for the current completion", function()
            local component_id, owner = user_container()
            local upload_id, job_id = uuid.v4(), uuid.v4()
            checkpoint(component_id, owner, upload_id, job_id, "{}", "uploaded")
            lifecycle_event(component_id, upload_id, upload_types.EVENT.COMPLETED, upload_types.EVENT.COMPLETED)
            local previous = terminal_events(component_id, upload_id)[1]
            exec("UPDATE kickside_upload_read_model SET status='completed',last_event_seq=$1 WHERE upload_id=$2",
                { previous.seq, upload_id })
            lifecycle_event(component_id, upload_id, upload_types.EVENT.QUEUED, job_id)
            exec("UPDATE kickside_uploads SET storage_state='completed' WHERE uuid=$1", { upload_id })

            local result = assert(funcs.call("kickside.uploads:retention", {}))
            test.is_true(result.success, tostring(result.error))
            local events = terminal_events(component_id, upload_id)
            test.eq(#events, 2)
            test.eq(events[2].external_version, job_id)
            test.eq(events[2].type, upload_types.EVENT.COMPLETED)
        end)

        test.it("recovers completion after a released retry that shared its original queue event", function()
            local component_id, owner = user_container()
            local upload_id, job_id = uuid.v4(), uuid.v4()
            checkpoint(component_id, owner, upload_id, job_id, "{}", "uploaded")
            lifecycle_event(component_id, upload_id, upload_types.EVENT.QUEUED, upload_types.EVENT.QUEUED)
            lifecycle_event(component_id, upload_id, upload_types.EVENT.FAILED, upload_types.EVENT.FAILED)
            local failure = terminal_events(component_id, upload_id)[1]
            exec("UPDATE kickside_upload_read_model SET status='error',last_event_seq=$1 WHERE upload_id=$2",
                { failure.seq, upload_id })
            exec("UPDATE kickside_uploads SET storage_state='completed' WHERE uuid=$1", { upload_id })

            local result = assert(funcs.call("kickside.uploads:retention", {}))
            test.is_true(result.success, tostring(result.error))
            local events = terminal_events(component_id, upload_id)
            test.eq(#events, 2)
            test.eq(events[2].external_version, job_id)
            test.eq(events[2].type, upload_types.EVENT.COMPLETED)
        end)

        test.it("recovers intentless completed uploads with a present or pruned parent and fails invalid checkpoints", function()
            local component_id, owner = user_container()
            local stored_only = uuid.v4()
            exec([[INSERT INTO kickside_uploads
                (uuid,actor_id,mime_type,size,storage_id,storage_path,type_id,storage_state,metadata)
                VALUES ($1,$2,'text/plain',1,'app:uploads',$1,'text','completed','{}')]], { stored_only, owner })
            local fixtures = {
                { upload_id = uuid.v4(), job_id = uuid.v4() },
                { upload_id = uuid.v4(), job_id = uuid.v4(), pruned = true },
                { upload_id = uuid.v4(), job_id = uuid.v4(), invalid = true },
            }
            for _, fixture in ipairs(fixtures) do
                local upload_id, job_id = fixture.upload_id, fixture.job_id
                exec([[INSERT INTO kickside_job
                    (id,thread_id,job_type,payload,job_identity,owner_kind,owner_id,status,finished_at)
                    VALUES ($1,$2,'kickside.uploads.service:process_job_proc',$3,$4,'user',$5,'dead',$6)]],
                    { job_id, component_id, assert(json.encode({ upload_id = upload_id })),
                        "7:uploads" .. #upload_id .. ":" .. upload_id .. "7:process", owner, stamp(fixture.pruned and -40 or 0) })
                checkpoint(component_id, owner, upload_id, nil, "{}", "uploaded")
                if fixture.invalid then
                    exec("UPDATE kickside_uploads SET trace_context=$1 WHERE uuid=$2", { '{"unknown":"field"}', upload_id })
                    test.eq(assert(upload_query_repo.get(upload_id)).trace_context.unknown, "field")
                else
                    lifecycle_event(component_id, upload_id, upload_types.EVENT.QUEUED, upload_types.EVENT.QUEUED)
                end
                if fixture.pruned then
                    exec("DELETE FROM kickside_upload_read_model WHERE upload_id=$1", { upload_id })
                end
            end
            local db = assert(sql.get(DB))
            assert(jobs_retention.sweep(db, tostring(db:type())))
            db:release()
            test.eq(#query("SELECT id FROM kickside_job WHERE id=$1", { fixtures[1].job_id }), 1)
            test.eq(#query("SELECT id FROM kickside_job WHERE id=$1", { fixtures[2].job_id }), 0)
            for _, fixture in ipairs(fixtures) do
                exec("UPDATE kickside_uploads SET storage_state='completed' WHERE uuid=$1", { fixture.upload_id })
            end

            for _ = 1, 2 do
                local result = assert(funcs.call("kickside.uploads:retention", {}))
                test.is_true(result.success, tostring(result.error))
            end
            test.eq(#terminal_events(component_id, stored_only), 0, "storage-only uploads have no processing outcome")
            for _, fixture in ipairs(fixtures) do
                local events = terminal_events(component_id, fixture.upload_id)
                test.eq(#events, 1)
                test.eq(events[1].external_version, "attempt:1")
                test.eq(events[1].type, fixture.invalid and upload_types.EVENT.FAILED or upload_types.EVENT.COMPLETED)
                if fixture.invalid then
                    local body = type(events[1].body) == "table" and events[1].body or assert(json.decode(events[1].body))
                    test.contains(body.error, "is not canonical")
                    test.eq(query("SELECT storage_state FROM kickside_uploads WHERE uuid=$1", { fixture.upload_id })[1].storage_state,
                        "failed")
                end
            end
        end)

        test.it("preserves completed storage after callback expiry and reports invalid declarations", function()
            local component_id, owner = user_container()
            local expired, invalid, good = uuid.v4(), uuid.v4(), uuid.v4()
            local key = assert(secret_cipher.load_key(assert(env.get("kickside.uploads.env:encryption_key"))))
            local function metadata(upload_id, issued_at, trace_context)
                local token = assert(secret_cipher.seal(assert(json.encode({ upload_id = upload_id,
                    function_id = "app:callback_probe", actor_id = owner, actor_context = "{}",
                    issued_at = issued_at, trace_context = trace_context })), key))
                return assert(json.encode({ __upload_token = token }))
            end
            local expired_job = "00000000-0000-4000-8000-000000000001"
            local invalid_job = "00000000-0000-4000-8000-000000000002"
            checkpoint(component_id, owner, expired, expired_job, metadata(expired, os.time() - 86401, nil))
            checkpoint(component_id, owner, invalid, invalid_job, metadata(invalid, os.time(), { unknown = "field" }))
            checkpoint(component_id, owner, good, "00000000-0000-4000-8000-000000000003", metadata(good, os.time(), "older trace"))
            exec("UPDATE kickside_thread SET max_pruned_seq=5 WHERE id=$1", { component_id })
            local tombstone = model(component_id, 3)
            local blob_id = uuid.v4()
            local storage = assert(fs.get("app:uploads"))
            local _, write_err = storage:writefile(blob_id, "bytes")
            test.is_nil(write_err, tostring(write_err))
            exec([[INSERT INTO kickside_upload_artifact_blobs
                (blob_id,checksum,mime_type,size,storage_id,storage_path,created_at,updated_at)
                VALUES ($1,$2,'text/plain',5,'app:uploads',$2,$3,$3)]], { blob_id, blob_id, stamp(-40) })

            local result, err = funcs.call("kickside.uploads:retention", {})
            test.is_nil(err, tostring(err))
            test.is_true(result.success, tostring(result.error))
            local again = assert(funcs.call("kickside.uploads:retention", {}))
            test.is_true(again.success, tostring(again.error))
            local expired_events = terminal_events(component_id, expired)
            test.eq(#expired_events, 1)
            test.eq(expired_events[1].external_version, expired_job)
            test.eq(expired_events[1].type, upload_types.EVENT.COMPLETED)
            local expired_body = type(expired_events[1].body) == "table" and expired_events[1].body
                or assert(json.decode(expired_events[1].body))
            test.contains(expired_body.callback_error, "could not be verified")
            test.eq(assert(upload_query_repo.get(expired)).storage_state, "completed")
            local invalid_events = terminal_events(component_id, invalid)
            test.eq(#invalid_events, 1)
            test.eq(invalid_events[1].external_version, invalid_job)
            test.eq(invalid_events[1].type, upload_types.EVENT.FAILED)
            local invalid_body = type(invalid_events[1].body) == "table" and invalid_events[1].body
                or assert(json.decode(invalid_events[1].body))
            test.contains(invalid_body.error, "is not canonical")
            test.eq(assert(upload_query_repo.get(invalid)).storage_state, "failed")
            local good_events = terminal_events(component_id, good)
            test.eq(#good_events, 1)
            test.eq(good_events[1].type, upload_types.EVENT.COMPLETED)
            test.eq(#query("SELECT id FROM kickside_job WHERE thread_id=$1 AND job_type=$2",
                { component_id, "kickside.uploads.service:callback_job" }), 0)
            test.eq(count(tombstone), 0)
            test.eq(#query("SELECT blob_id FROM kickside_upload_artifact_blobs WHERE blob_id=$1", { blob_id }), 0)
        end)

        test.it("bounds candidate discovery across 10000 terminal uploads", function()
            local component_id, owner = user_container()
            local db = assert(sql.get(DB))
            local postgres = tostring(db:type()) == sql.type.POSTGRES
            local prefix = "10000000-0000-4000-8000-"
            local ident = postgres and "($1 || LPAD(CAST(n AS TEXT),12,'0'))"
                or "($1 || PRINTF('%012d', n))"
            local ids = "WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<10000) "
            exec(ids .. [[INSERT INTO kickside_uploads
                (uuid,actor_id,mime_type,size,storage_id,storage_path,type_id,storage_state,metadata,
                    processing_intent_state,processing_job_id)
                SELECT ]] .. ident .. ",$2,'text/plain',1,'app:uploads'," .. ident
                .. ",'text','completed','{}',CASE WHEN n>4400 THEN 'acknowledged' END,CASE WHEN n>4400 THEN "
                .. ident .. " END FROM seq", { prefix, owner })
            exec(ids .. [[INSERT INTO kickside_upload_read_model (upload_id,component_id,status)
                SELECT ]] .. ident .. ",$2,'completed' FROM seq WHERE n>1250", { prefix, component_id })
            exec(ids .. [[INSERT INTO kickside_uploads
                (uuid,actor_id,mime_type,size,storage_id,storage_path,type_id,storage_state,metadata)
                SELECT ]] .. ident .. ",$2,'text/plain',1,'app:uploads'," .. ident
                .. ",'text','uploaded','{}' FROM seq WHERE n<=1830", { "20000000-0000-4000-8000-", owner })
            local last_job, last_upload = uuid.v4(), prefix .. "000000010001"
            checkpoint(component_id, owner, last_upload, last_job, "{}")
            if postgres then
                exec("ANALYZE kickside_uploads", {})
                exec("ANALYZE kickside_upload_read_model", {})
            end

            local batch = 500
            local cursor = prefix .. "000000000000"
            local found, examined = nil, 0
            local function query_page(handle: any, statement: string, params: { any }): (any, error?)
                local plan = assert(handle:query((postgres and "EXPLAIN (ANALYZE, BUFFERS) " or "EXPLAIN QUERY PLAN ")
                    .. statement, params))
                local seek, candidate_index = false, false
                for _, row in ipairs(plan) do
                    local detail = tostring(postgres and row["QUERY PLAN"] or row.detail)
                    candidate_index = candidate_index or detail:find("idx_upload_checkpoint_candidates", 1, true) ~= nil
                    if postgres then
                        local rows, loops = detail:match("actual time=[^ ]+ rows=(%d+) loops=(%d+)")
                        if rows and loops then
                            test.is_true(assert(tonumber(rows)) * assert(tonumber(loops)) <= batch, detail)
                        end
                        local removed = detail:match("Rows Removed by [%a ]+: (%d+)")
                        if removed then test.is_true(assert(tonumber(removed)) <= batch, detail) end
                        seek = seek or detail:find("Index Cond:", 1, true) ~= nil
                    else
                        seek = seek or (detail:find("SEARCH", 1, true) ~= nil and detail:find("uuid>?", 1, true) ~= nil)
                        test.is_false(detail:find("USE TEMP B-TREE FOR ORDER BY", 1, true) ~= nil, detail)
                    end
                end
                test.is_true(seek, "candidate discovery advances by an indexed seek")
                test.is_true(candidate_index, "the page reads the partial checkpoint index")
                local rows, err = handle:query(statement, params)
                if rows then examined = examined + #rows end
                return rows, err
            end
            local probe = {
                type = function() return db:type() end,
                query = function(_: any, statement: string, params: { any }): (any, error?)
                    return query_page(db, statement, params)
                end,
                begin = function(): (any, error?)
                    local tx = assert(db:begin())
                    return {
                        execute = function(_: any, statement: string): (any, error?) return tx:execute(statement) end,
                        query = function(_: any, statement: string, params: { any }): (any, error?)
                            return query_page(tx, statement, params)
                        end,
                        rollback = function(): (any, error?) return tx:rollback() end,
                    }, nil
                end,
            }
            if postgres then
                local _, err, next_cursor = upload_query_repo.list_checkpoints(batch, nil, probe)
                test.is_nil(err, tostring(err))
                test.not_nil(next_cursor)
                test.eq(examined, batch)
                examined = 0
            end
            for page = 1, 21 do
                local rows, err, next_cursor = upload_query_repo.list_checkpoints(batch, cursor, probe)
                test.is_nil(err, tostring(err))
                if page <= 20 then
                    test.eq(#rows, 0)
                    test.eq(next_cursor, prefix .. string.format("%012d", page * batch))
                    test.eq(examined, page * batch)
                    cursor = next_cursor
                else
                    found = rows[1] and rows[1].uuid
                end
            end
            test.eq(found, last_upload)
            db:release()
            local _, wake_err = notifier.notify({ kind = "uploads_retention_test" })
            test.is_nil(wake_err, tostring(wake_err))
            local events = {}
            local deadline = time.now():unix_nano() + WAIT_MS * 1000000
            while #events == 0 and time.now():unix_nano() < deadline do
                events = query("SELECT external_version FROM kickside_event WHERE thread_id=$1 AND external_id=$2 AND type=$3",
                    { component_id, last_upload, upload_types.EVENT.COMPLETED })
                if #events == 0 then time.sleep("50ms") end
            end
            test.eq(#events, 1, "the retention owner advances past empty pages")
            test.eq(events[1].external_version, last_job)
            exec("DELETE FROM kickside_upload_read_model WHERE component_id=$1", { component_id })
            exec("DELETE FROM kickside_uploads WHERE actor_id=$1", { owner })
        end)

        test.it("publishes legacy terminal checkpoints after Jobs prunes their parents", function()
            local component_id, owner = user_container()
            local function outcomes(upload_id: string): { table }
                return query([[SELECT type,external_version FROM kickside_event
                    WHERE thread_id=$1 AND external_source='uploads' AND external_id=$2 AND type IN ($3,$4)]],
                    { component_id, upload_id, upload_types.EVENT.COMPLETED, upload_types.EVENT.FAILED })
            end
            local checkpoints = {}
            for _, fixture in ipairs({
                {},
                { failed = true },
                { outcome = "pending" },
                { outcome = "dead" },
            }) do
                local upload_id, job_id = uuid.v4(), uuid.v4()
                checkpoints[#checkpoints + 1] = { upload_id = upload_id, job_id = job_id, failed = fixture.failed }
                exec([[INSERT INTO kickside_job
                    (id,thread_id,job_type,payload,job_identity,owner_kind,owner_id,status,finished_at,last_error)
                    VALUES ($1,$2,'kickside.uploads.service:process_job_proc',$3,$4,'user',$5,'dead',$6,
                        'publication interrupted')]], { job_id, component_id, '{"upload_id":"' .. upload_id .. '"}',
                    "7:uploads" .. #upload_id .. ":" .. upload_id .. "7:process", owner, stamp(fixture.outcome and 0 or -40) })
                local metadata = "{}"
                if not fixture.failed and not fixture.outcome then
                    local token = assert(upload_tokens.pack({ upload_id = upload_id, function_id = "app:callback_probe",
                        actor_id = owner, actor_context = "{}" }))
                    metadata = assert(json.encode({ __upload_token = token }))
                end
                if fixture.outcome then
                    exec([[INSERT INTO kickside_job
                        (id,thread_id,job_type,payload,job_identity,owner_kind,owner_id,status)
                        VALUES ($1,$2,'kickside.uploads.service:process_dead',$3,$4,'user',$5,$6)]],
                        { uuid.v4(), component_id, assert(json.encode({ job_id = job_id })),
                            "18:kickside.jobs.dead" .. #job_id .. ":" .. job_id .. "7:outcome", owner, fixture.outcome })
                end
                -- Keep the checkpoint ineligible while the live sweeper is running.
                checkpoint(component_id, owner, upload_id, job_id, metadata, "uploaded")
                test.eq(#outcomes(upload_id), 0)
            end

            local db = assert(sql.get(DB))
            assert(jobs_retention.sweep(db, tostring(db:type())))
            db:release()
            for i = 1, 2 do
                test.eq(#query("SELECT id FROM kickside_job WHERE id=$1", {checkpoints[i].job_id}), 0,
                    "the expired parent is pruned before checkpoint recovery")
            end

            for _, item in ipairs(checkpoints) do
                exec("UPDATE kickside_uploads SET storage_state=$1 WHERE uuid=$2",
                    { item.failed and "failed" or "completed", item.upload_id })
            end
            await_sweeper()
            local _, wake_err = notifier.notify({ kind = "uploads_retention_test" })
            test.is_nil(wake_err, tostring(wake_err))
            local deadline = time.now():unix_nano() + WAIT_MS * 1000000
            for _, checkpoint in ipairs(checkpoints) do
                local event_type = checkpoint.failed and upload_types.EVENT.FAILED or upload_types.EVENT.COMPLETED
                local events = outcomes(checkpoint.upload_id)
                while #events == 0 and time.now():unix_nano() < deadline do
                    time.sleep("50ms")
                    events = outcomes(checkpoint.upload_id)
                end
                test.eq(#events, 1, "normal recovery publishes the stored outcome")
                test.eq(events[1].external_version, checkpoint.job_id)
                test.eq(events[1].type, event_type)
            end
            local repeated = assert(funcs.call("kickside.uploads:retention", {}))
            test.is_true(repeated.success, tostring(repeated.error))
            for _, checkpoint in ipairs(checkpoints) do
                test.eq(#outcomes(checkpoint.upload_id), 1, "repeated recovery keeps one event per checkpoint")
            end
            local jobs = query("SELECT job_type FROM kickside_job WHERE thread_id=$1 AND job_type IN ($2,$3)",
                { component_id, "kickside.uploads.service:process_dead", "kickside.uploads.service:callback_job" })
            local outcomes_count = 0
            for _, job in ipairs(jobs) do
                if job.job_type == "kickside.uploads.service:process_dead" then outcomes_count = outcomes_count + 1 end
            end
            test.eq(outcomes_count, 2, "recovery creates no outcome jobs")
            test.eq(#jobs - outcomes_count, 0, "historical recovery does not replay an unverified callback")

            local projected = checkpoints[1].upload_id
            exec("UPDATE kickside_upload_read_model SET status='completed' WHERE upload_id=$1", { projected })
            exec("DELETE FROM kickside_event WHERE thread_id=$1 AND external_id=$2", { component_id, projected })
            local after_prune, prune_err = funcs.call("kickside.uploads:retention", {})
            test.is_nil(prune_err, tostring(prune_err))
            test.is_true(after_prune.success, tostring(after_prune.error))
            test.eq(#outcomes(projected), 0, "a projected completion is not republished after event retention")
        end)

        test.it("reclaims a user container's pruned tombstone and keeps the sweeper running", function()
            local component_id = user_container()
            local db = assert(sql.get(DB))
            local threads, thread_err = db:query("SELECT id FROM kickside_thread WHERE id=$1", { component_id })
            db:release()
            test.is_nil(thread_err, tostring(thread_err))
            test.eq(#(threads :: table), 1, "the user's uploads container is a Core thread")
            exec("UPDATE kickside_thread SET max_pruned_seq=5 WHERE id=$1", { component_id })
            local pruned = model(component_id, 3)
            local retained = model(component_id, 9)

            local before = await_sweeper()
            local woken, wake_err = notifier.notify({ kind = "uploads_retention_test" })
            test.is_nil(wake_err, tostring(wake_err))
            test.is_true(woken == true, "the sweeper service receives the wake")

            local deadline = time.now():unix_nano() + WAIT_MS * 1000000
            while count(pruned) > 0 and time.now():unix_nano() < deadline do time.sleep("100ms") end
            test.eq(count(pruned), 0, "a tombstone below the Core prune boundary is reclaimed by the sweeper")
            test.eq(count(retained), 1, "a tombstone above the Core prune boundary stays as a replay fence")
            test.eq(sweeper_pid(), before, "the sweeper process survives the uploads owner pass")

            exec("DELETE FROM kickside_upload_read_model WHERE upload_id=$1", { retained })
        end)

        test.it("grants the uploads owner's policies the boundary of uploads containers only", function()
            -- The uploads boundary grant plus runtime reads, without the caller's allow-all scope.
            local policies = {}
            for _, id in ipairs({ "app:retention_runtime_read",
                "kickside.uploads.security:retention_prune_boundary" }) do
                local policy, policy_err = security.policy(id)
                test.is_nil(policy_err, tostring(policy_err))
                policies[#policies + 1] = policy
            end
            local definition, definition_err = contract.get("kickside.core:threads")
            test.is_nil(definition_err, tostring(definition_err))
            local threads, open_err = (definition :: any):with_scope(security.new_scope(policies)):open()
            test.is_nil(open_err, tostring(open_err))

            local component_id = user_container()
            exec("UPDATE kickside_thread SET max_pruned_seq=5 WHERE id=$1", { component_id })
            local boundary, boundary_err = threads:prune_boundary({ thread_id = component_id })
            test.is_nil(boundary_err, tostring(boundary_err))
            test.eq((boundary :: table).max_pruned_seq, 5)

            local foreign = uuid.v4()
            exec([[INSERT INTO kickside_thread (id,thread_class,component_id,event_count,max_pruned_seq)
                VALUES ($1,'uploads_retention_foreign','',0,5)]], { foreign })
            local refused, refused_err = threads:prune_boundary({ thread_id = foreign })
            exec("DELETE FROM kickside_thread WHERE id=$1", { foreign })
            test.is_nil(refused)
            test.not_nil(refused_err)
            test.is_true(errors.is(refused_err, errors.PERMISSION_DENIED), tostring(refused_err))

            local _, missing_err = threads:prune_boundary({ thread_id = uuid.v4() })
            test.is_true(errors.is(missing_err, errors.NOT_FOUND), tostring(missing_err))
        end)

        test.it("reports a missing upload thread and continues to the next checkpoint page", function()
            local good_thread, good_owner = user_container()
            local purged_owner = "purged-upload-thread-" .. uuid.v4()
            local purged_thread = assert(upload_types.component_id_for_owner(purged_owner))
            local prefix = "00000000-0000-4000-8000-"
            local cursor = prefix .. "000000000000"
            local blocked_upload = prefix .. "000000000001"
            local good_upload = prefix .. "000000000502"
            checkpoint(purged_thread, purged_owner, blocked_upload, uuid.v4(), "{}", "failed")
            for i = 2, 501 do
                local id = prefix .. string.format("%012d", i)
                checkpoint(good_thread, good_owner, id, uuid.v4(), "{}", "completed")
                exec("UPDATE kickside_upload_read_model SET status='completed' WHERE upload_id=$1", { id })
            end
            local good_job = uuid.v4()
            checkpoint(good_thread, good_owner, good_upload, good_job, "{}")
            test.eq(#query("SELECT id FROM kickside_thread WHERE id=$1", { purged_thread }), 0)
            local ok, failure = pcall(function()
                local first = assert(funcs.call("kickside.uploads:retention", { cursor = cursor }))
                test.is_true(first.success, tostring(first.error))
                test.eq(#first.blocked, 1)
                test.eq(first.blocked[1].component_id, purged_thread)
                test.is_true(errors.is(first.blocked[1].error, errors.NOT_FOUND))
                test.is_true(first.needs_continue)
                test.not_nil(first.cursor)

                local count = 0
                while first.cursor and count < 502 do
                    first = assert(funcs.call("kickside.uploads:retention", { cursor = first.cursor }))
                    test.is_true(first.success, tostring(first.error))
                    count = count + 1
                    if #terminal_events(good_thread, good_upload) > 0 then break end
                end
                local events = terminal_events(good_thread, good_upload)
                test.eq(#events, 1)
                test.eq(events[1].external_version, good_job)
            end)
            exec("DELETE FROM kickside_upload_read_model WHERE upload_id BETWEEN $1 AND $2", { blocked_upload, good_upload })
            exec("DELETE FROM kickside_uploads WHERE uuid BETWEEN $1 AND $2", { blocked_upload, good_upload })
            if not ok then error(failure) end
        end)
    end)
end)
