local worker_dispatch = require("worker_dispatch")
local jobs_lifecycle = require("jobs_lifecycle")
local jobs_claim = require("jobs_claim")
local test = require("test")
local registry = require("registry")
local funcs = require("funcs")
local fs = require("fs")
local uuid_v4 = require("uuid").v4
local security = require("security")
local json = require("json")
local compress = require("compress")
local sql = require("sql")
local time = require("time")
local errors = require("errors")
local base64 = require("base64")
local hash = require("hash")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local metadata_sanitizer = require("metadata_sanitizer")
local execution_identity = require("execution_identity")
local upload_record_repo = require("upload_record_repo")
local upload_query_repo = require("upload_query_repo")
local upload_read_model = require("upload_read_model")
local upload_lib = require("upload_lib")
local upload_tokens = require("upload_tokens")
local uploads_events = require("uploads_events")
local upload_types = require("types")
local provision = require("provision")
local pipeline_lib = require("pipeline_lib")
local process_worker = require("process_worker")
local processing_intent_repo = require("processing_intent_repo")
local process_job = require("process_job")
local callback_job = require("callback_job")
local jobs = require("jobs")
local upload_response = require("upload_response")
local processor = require("processor")
local file_provider = require("file_provider")
local IDENTITY_META_KEY = assert(execution_identity.CONTEXT_KEY, "execution_identity.CONTEXT_KEY is required")

local function admit_job(db: sql.DB, id: string, attempts: integer): table
    local dbtype = tostring(db:type())
    local tx = assert(db:begin())
    assert(tx:execute("UPDATE kickside_job SET attempts=$1 WHERE id=$2", {attempts - 1, id}))
    local leased, err = jobs_claim.lease_row(tx, dbtype, id, uuid_v4(),
        jobs_lifecycle.future_string(dbtype, 60), jobs_lifecycle.now_string(dbtype))
    if err or not leased then tx:rollback(); error(err or "fixture job is not pending") end
    assert(tx:commit())
    return assert(db:query("SELECT * FROM kickside_job WHERE id=$1", {id}))[1]
end

local function field(value: any, key: string): any
	if type(value) ~= "table" then
		return nil
	end
	return value[key]
end

local function p16(n: number): string
	return string.char(math.floor(n % 256), math.floor(n / 256) % 256)
end

local function p32(n: number): string
	return string.char(
		math.floor(n % 256),
		math.floor(n / 256) % 256,
		math.floor(n / 65536) % 256,
		math.floor(n / 16777216) % 256
	)
end

-- Build a minimal zip from { {name, data, method} } where method is 0 (store) or 8
-- (deflate). Mirrors the zip_reader round-trip helper; CRC fields are left zero.
local function build_zip(files: any): string
	local locals = {}
	local centrals = {}
	local offset = 0
	for _, f in ipairs(files) do
		local raw = f.data
		local method = f.method or 0
		local payload = raw
		if method == 8 then
			local enc, err = compress.deflate.encode(raw :: string)
			if err then
				error("deflate encode failed: " .. tostring(err))
			end
			payload = enc
		end
		local fn = f.name
		local lfh = p32(0x04034b50)
			.. p16(20)
			.. p16(0)
			.. p16(method)
			.. p16(0)
			.. p16(0)
			.. p32(0)
			.. p32(#payload)
			.. p32(#raw)
			.. p16(#fn)
			.. p16(0)
			.. fn
			.. payload
		local cdh = p32(0x02014b50)
			.. p16(20)
			.. p16(20)
			.. p16(0)
			.. p16(method)
			.. p16(0)
			.. p16(0)
			.. p32(0)
			.. p32(#payload)
			.. p32(#raw)
			.. p16(#fn)
			.. p16(0)
			.. p16(0)
			.. p16(0)
			.. p16(0)
			.. p32(0)
			.. p32(offset)
			.. fn
		locals[#locals + 1] = lfh
		centrals[#centrals + 1] = cdh
		offset = offset + #lfh
	end
	local local_blob = table.concat(locals)
	local central_blob = table.concat(centrals)
	local eocd = p32(0x06054b50)
		.. p16(0)
		.. p16(0)
		.. p16(#files)
		.. p16(#files)
		.. p32(#central_blob)
		.. p32(#local_blob)
		.. p16(0)
	return local_blob .. central_blob .. eocd
end

local function value(entry: any, key: string): any
	if type(entry) ~= "table" then
		return nil
	end
	if entry[key] ~= nil then
		return entry[key]
	end
	if type(entry.data) == "table" then
		return entry.data[key]
	end
	return nil
end

local function meta(entry: any): any
	return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function entry(id: string): any
	local found, err = registry.get(id)
	test.is_nil(err)
	test.not_nil(found, id .. " is missing")
	return found
end

local function executor(user_id: string): any
	local actor: any = security.new_actor(user_id, { security_groups = { "app:uploads_test" } })
	local scope: any = security.named_scope("wippy.security:process")
	return funcs.new():with_actor(actor):with_scope(scope)
end

local function seed_user(user_id: string): ()
	local db, db_err = sql.get("app:db")
	test.is_nil(db_err)
	local _, user_err = db:execute(
		[[INSERT INTO app_users
        (user_id, email, full_name, password_hash, status)
        VALUES ($1, $2, $3, $4, 'active') ON CONFLICT (user_id) DO NOTHING]],
		{ user_id, user_id .. "@uploads.test", user_id, "test-only" }
	)
	test.is_nil(user_err)
	for _, group_id in ipairs({ "app:uploads_test", "wippy.security:process" }) do
		local _, group_err = db:execute(
			[[INSERT INTO app_user_groups (user_id, group_id)
            VALUES ($1, $2) ON CONFLICT (user_id, group_id) DO NOTHING]],
			{ user_id, group_id }
		)
		test.is_nil(group_err)
	end
	db:release()
end

local function require_integration_schema(): ()
	local last_err: any = nil
	for _ = 1, 100 do
		local db, db_err = sql.get("app:db")
		if db_err or not db then
			last_err = db_err
		else
			local _, core_err = db:query("SELECT max_pruned_seq FROM kickside_thread LIMIT 0")
			local _, users_err = db:query("SELECT auth_generation FROM app_users LIMIT 0")
			db:release()
			if not core_err and not users_err then
				return
			end
			last_err = core_err or users_err
		end
		time.sleep("100ms")
	end
	error("upload integration schema did not become ready: " .. tostring(last_err))
end

local function ensure_uploads_component(user_id: string): ()
	seed_user(user_id)
	local actor: any = security.new_actor(user_id, { security_groups = { "app:uploads_test" } })
	local scope: any = security.named_scope("wippy.security:process")
	local ids, err = provision.ensure_user(actor, scope, user_id)
	test.is_nil(err)
	test.is_true(type(ids) == "table")
end

local function upload_metadata(user_id: string, filename: string): any
	seed_user(user_id)
	local row, err = execution_identity.to_row({
		version = execution_identity.VERSION,
		principal = { kind = execution_identity.KIND.USER, id = user_id },
		authorized_by = { kind = execution_identity.KIND.USER, id = user_id },
		captured_at = execution_identity.utc_now(),
	})
	test.is_nil(err)
	return {
		filename = filename,
		[IDENTITY_META_KEY] = { actor_id = row.actor_id, actor_context = row.actor_context },
	}
end

local function actor_context(user_id: string): string
	local row = upload_metadata(user_id, "fixture.txt")[IDENTITY_META_KEY]
	return row.actor_context
end

local function metadata_with_identity(user_id: string, filename: string, metadata: any): any
	local out: any = {}
	if type(metadata) == "table" then
		for k, v in pairs(metadata) do
			out[k] = v
		end
	end
	local identity = upload_metadata(user_id, filename)
	out[IDENTITY_META_KEY] = identity[IDENTITY_META_KEY]
	if out.filename == nil then
		out.filename = filename
	end
	return out
end

local function client_metadata(filename: string, metadata: any): any
	local out: any = { filename = filename }
	if type(metadata) == "table" then
		for k, v in pairs(metadata) do
			out[k] = v
		end
	end
	return out
end

local function upload_as(
	actor_id: string,
	bytes: string,
	filename: string,
	size: number,
	mime_type: string,
	storage_id: string?,
	metadata: any
): (any?, any?)
	seed_user(actor_id)
	return executor(actor_id):call("app:admit_upload", {
		action = "upload",
		actor_id = actor_id,
		bytes = bytes,
		filename = filename,
		size = size,
		mime_type = mime_type,
		storage_id = storage_id,
		metadata = metadata,
	})
end

local function complete_as(actor_id: string, upload_id: string, etag: string, metadata: any): (any?, any?)
	seed_user(actor_id)
	return executor(actor_id):call("app:admit_upload", {
		action = "complete",
		actor_id = actor_id,
		upload_id = upload_id,
		etag = etag,
		metadata = metadata,
	})
end

local function create_completed_upload(
	upload_id: string,
	user_id: string,
	mime_type: string,
	filename: string,
	size: integer
): any
	local upload, upload_err = upload_record_repo.create(
		upload_id,
		user_id,
		size,
		mime_type,
		"app:uploads",
		upload_id .. ".bin",
		"documents",
		{ filename = filename },
		"completed"
	)
	test.is_nil(upload_err)
	test.not_nil(upload)
	return upload
end

local function create_completed_upload_with_bytes(
	upload_id: string,
	user_id: string,
	mime_type: string,
	filename: string,
	bytes: string,
	type_id: string?
): any
	local storage = fs.get("app:uploads")
	test.not_nil(storage)
	local path = upload_id .. ".bin"
	local ok, write_err = storage:writefile(path, bytes)
	test.is_nil(write_err)
	test.is_true(ok)

	local upload, upload_err = upload_record_repo.create(
		upload_id,
		user_id,
		#bytes,
		mime_type,
		"app:uploads",
		path,
		type_id or "images",
		{ filename = filename },
		"completed"
	)
	test.is_nil(upload_err)
	test.not_nil(upload)
	return upload
end

local function storage_has_prefix(storage, prefix: string): boolean
	local iter, state = storage:readdir(".")
	if not iter then
		error("failed to list upload test storage: " .. tostring(state))
	end
	for item in iter, state do
		if type(item.name) == "string" and item.name:sub(1, #prefix) == prefix then
			return true
		end
	end
	return false
end

local function define_tests()
	test.describe("kickside.uploads packaging", function()
		test.before_all(require_integration_schema)
		test.it("excludes forged attachment cleanup state from admission and worker processing", function()
			local user_id = "attachment-user-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local storage = assert(fs.get("app:uploads"))
			local victim = "unreferenced-" .. uuid_v4() .. ".txt"
			test.is_nil(select(2, storage:writefile(victim, "retained bytes")))
			local upload, ingest_err = executor(user_id):call("app:admit_upload", {
				action = "attachment", bytes = "attachment text " .. uuid_v4(),
				attachment = {
					url = "https://attachment.test/source", actor_id = user_id,
					filename = "attachment.txt", mime = "text/plain",
					thread_id = "attachment-thread", external_message_id = "attachment-message",
					metadata = {
						__relocation_cleanup = { { storage_id = "app:uploads", storage_path = victim } },
						_private = "forged", storage_id = "forged", storage_path = "forged",
						original_storage_id = "forged", original_storage_path = "forged", checksum = "forged",
						ticket = { id = "ticket-1" }, thread_id = "forged",
					},
				},
			})
			test.is_nil(ingest_err)
			test.not_nil(upload)
			local admitted = assert(upload_query_repo.get(upload.uuid))

			local db = assert(sql.get("app:db"))
			local rows = assert(db:query([[SELECT * FROM kickside_job
                WHERE job_type = 'kickside.uploads.service:process_job_proc' AND CAST(payload AS TEXT) LIKE $1]],
				{ "%" .. upload.uuid .. "%" }))
			test.eq(#rows, 1)
			local token = uuid_v4()
			test.is_nil(select(2, db:execute([[UPDATE kickside_job SET status='running',lease_token=$1,
                execution_seq=1,attempts=1,lease_until=$2 WHERE id=$3]],
				{ token, jobs_lifecycle.future_string(tostring(db:type()), 60), rows[1].id })))
			local job = assert(db:query("SELECT * FROM kickside_job WHERE id=$1", { rows[1].id }))[1]
			db:release()
			local input, _, input_err = worker_dispatch.build_worker_input(job)
			test.is_nil(input_err)
			local result, run_err = process_job.run(input)
			test.is_nil(run_err)
			test.is_true(result.success)
			test.is_nil(admitted.metadata.__relocation_cleanup)
			test.is_nil(admitted.metadata._private)
			for _, key in ipairs({ "storage_id", "storage_path", "original_storage_id", "original_storage_path", "checksum" }) do
				test.is_nil(admitted.metadata[key])
			end
			test.eq(admitted.metadata[IDENTITY_META_KEY].actor_id, user_id)
			test.eq(admitted.metadata.ticket.id, "ticket-1")
			test.eq(admitted.metadata.thread_id, "attachment-thread")

			local stored = assert(upload_query_repo.get(upload.uuid))
			test.eq(stored.storage_state, "completed")
			test.is_nil(stored.metadata.__relocation_cleanup)
			local retained, read_err = storage:readfile(victim)
			test.is_nil(read_err)
			test.eq(retained, "retained bytes")
			test.is_nil(select(2, storage:remove(victim)))
		end)

		test.it("terminal upload failures retain stored bytes and artifacts", function()
			local storage = fs.get("app:uploads")
			test.not_nil(storage)

			local upload_id = "failed-cleanup-" .. uuid_v4()
			local path = upload_id .. ".bin"
			local bytes = "failed upload bytes " .. upload_id
			local write_ok, write_err = storage:writefile(path, bytes)
			test.is_nil(write_err)
			test.is_true(write_ok ~= false)

			local upload, upload_err = upload_record_repo.create(
				upload_id,
				"failed-cleanup-user",
				#bytes,
				"application/pdf",
				"app:uploads",
				path,
				"documents",
				{ filename = "failed.pdf" },
				"uploaded"
			)
			test.is_nil(upload_err)
			test.not_nil(upload)

			local artifact, artifact_err = artifact_content_repo.create_artifact({
				upload_id = upload_id,
				kind = "image",
				role = "extracted-image",
				mime_type = "image/png",
				label = "partial.png",
				ordinal = 1,
				content = "partial artifact bytes " .. upload_id,
				storage_id = "app:uploads",
			})
			test.is_nil(artifact_err)
			test.not_nil(artifact)
			local artifact_path = artifact_content_repo.get_blob(artifact.blob_id).storage_path

			-- A terminally failed upload keeps its original bytes and partial artifacts,
			-- so it stays durable and re-processable.
			test.eq(bytes, (storage:readfile(path)))
			test.eq("partial artifact bytes " .. upload_id, (storage:readfile(artifact_path)))
			test.eq(1, #artifact_parts_repo.list_artifacts(upload_id))
			local blob, blob_err = artifact_content_repo.get_blob(artifact.blob_id)
			test.is_nil(blob_err)
			test.not_nil(blob)

			-- The row survives so the user still sees the failed upload.
			local row, row_err = upload_query_repo.get(upload_id)
			test.is_nil(row_err)
			test.not_nil(row)
			test.eq(upload_id, row.uuid)
		end)

		for _, retryable in ipairs({ false, true }) do
			test.it(
				"preserves classified relocation failures through pipeline and job for retryable="
					.. tostring(retryable),
				function()
					local id, owner = uuid_v4(), "relocation-user-" .. uuid_v4()
					ensure_uploads_component(owner)
					local storage = assert(fs.get("app:uploads"))
					assert(storage:writefile(id, "relocation source"))
					local upload = assert(
						upload_record_repo.create(
							id,
							owner,
							17,
							"text/plain",
							"app:uploads",
							id,
							"app:types.relocation",
							upload_metadata(owner, "relocation.txt"),
							"uploaded"
						)
					)
					local kind = retryable and errors.UNAVAILABLE or errors.PERMISSION_DENIED
					local source = errors.new({
						kind = kind,
						message = "target metadata refused",
						retryable = retryable,
						details = {
							code = "relocation_target",
							cause = {
								kind = errors.CONFLICT,
								message = "native target cause",
								retryable = retryable,
								details = { target = "original" },
							},
						},
					})
					local apply = pipeline_lib.apply_relocation
					pipeline_lib.apply_relocation = function()
						return nil, source
					end
					local success, pipeline_err, _, retriable = pipeline_lib.process_upload(upload)
					pipeline_lib.apply_relocation = apply
					test.is_false(success)
					test.eq("userdata", type(pipeline_err), tostring(pipeline_err))
					test.eq(kind, pipeline_err:kind())
					test.eq(retryable, pipeline_err:retryable())
					test.eq(retryable, retriable)
					test.eq("relocation_target", pipeline_err:details().code)
					test.eq(kind, pipeline_err:details().cause.kind)
					test.eq("native target cause", pipeline_err:details().cause.details.cause.message)

					local queued = assert(process_worker.enqueue_upload_job(upload, true))
					local db = assert(sql.get("app:db"))
					local job = admit_job(db, queued.job_id, 1)
					local input, _, input_err = worker_dispatch.build_worker_input(job)
					test.is_nil(input_err)
					pipeline_lib.apply_relocation = function()
						return nil, source
					end
					local result = process_job.main(input)
					pipeline_lib.apply_relocation = apply
					test.is_false(result.ok)
					test.eq(kind, result.error_native.kind)
					test.eq(retryable, result.error_native.retryable)
					test.eq("relocation_target", result.error_native.details.code)
					test.eq(kind, result.error_native.details.cause.kind)
					test.eq("native target cause", result.error_native.details.cause.details.cause.message)
					local _, transported = worker_dispatch.interpret_proc_result({ value = result })
					test.eq(kind, transported:kind())
					test.eq(retryable, transported:retryable())
					test.eq("native target cause", transported:details().cause.details.cause.message)
					local state =
						assert(db:query("SELECT storage_state FROM kickside_uploads WHERE uuid=$1", { id }))[1]
					local settled =
						assert(db:query("SELECT status FROM kickside_job WHERE id=$1", { queued.job_id }))[1]
					local events = assert(
						db:query(
							[[SELECT body FROM kickside_event
                    WHERE thread_id=$1 AND external_id=$2 AND type=$3]],
							{ queued.thread_id, id, uploads_events.TYPE.FAILED }
						)
					)
					db:release()
					test.eq(retryable and "uploaded" or "failed", state.storage_state)
					test.eq(retryable and "running" or "done", settled.status)
					test.eq(retryable and 0 or 1, #events)
					local exists, exists_err = storage:exists(id)
					test.is_nil(exists_err, tostring(exists_err))
					test.is_true(exists)
					assert(storage:remove(id))
				end
			)
		end

		test.it("process job terminal error retains the upload's stored bytes", function()
			local storage = fs.get("app:uploads")
			test.not_nil(storage)

			local upload_id = "job-error-cleanup-" .. uuid_v4()
			local user_id = "job-error-user-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local path = upload_id .. ".bin"
			local bytes = "job error bytes " .. upload_id
			local write_ok, write_err = storage:writefile(path, bytes)
			test.is_nil(write_err)
			test.is_true(write_ok ~= false)

			-- A non-existent type id fails pipeline resolution, so the job hits its
			-- terminal error path on this (default, final) attempt.
			local upload, upload_err = upload_record_repo.create(
				upload_id,
				user_id,
				#bytes,
				"application/octet-stream",
				"app:uploads",
				path,
				"nonexistent-type-" .. uuid_v4(),
				upload_metadata(user_id, "job-error.bin"),
				"uploaded"
			)
			test.is_nil(upload_err)
			test.not_nil(upload)

			local queued, queue_err = process_worker.enqueue_upload_job(upload, true)
			test.is_nil(queue_err)
			local db = assert(sql.get("app:db"))
			local job = admit_job(db, queued.job_id, 5)
			local input, _, input_err = worker_dispatch.build_worker_input(job)
			test.is_nil(input_err)
			local result, run_err = process_job.run(input)
			test.is_nil(run_err)
			test.not_nil(result)
			test.not_nil(result.job_error)
			test.eq(result.upload_id, upload_id)
			local events = assert(
				db:query(
					[[SELECT type,body FROM kickside_event
                WHERE thread_id=$1 AND external_id=$2 AND type=$3]],
					{ queued.thread_id, upload_id, uploads_events.TYPE.FAILED }
				)
			)
			test.eq(#events, 1)
			test.eq(events[1].type, uploads_events.TYPE.FAILED)
			test.eq(json.decode(events[1].body).upload_id, upload_id)
			local settled = assert(db:query("SELECT status,lease_token FROM kickside_job WHERE id=$1", { job.id }))[1]
			test.eq(settled.status, "done")
			test.is_nil(settled.lease_token)
			local runs = assert(db:query("SELECT status,error_text FROM kickside_job_run WHERE job_id=$1", { job.id }))
			test.eq(#runs, 1)
			test.eq(runs[1].status, "completed")
			test.is_nil(runs[1].error_text)
			db:release()

			local row, row_err = upload_query_repo.get(upload_id)
			test.is_nil(row_err)
			test.eq("failed", row.storage_state)
			test.eq(bytes, (storage:readfile(path)))
		end)

        test.it("keeps failure settled when the callback permanently refuses delivery", function()
            local id, owner = uuid_v4(), "callback-delivery-" .. uuid_v4()
            ensure_uploads_component(owner)
            local metadata = upload_metadata(owner, "callback.txt")
            local identity = metadata[IDENTITY_META_KEY]
            metadata.__upload_token = assert(upload_tokens.pack({upload_id = id,
                function_id = "app:callback_probe", on_error_id = "app:callback_reject",
                actor_id = identity.actor_id, actor_context = identity.actor_context}))
            local upload = assert(upload_record_repo.create(id, owner, 1, "text/plain", "app:uploads", id,
                "app:types.failing", metadata, "uploaded", nil, nil, true, 600000))
            local queued = assert(process_worker.enqueue_upload_job(upload, true))
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local processing = admit_job(db, queued.job_id, 5)
            test.is_nil(jobs_lifecycle.fail_job(db, processing, dbtype, "execution ended", "deterministic"))
            local settled, settle_err = process_job.dead({payload = {job_id = queued.job_id}})
            test.is_nil(settle_err, tostring(settle_err))
            test.is_true(settled.settled)
            local callbacks = assert(db:query("SELECT id FROM kickside_job WHERE job_type=$1 AND CAST(payload AS TEXT) LIKE $2",
                {"kickside.uploads.service:callback_job", "%" .. id .. "%"}))
            test.eq(#callbacks, 1)
            local callback = admit_job(db, callbacks[1].id, 1)
            local _, delivery_err = worker_dispatch.execute_job(db, dbtype, callback)
            test.is_true(errors.is(delivery_err, errors.INVALID), tostring(delivery_err))
            test.contains(tostring(delivery_err), "callback permanently refuses delivery")
            test.is_nil(jobs_lifecycle.fail_job(db, callback, dbtype, tostring(delivery_err), "deterministic"))
            test.eq(assert(db:query("SELECT status FROM kickside_job WHERE id=$1", {callback.id}))[1].status, "dead")
            test.eq(assert(upload_query_repo.get(id)).storage_state, "failed")
            local events = assert(db:query("SELECT id FROM kickside_event WHERE external_id=$1 AND type=$2",
                {id, uploads_events.TYPE.FAILED}))
            test.eq(#events, 1)
            db:release()
        end)

		test.it("settles terminal failure when its callback token is unreadable", function()
            local id, owner = uuid_v4(), "callback-failure-" .. uuid_v4()
            ensure_uploads_component(owner)
            local metadata = metadata_with_identity(owner, "failed.bin", {
                __upload_token = "unreadable-token",
                stage_metadata = {ocr_error = "storage_pointer_missing"},
            })
            local upload = assert(upload_record_repo.create(id, owner, 1, "application/octet-stream",
                "app:uploads", id, "app:types.failing", metadata, "uploaded", nil, nil, true, 600000))
            local queued = assert(process_worker.enqueue_upload_job(upload, true))
            local db = assert(sql.get("app:db"))
            local leased = admit_job(db, queued.job_id, 5)
            local input, _, input_err = worker_dispatch.build_worker_input(leased)
            test.is_nil(input_err, tostring(input_err))
            test.not_nil(input)
            local _, run_err = process_job.run(input)
            test.is_nil(run_err, tostring(run_err))
            test.eq(assert(upload_query_repo.get(id)).storage_state, "failed")
            local events = assert(db:query("SELECT body FROM kickside_event WHERE external_id=$1 AND type=$2",
                {id, uploads_events.TYPE.FAILED}))
            test.eq(#events, 1)
            test.not_nil(json.decode(events[1].body).callback_error, "undeliverable callback is recorded")
            db:release()
        end)

        test.it("retries mixed callback failures before committing failure settlement", function()
            local id, owner = uuid_v4(), "mixed-callback-" .. uuid_v4()
            ensure_uploads_component(owner)
            local metadata = upload_metadata(owner, "failed.bin")
            local identity = metadata[IDENTITY_META_KEY]
            local token = assert(upload_tokens.pack({upload_id = id,
                function_id = "app:callback_probe", on_error_id = "app:callback_probe",
                actor_id = identity.actor_id, actor_context = identity.actor_context}))
            metadata.stage_metadata = {ocr_error = "storage_pointer_missing"}
            metadata.__upload_tokens = {"unreadable-token", token}
            local upload = assert(upload_record_repo.create(id, owner, 1, "application/octet-stream",
                "app:uploads", id, "app:types.failing", metadata, "uploaded", nil, nil, true, 600000))
            local queued = assert(process_worker.enqueue_upload_job(upload, true))
            local db = assert(sql.get("app:db"))
            local leased = admit_job(db, queued.job_id, 5)
            local input, _, input_err = worker_dispatch.build_worker_input(leased)
            test.is_nil(input_err, tostring(input_err))
            test.not_nil(input)
            local enqueue = jobs.enqueue_tx
            local unavailable = errors.new({message = "callback admission unavailable", kind = errors.UNAVAILABLE, retryable = true})
            jobs.enqueue_tx = function() return nil, unavailable end
            local result, err = process_job.run(input)
            jobs.enqueue_tx = enqueue
            test.is_nil(result)
            test.eq(err, unavailable)
            test.eq(assert(upload_query_repo.get(id)).storage_state, "uploaded")
            test.eq(#assert(db:query("SELECT id FROM kickside_event WHERE external_id=$1 AND type=$2",
                {id, uploads_events.TYPE.FAILED})), 0)
            local settled, settle_err = process_job.run(input)
            test.is_nil(settle_err, tostring(settle_err))
            test.not_nil(settled.job_error)
            test.eq(assert(upload_query_repo.get(id)).storage_state, "failed")
            test.eq(#assert(db:query("SELECT id FROM kickside_job WHERE job_type=$1 AND CAST(payload AS TEXT) LIKE $2",
                {"kickside.uploads.service:callback_job", "%" .. id .. "%"})), 1)
            local events = assert(db:query("SELECT body FROM kickside_event WHERE external_id=$1 AND type=$2",
                {id, uploads_events.TYPE.FAILED}))
            test.eq(#events, 1)
            test.not_nil(json.decode(events[1].body).callback_error)
            db:release()
        end)

        for _, intent in ipairs({true, false}) do
            test.it("maintenance leaves live processing work alone with intent=" .. tostring(intent), function()
                local id, owner = uuid_v4(), "live-upload-" .. uuid_v4()
                ensure_uploads_component(owner)
                local upload = assert(upload_record_repo.create(id, owner, 1, "application/octet-stream",
                    "app:uploads", id, "app:types.failing", upload_metadata(owner, "active.bin"),
                    "uploaded", nil, nil, intent, 600000))
                local queued = assert(process_worker.enqueue_upload_job(upload, true))
                local db = assert(sql.get("app:db"))
                for _, status in ipairs({"pending", "running"}) do
                    assert(db:execute("UPDATE kickside_job SET status=$1 WHERE id=$2", {status, queued.job_id}))
                    local result, err = funcs.call("kickside.uploads:retention")
                    test.is_nil(err, tostring(err))
                    test.is_true(result.success, tostring(result.error))
                    local snapshot = assert(upload_query_repo.get(id))
                    test.eq(snapshot.storage_state, "uploaded")
                    local tx = assert(db:begin())
                    local settled, settle_err = upload_record_repo.settle_storage_tx(tx, id, "failed", snapshot)
                    assert(tx:rollback())
                    test.is_nil(settle_err)
                    test.is_false(settled, "the settlement transaction also fences active work")
                end
                db:release()
            end)
        end

        test.it("maintenance leaves uploads that never enter processing alone", function()
            local id, owner = uuid_v4(), "unqueued-upload-" .. uuid_v4()
            assert(upload_record_repo.create(id, owner, 1, "application/octet-stream",
                "app:uploads", id, "app:types.failing", {}, "uploaded"))
            local result, err = funcs.call("kickside.uploads:retention")
            test.is_nil(err, tostring(err))
            test.is_true(result.success, tostring(result.error))
            test.eq(assert(upload_query_repo.get(id)).storage_state, "uploaded")
        end)

        for _, pruned in ipairs({false, true}) do
        for _, intent in ipairs({true, false}) do
            test.it("maintenance settles an already-dead processing job with intent=" .. tostring(intent) .. " pruned=" .. tostring(pruned), function()
                local id, owner = uuid_v4(), "older-upload-" .. uuid_v4()
                ensure_uploads_component(owner)
                local upload = assert(upload_record_repo.create(id, owner, 1, "application/octet-stream",
                    "app:uploads", id, "app:types.failing", upload_metadata(owner, "earlier.bin"),
                    "uploaded", nil, nil, intent, 600000))
                local queued = assert(process_worker.enqueue_upload_job(upload, true))
                local db = assert(sql.get("app:db"))
                assert(upload_read_model.apply_events(queued.thread_id, {{id = uuid_v4(), seq = 1,
                    type = uploads_events.TYPE.QUEUED, created_at = time.now():utc():format_rfc3339(),
                    body = {upload_id = id, filename = "earlier.bin"}}}))
                -- Published rows contain no outcome job. Older intent-less rows also lack a job pointer.
                assert(db:execute("UPDATE kickside_job SET status='dead',last_error='execution ended',finished_at=$1 WHERE id=$2",
                    {jobs_lifecycle.now_string(tostring(db:type())), queued.job_id}))
                if pruned then
                    -- A retained older attempt cannot replace the current intent's missing job.
                    assert(db:execute([[INSERT INTO kickside_job(id,thread_id,job_type,worker_ref,status,owner_kind,owner_id,job_identity)
                        SELECT $1,thread_id,job_type,worker_ref,'dead',owner_kind,owner_id,job_identity
                        FROM kickside_job WHERE id=$2]], {uuid_v4(), queued.job_id}))
                    assert(db:execute("DELETE FROM kickside_job WHERE id=$1", {queued.job_id}))
                end
                db:release()
                local result, err = funcs.call("kickside.uploads:retention")
                test.is_nil(err, tostring(err))
                test.is_true(result.success, tostring(result.error))
                test.eq(assert(upload_query_repo.get(id)).storage_state, "failed")
                local again, again_err = funcs.call("kickside.uploads:retention")
                test.is_nil(again_err)
                test.is_true(again.success, tostring(again.error))
                local verify = assert(sql.get("app:db"))
                local events = assert(verify:query("SELECT id FROM kickside_event WHERE external_id=$1 AND type=$2",
                    {id, uploads_events.TYPE.FAILED}))
                test.eq(#events, 1)
                verify:release()
            end)
        end

        end

		test.it("settles an upload whose processing job dies without its handler", function()
			local storage = fs.get("app:uploads")
			local upload_id = "dead-job-" .. uuid_v4()
			local user_id = "dead-job-user-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local path = upload_id .. ".bin"
			local bytes = "dead job bytes " .. upload_id
			assert(storage:writefile(path, bytes))
			local upload = assert(upload_record_repo.create(upload_id, user_id, #bytes, "application/octet-stream",
				"app:uploads", path, "app:types.failing", upload_metadata(user_id, "dead.bin"), "uploaded",
				hash.sha256(bytes), nil, true, 600000))

			local queued, queue_err = process_worker.enqueue_upload_job(upload, true)
			test.is_nil(queue_err)
			local db = assert(sql.get("app:db"))
			local dbtype = tostring(db:type())
			-- The final attempt is killed by its supervisor: the handler never settles.
			local job = admit_job(db, queued.job_id, 5)
			test.is_nil(jobs_lifecycle.fail_job(db, job, dbtype, "job exceeded max_execution_ms", "infrastructure"))
			test.eq(assert(db:query("SELECT status FROM kickside_job WHERE id=$1", { job.id }))[1].status, "dead")

			local outcomes = assert(db:query(
				"SELECT id FROM kickside_job WHERE worker_ref=$1 AND CAST(payload AS TEXT) LIKE $2",
				{ "kickside.uploads.service:process_dead", "%" .. job.id .. "%" }))
			test.eq(#outcomes, 1)
			local outcome = admit_job(db, outcomes[1].id, 1)
			local function deliver(): any
				local output, deliver_err = worker_dispatch.execute_job(db, dbtype, outcome)
				test.is_nil(deliver_err)
				return output
			end
			local function failed_events(): integer
				return #assert(db:query([[SELECT id FROM kickside_event
					WHERE thread_id=$1 AND external_id=$2 AND type=$3]],
					{ queued.thread_id, upload_id, uploads_events.TYPE.FAILED }))
			end

			deliver()
			local settled = assert(upload_query_repo.get(upload_id))
			test.eq("failed", settled.storage_state)
			test.eq(1, failed_events())
			local event = assert(db:query([[SELECT body FROM kickside_event
				WHERE thread_id=$1 AND external_id=$2 AND type=$3]],
				{ queued.thread_id, upload_id, uploads_events.TYPE.FAILED }))[1]
			test.contains(tostring(json.decode(event.body).error), "job exceeded max_execution_ms")

			-- A second delivery of the same outcome changes nothing.
			deliver()
			test.eq("failed", assert(upload_query_repo.get(upload_id)).storage_state)
			test.eq(1, failed_events())

			-- Dedup now treats the bytes as released, and retry accepts the upload.
			local matched = assert(upload_query_repo.find_by_content_hash(user_id, hash.sha256(bytes), ""))
			test.eq("failed", matched.storage_state)
			assert(upload_record_repo.mark_failed_for_retry(upload_id, 600000))
			-- A late delivery while the retry is being queued leaves it alone.
			deliver()
			test.eq("uploaded", assert(upload_query_repo.get(upload_id)).storage_state)
			db:release()
			assert(upload_record_repo.mark_storage_failed(upload_id))
			local retried, retry_err = upload_lib.retry_upload(upload_id)
			test.is_nil(retry_err)
			test.eq(upload_id, retried.uuid)
			local requeued = assert(upload_query_repo.get(upload_id))
			test.eq("uploaded", requeued.storage_state)
			test.is_true(requeued.processing_job_id ~= job.id)
			-- A late delivery after the retry is queued leaves the new attempt alone.
			local late_db = assert(sql.get("app:db"))
			local _, late_err = worker_dispatch.execute_job(late_db, dbtype, outcome)
			late_db:release()
			test.is_nil(late_err)
			test.eq("uploaded", assert(upload_query_repo.get(upload_id)).storage_state)
		end)

		test.it("fails an upload when a transcription stage reports a soft error code", function()
			local storage = fs.get("app:uploads")
			test.not_nil(storage)

			for _, key in ipairs({ "ocr_error", "asr_error", "conversion_error" }) do
				local upload_id = "transcription-error-" .. uuid_v4()
				local user_id = "transcription-error-user-" .. uuid_v4()
				ensure_uploads_component(user_id)
				local path = upload_id .. ".bin"
				local bytes = "transcription error bytes " .. upload_id
				local write_ok, write_err = storage:writefile(path, bytes)
				test.is_nil(write_err)
				test.is_true(write_ok ~= false)

				local metadata = metadata_with_identity(user_id, "scan.png", { transcription_error_test = key })
				local upload, upload_err = upload_record_repo.create(
					upload_id,
					user_id,
					#bytes,
					"application/x-kickside-failing-stage-test",
					"app:uploads",
					path,
					"app:types.failing",
					metadata,
					"uploaded"
				)
				test.is_nil(upload_err)
				test.not_nil(upload)

				local success, err = pipeline_lib.process_upload(upload)
				test.is_false(success)
				test.contains(tostring(err), key .. ": transcription_failed")

				local row, row_err = upload_query_repo.get(upload_id)
				test.is_nil(row_err)
				test.eq("transcription_failed", row.metadata[key])
			end
		end)

		local function create_transcription_upload(prefix: string, extra: any): any
			local storage = fs.get("app:uploads")
			test.not_nil(storage)
			local upload_id = prefix .. "-" .. uuid_v4()
			local user_id = prefix .. "-user-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local path = upload_id .. ".bin"
			local bytes = prefix .. " bytes " .. upload_id
			local write_ok, write_err = storage:writefile(path, bytes)
			test.is_nil(write_err)
			test.is_true(write_ok ~= false)
			local metadata = metadata_with_identity(user_id, "scan.png", extra)
			local upload, upload_err = upload_record_repo.create(
				upload_id,
				user_id,
				#bytes,
				"application/x-kickside-failing-stage-test",
				"app:uploads",
				path,
				"app:types.failing",
				metadata,
				"uploaded"
			)
			test.is_nil(upload_err)
			test.not_nil(upload)
			return upload
		end

		local function add_primary_text(upload: any, content: string)
			local _, create_err = artifact_content_repo.create_artifact({
				upload_id = upload.uuid,
				kind = "markdown",
				role = "primary",
				mime_type = "text/markdown",
				label = "converted.md",
				ordinal = 1,
				content = content,
				storage_id = "app:uploads",
			})
			test.is_nil(create_err)
		end

		test.it("keeps an upload completed when transcription reports a content outcome", function()
			for _, code in ipairs({ "no_text_detected", "too_large", "transcript_too_large" }) do
				local upload = create_transcription_upload("transcription-outcome", {
					transcription_error_test = "ocr_error",
					transcription_error_code = code,
				})
				local success, err = pipeline_lib.process_upload(upload)
				test.is_nil(err)
				test.is_true(success)
				local row, row_err = upload_query_repo.get(upload.uuid)
				test.is_nil(row_err)
				test.eq(code, row.metadata.ocr_error)
			end
		end)

		test.it("classifies transient and permanent transcription codes", function()
			for _, case in ipairs({
				{ code = "transcription_failed", retriable = true },
				{ code = "persist_failed", retriable = true },
				{ code = "storage_unavailable", retriable = true },
				{ code = "storage_read_failed", retriable = true },
				{ code = "storage_pointer_missing", retriable = false },
			}) do
				local upload = create_transcription_upload("transcription-class", {
					transcription_error_test = "asr_error",
					transcription_error_code = case.code,
				})
				local success, err, _, retriable = pipeline_lib.process_upload(upload)
				test.is_false(success)
				test.contains(tostring(err), "asr_error: " .. case.code)
				test.eq(case.retriable, retriable)
			end
		end)

		test.it("stores provider text as a stable retriable transcription code", function()
			local upload = create_transcription_upload("transcription-raw", {
				transcription_error_test = "ocr_error",
				transcription_error_code = "Page 1: ocr: generate failed: provider failure",
			})
			local success, err, _, retriable = pipeline_lib.process_upload(upload)
			test.is_false(success)
			test.is_true(retriable)
			test.contains(tostring(err), "ocr_error: transcription_failed")
			local row, row_err = upload_query_repo.get(upload.uuid)
			test.is_nil(row_err)
			test.eq("transcription_failed", row.metadata.ocr_error)
		end)

		test.it("never exposes provider text in public transcription codes", function()
			local public = metadata_sanitizer.public({
				ocr_error = "Page 1: ocr: generate failed: provider failure",
				asr_error = "too_large",
				conversion_error = false,
			})
			test.eq("transcription_failed", public.ocr_error)
			test.eq("too_large", public.asr_error)
			test.eq(false, public.conversion_error)

			local preview = upload_response.format_get_upload({
				uuid = "legacy-upload",
				status = "error",
				error = "failed",
				metadata = { ocr_error = "Page 1: ocr: generate failed: provider failure" },
			})
			test.eq("transcription_failed", preview.meta.ocr_error)

			local row = upload_response.format_list_upload({
				uuid = "legacy-upload",
				status = "error",
				error = "failed",
				metadata = {
					filename = "scan.png",
					ocr_error = "Page 1: ocr: generate failed: provider failure",
					storage_path = "private",
				},
			})
			test.eq("transcription_failed", row.meta.ocr_error)
			test.is_nil(row.meta.storage_path)
			test.is_nil(row.meta.filename)
		end)

		test.it("redacts structured provider diagnostics from every public transcription field", function()
			for _, key in ipairs(metadata_sanitizer.TRANSCRIPTION_ERROR_KEYS) do
				local stored = { [key] = { message = "private provider diagnostic" } }
				test.eq(metadata_sanitizer.public(stored)[key], "transcription_failed")
				test.eq(
					upload_response.format_get_upload({ uuid = "legacy", metadata = stored }).meta[key],
					"transcription_failed"
				)
				test.eq(
					upload_response.format_list_upload({ uuid = "legacy", metadata = stored }).meta[key],
					"transcription_failed"
				)
			end
		end)

		test.it("retries a failed upload on its stored bytes", function()
			local upload = create_transcription_upload("transcription-retry", {
				transcription_error_test = "ocr_error",
			})
			local live = create_transcription_upload("transcription-retry-live", {})

			local _, live_err = upload_lib.retry_upload(live.uuid)
			test.not_nil(live_err)
			test.is_true(errors.is(live_err, errors.CONFLICT))

			local _, mark_err = upload_record_repo.mark_storage_failed(upload.uuid)
			test.is_nil(mark_err)
			local metadata = metadata_with_identity(upload.actor_id, "scan.png", { transcription_success_test = true })
			local _, meta_err = upload_record_repo.update_metadata(upload.uuid, metadata)
			test.is_nil(meta_err)

			local retried, retry_err = upload_lib.retry_upload(upload.uuid)
			test.is_nil(retry_err)
			test.eq(upload.uuid, retried.uuid)

			local again, again_err = upload_lib.retry_upload(upload.uuid)
			test.is_nil(again)
			test.is_true(errors.is(again_err, errors.CONFLICT))

			local db = assert(sql.get("app:db"))
			local jobs_rows = assert(
				db:query(
					[[SELECT * FROM kickside_job
                WHERE job_type = 'kickside.uploads.service:process_job_proc' AND CAST(payload AS TEXT) LIKE $1 AND status = 'pending']],
					{ "%" .. upload.uuid .. "%" }
				)
			)
			test.eq(#jobs_rows, 1)
			local job = admit_job(db, jobs_rows[1].id, 1)
			db:release()
			local input, _, input_err = worker_dispatch.build_worker_input(job)
			test.is_nil(input_err)
			local result, run_err = process_job.run(input)
			test.is_nil(run_err)
			test.is_true(result.success)

			local stored, stored_err = upload_query_repo.get(upload.uuid)
			test.is_nil(stored_err)
			test.eq("completed", stored.storage_state)
		end)

		test.it("keeps existing primary text when enrichment transcription fails", function()
			local transient = create_transcription_upload("transcription-enrich", {
				transcription_error_test = "ocr_error",
			})
			add_primary_text(transient, "Converted body text")
			local success, err, _, retriable = pipeline_lib.process_upload(transient)
			test.is_false(success)
			test.is_true(retriable)
			test.contains(tostring(err), "ocr_error: transcription_failed")

			success, err = pipeline_lib.process_upload(transient, { final_attempt = true })
			test.is_nil(err)
			test.is_true(success)
			local row, row_err = upload_query_repo.get(transient.uuid)
			test.is_nil(row_err)
			test.eq("transcription_failed", row.metadata.ocr_error)

			local permanent = create_transcription_upload("transcription-enrich-permanent", {
				transcription_error_test = "ocr_error",
				transcription_error_code = "storage_pointer_missing",
			})
			add_primary_text(permanent, "Converted body text")
			success, err = pipeline_lib.process_upload(permanent)
			test.is_nil(err)
			test.is_true(success)

			local blank = create_transcription_upload("transcription-enrich-blank", {
				transcription_error_test = "ocr_error",
			})
			add_primary_text(blank, "  \n ")
			success, err = pipeline_lib.process_upload(blank, { final_attempt = true })
			test.is_false(success)
			test.contains(tostring(err), "ocr_error: transcription_failed")
		end)

		test.it("keeps an upload completed when transcription reports no error", function()
			local storage = fs.get("app:uploads")
			test.not_nil(storage)

			local upload_id = "transcription-ok-" .. uuid_v4()
			local user_id = "transcription-ok-user-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local path = upload_id .. ".bin"
			local bytes = "transcription ok bytes " .. upload_id
			local write_ok, write_err = storage:writefile(path, bytes)
			test.is_nil(write_err)
			test.is_true(write_ok ~= false)

			local metadata = metadata_with_identity(user_id, "scan.png", { transcription_success_test = true })
			local upload, upload_err = upload_record_repo.create(
				upload_id,
				user_id,
				#bytes,
				"application/x-kickside-failing-stage-test",
				"app:uploads",
				path,
				"app:types.failing",
				metadata,
				"uploaded"
			)
			test.is_nil(upload_err)
			test.not_nil(upload)

			local success, err = pipeline_lib.process_upload(upload)
			test.is_nil(err)
			test.is_true(success)
		end)

		test.it("settles a transcription failure as a failed upload that can be retried", function()
			local storage = fs.get("app:uploads")
			test.not_nil(storage)

			local upload_id = "transcription-job-" .. uuid_v4()
			local user_id = "transcription-job-user-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local path = upload_id .. ".bin"
			local bytes = "transcription job bytes " .. upload_id
			local write_ok, write_err = storage:writefile(path, bytes)
			test.is_nil(write_err)
			test.is_true(write_ok ~= false)

			local metadata = metadata_with_identity(user_id, "scan.png", { transcription_error_test = "ocr_error" })
			local upload, upload_err = upload_record_repo.create(
				upload_id,
				user_id,
				#bytes,
				"application/x-kickside-failing-stage-test",
				"app:uploads",
				path,
				"app:types.failing",
				metadata,
				"uploaded"
			)
			test.is_nil(upload_err)
			test.not_nil(upload)

			local queued, queue_err = process_worker.enqueue_upload_job(upload, true)
			test.is_nil(queue_err)
			local db = assert(sql.get("app:db"))
			local job = admit_job(db, queued.job_id, 5)
			local input, _, input_err = worker_dispatch.build_worker_input(job)
			test.is_nil(input_err)
			local result, run_err = process_job.run(input)
			test.is_nil(run_err)
			test.not_nil(result)
			test.not_nil(result.job_error)
			test.contains(tostring(result.job_error), "ocr_error: transcription_failed")

			local events = assert(
				db:query(
					[[SELECT id,seq,type,body FROM kickside_event
                WHERE thread_id=$1 AND external_id=$2 AND type=$3]],
					{ queued.thread_id, upload_id, uploads_events.TYPE.FAILED }
				)
			)
			test.eq(#events, 1)
			db:release()

			local component_id = upload_types.component_id_for_owner(user_id)
			test.not_nil(component_id)
			local _, apply_err = upload_read_model.apply_events(component_id, {
				{
					id = events[1].id,
					seq = events[1].seq,
					type = events[1].type,
					created_at = "2026-01-01T00:00:00Z",
					body = json.decode(events[1].body),
				},
			})
			test.is_nil(apply_err)

			local row, get_err = upload_read_model.get_for_actor(user_id, upload_id)
			test.is_nil(get_err)
			test.not_nil(row)
			test.eq("error", row.status)

			-- The preview reads the projected status and the public failure text,
			-- and keeps the stable transcription code for the drawer.
			local preview = upload_response.format_get_upload(row)
			test.eq("error", preview.status)
			test.not_nil(preview.error)
			test.eq("transcription_failed", preview.meta.ocr_error)

			-- The original bytes stay stored, so the failed upload can be retried.
			local stored, stored_err = upload_query_repo.get(upload_id)
			test.is_nil(stored_err)
			test.eq("failed", stored.storage_state)
			local retained_bytes, retained_err = storage:readfile(path)
			test.is_nil(retained_err)
			test.eq(bytes, retained_bytes)
		end)

		test.it("adds stage title and function id to processor errors", function()
			local upload_id = "stage-error-" .. uuid_v4()
			local user_id = "stage-error-user-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local path = upload_id .. ".txt"
			local bytes = "stage error bytes " .. upload_id
			local storage = fs.get("app:uploads")
			test.not_nil(storage)
			local write_ok, write_err = storage:writefile(path, bytes)
			test.is_nil(write_err)
			test.is_true(write_ok ~= false)

			local metadata = metadata_with_identity(user_id, "stage-error.txt", { fail_stage_test = true })
			local upload, upload_err = upload_record_repo.create(
				upload_id,
				user_id,
				#bytes,
				"application/x-kickside-failing-stage-test",
				"app:uploads",
				path,
				"app:types.failing",
				metadata,
				"uploaded"
			)
			test.is_nil(upload_err)
			test.not_nil(upload)

			local success, err = pipeline_lib.process_upload(upload)
			test.is_false(success)
			test.contains(tostring(err), "upload stage")
			test.contains(tostring(err), "(app:failing_stage) failed")
			test.contains(tostring(err), "test unavailable resource: app:failing_stage")
		end)

		test.it("reports a failed stage metadata write instead of losing the document error", function()
			local upload_id, user_id = uuid_v4(), "metadata-write-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local metadata = metadata_with_identity(user_id, "scan.png", {
				stage_metadata = { ocr_error = "vision request rejected" },
			})
			local upload = assert(
				upload_record_repo.create(
					upload_id,
					user_id,
					16,
					"image/png",
					"app:uploads",
					upload_id .. ".png",
					"app:types.failing",
					metadata,
					"uploaded"
				)
			)
			local db = assert(sql.get("app:db"))
			test.is_nil(
				select(2, db:execute("ALTER TABLE kickside_uploads RENAME COLUMN metadata TO unavailable_metadata"))
			)
			db:release()
			local ok, err = pipeline_lib.process_upload(upload)
			local restore = assert(sql.get("app:db"))
			test.is_nil(
				select(
					2,
					restore:execute("ALTER TABLE kickside_uploads RENAME COLUMN unavailable_metadata TO metadata")
				)
			)
			restore:release()
			test.is_false(ok)
			test.contains(tostring(err), "metadata")
			local retry_ok, retry_err = pipeline_lib.process_upload(upload)
			test.is_false(retry_ok)
			test.contains(tostring(retry_err), "ocr_error: transcription_failed")
			test.is_false(tostring(retry_err):find("vision request rejected", 1, true) ~= nil)
			local stored = assert(upload_query_repo.get(upload_id))
			test.eq(stored.metadata.ocr_error, "transcription_failed")
		end)

		test.it("conversion error metadata fails processing and remains available for reprocessing", function()
			for _, key in ipairs({ "ocr_error", "asr_error", "conversion_error" }) do
				local upload_id, user_id = uuid_v4(), "conversion-error-" .. uuid_v4()
				ensure_uploads_component(user_id)
				local metadata = metadata_with_identity(user_id, "scan.pdf", {
					stage_metadata = { [key] = "transcription_failed" },
				})
				local upload = assert(
					upload_record_repo.create(
						upload_id,
						user_id,
						16,
						"application/pdf",
						"app:uploads",
						upload_id .. ".pdf",
						"app:types.failing",
						metadata,
						"uploaded"
					)
				)
				local ok, err = pipeline_lib.process_upload(upload)
				test.is_false(ok, key .. " must fail the upload even when the stage returns success=true")
				test.contains(tostring(err), "Failing Test Stage")
				test.contains(tostring(err), "transcription_failed")
				local stored = assert(upload_query_repo.get(upload_id))
				test.eq(stored.metadata[key], "transcription_failed")
				stored.metadata.stage_metadata[key] = false
				local retry_ok, retry_err = pipeline_lib.process_upload(stored)
				test.is_nil(retry_err)
				test.is_true(retry_ok)
				test.is_false(assert(upload_query_repo.get(upload_id)).metadata[key])
			end
		end)

		test.it("conversion errors publish failed status with the reason and retain preview artifacts", function()
			local upload_id, user_id = uuid_v4(), "conversion-status-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local path, bytes = upload_id .. ".pdf", "scanned document bytes"
			local storage = assert(fs.get("app:uploads"))
			local written, write_err = storage:writefile(path, bytes)
			test.is_nil(write_err)
			test.is_true(written)
			local metadata = metadata_with_identity(user_id, "scan.pdf", {
				stage_metadata = { ocr_error = "transcription_failed" },
			})
			local upload = assert(
				upload_record_repo.create(
					upload_id,
					user_id,
					#bytes,
					"application/pdf",
					"app:uploads",
					path,
					"app:types.failing",
					metadata,
					"uploaded"
				)
			)
			local primary = assert(artifact_content_repo.create_artifact({
				upload_id = upload_id,
				kind = "markdown",
				role = "primary",
				mime_type = "text/markdown",
				content = "",
				storage_id = "app:uploads",
				ordinal = 1,
			}))
			local queued = assert(process_worker.enqueue_upload_job(upload, true))
			local db = assert(sql.get("app:db"))
			local job = admit_job(db, queued.job_id, 5)
			local input, _, input_err = worker_dispatch.build_worker_input(job)
			test.is_nil(input_err)
			local result, run_err = process_job.run(input)
			test.is_nil(run_err)
			test.not_nil(result)
			test.contains(tostring(result.job_error), "transcription_failed")
			local events = assert(
				db:query(
					[[SELECT type,body,created_at FROM kickside_event
                WHERE thread_id=$1 AND external_id=$2 AND type IN ($3,$4)]],
					{ queued.thread_id, upload_id, uploads_events.TYPE.FAILED, uploads_events.TYPE.COMPLETED }
				)
			)
			db:release()
			test.eq(#events, 1)
			test.eq(events[1].type, uploads_events.TYPE.FAILED)
			local body = json.decode(events[1].body)
			test.contains(body.error, "transcription_failed")
			test.is_nil(select(
				2,
				upload_read_model.apply_events(queued.thread_id, {
					{ type = events[1].type, body = body, created_at = events[1].created_at },
				})
			))
			local row = assert(upload_read_model.get_for_actor(user_id, upload_id))
			test.eq(row.status, "error")
			test.contains(row.error, "transcription_failed")
			test.not_nil(upload_response.format_list_upload(row).error)
			test.eq(assert(upload_query_repo.get(upload_id)).storage_state, "failed")
			test.eq(storage:readfile(path), bytes)
			test.eq(
				assert(artifact_content_repo.get_artifact(upload_id, primary.artifact_id)).artifact_id,
				primary.artifact_id
			)
		end)

		test.it("allows a completion token without an optional error callback to settle failure", function()
			local upload_id, user_id = uuid_v4(), "optional-callback-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local metadata = upload_metadata(user_id, "callback.txt")
			local identity = metadata[IDENTITY_META_KEY]
			local token, token_err = upload_tokens.pack({
				upload_id = upload_id,
				function_id = "app:callback_probe",
				actor_id = identity.actor_id,
				actor_context = identity.actor_context,
			})
			test.is_nil(token_err)
			metadata.__upload_token = token
			local upload = assert(
				upload_record_repo.create(
					upload_id,
					user_id,
					1,
					"text/plain",
					"app:uploads",
					upload_id .. ".txt",
					"text",
					metadata,
					"processing"
				)
			)
			local ok, err = pipeline_lib.invoke_upload_token(upload, false, "conversion rejected")
			test.is_nil(err)
			test.is_true(ok)
			local db = assert(sql.get("app:db"))
			local rows = assert(
				db:query(
					[[SELECT id FROM kickside_job
                WHERE thread_id=$1 AND job_type=$2]],
					{ uploads_events.component_id_for_owner(user_id), "kickside.uploads.service:callback_job" }
				)
			)
			db:release()
			test.eq(#rows, 0)
		end)

		test.it("schedules upload completion callbacks as idempotent core jobs", function()
			local upload_id = uuid_v4()
			local user_id = "user-callback-" .. uuid_v4()
			ensure_uploads_component(user_id)
			local identity = upload_metadata(user_id, "callback.txt")[IDENTITY_META_KEY]
			local trace_context = { trace_id = "trace-" .. uuid_v4(), run_id = "run-" .. uuid_v4() }
			local token, token_err = upload_tokens.pack({
				upload_id = upload_id,
				function_id = "app:callback_probe",
				actor_id = identity.actor_id,
				actor_context = identity.actor_context,
				trace_context = trace_context,
			})
			test.is_nil(token_err)
			test.not_nil(token)

			local upload, upload_err = upload_record_repo.create(
				upload_id,
				user_id,
				10,
				"text/plain",
				"app:uploads",
				upload_id .. ".txt",
				"text",
				{
					filename = "callback.txt",
					__upload_token = token,
					[IDENTITY_META_KEY] = identity,
				},
				"processing",
				nil,
				trace_context
			)
			test.is_nil(upload_err)
			test.not_nil(upload)

			local ok, enqueue_err = pipeline_lib.invoke_upload_token(upload, true, nil)
			test.is_nil(enqueue_err)
			test.is_true(ok)
			local dup_ok, dup_err = pipeline_lib.invoke_upload_token(upload, true, nil)
			test.is_nil(dup_err)
			test.is_true(dup_ok)

			local db, db_err = sql.get("app:db")
			test.is_nil(db_err)
			local rows = sql.builder
				.select(
					"id",
					"job_type",
					"worker_ref",
					"concurrency_key",
					"idempotency_key",
					"payload",
					"actor_id",
					"owner_kind",
					"owner_id"
				)
				:from("kickside_job")
				:where(sql.builder.eq({ job_type = "kickside.uploads.service:callback_job" }))
				:where(sql.builder.eq({ thread_id = uploads_events.component_id_for_owner(user_id) }))
				:run_with(db)
				:query()
			db:release()
			test.eq(#rows, 1)
			test.eq(rows[1].worker_ref, "kickside.uploads.service:callback_job")
			test.eq(rows[1].concurrency_key, "uploads:callback:" .. uploads_events.component_id_for_owner(user_id))
			test.is_nil(rows[1].actor_id)
			test.eq(rows[1].owner_kind, "user")
			test.eq(rows[1].owner_id, user_id)

			local job_payload = json.decode(tostring(rows[1].payload))
			test.eq(job_payload.upload_id, upload_id)
			test.is_true(job_payload.success)

			local result, run_err = funcs.new():call("kickside.uploads.service:callback_job", { payload = job_payload })
			test.is_nil(run_err)
			test.is_true(result.success)

			local probe_db, probe_db_err = sql.get("app:db")
			test.is_nil(probe_db_err)
			local probe_rows = probe_db:query(
				"SELECT upload_id, status, trace_id FROM upload_callback_probe WHERE upload_id = $1",
				{ upload_id }
			)
			probe_db:release()
			test.eq(#probe_rows, 1)
			test.eq(probe_rows[1].status, "completed")
			test.eq(probe_rows[1].trace_id, trace_context.trace_id)
		end)

		test.it("requires upload_id in callback tokens and refuses a token for another upload", function()
			local owner = "callback-bound-" .. uuid_v4()
			local target = uuid_v4()
			local other = uuid_v4()
			local identity = upload_metadata(owner, "callback.txt")[IDENTITY_META_KEY]
			local unbound, unbound_err = upload_tokens.pack({
				function_id = "app:callback_probe",
				actor_id = identity.actor_id,
				actor_context = identity.actor_context,
			})
			test.is_nil(unbound)
			test.eq(unbound_err:kind(), errors.INVALID)
			local token, token_err = upload_tokens.pack({
				upload_id = other,
				function_id = "app:callback_probe",
				actor_id = identity.actor_id,
				actor_context = identity.actor_context,
			})
			test.is_nil(token_err)
			local upload, create_err = upload_record_repo.create(
				target,
				owner,
				1,
				"text/plain",
				"app:uploads",
				target .. ".txt",
				"text",
				upload_metadata(owner, "callback.txt"),
				"uploaded"
			)
			test.is_nil(create_err)
			test.not_nil(upload)
			local result, err = callback_job.run({ payload = { upload_id = target, token = token, success = true } })
			test.is_nil(result)
			test.eq(err:kind(), errors.INVALID)
		end)
	end)
end
local run_cases = test.run_cases(define_tests)
return {
	run = function(options)
		return run_cases(options)
	end,
}
