local test = require("test")
local sql = require("sql")
local fs = require("fs")
local registry = require("registry")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local contract = require("contract")
local json = require("json")
local cloudstorage = require("cloudstorage")
local env = require("env")
local policy = require("policy")
local locations = require("locations")
local offload = require("offload")
local records = require("records")
local artifacts = require("artifacts")
local content = require("content")
local jobs = require("jobs")
local lifecycle = require("lifecycle")
local dispatch = require("dispatch")
local DB = "app:db"
local STORAGE = "app:uploads"
local pending_files = {}

local function query(statement: string, args: any): any
    local db = assert(sql.get(DB))
    local rows, err = db:query(statement, args)
    db:release()
    test.is_nil(err, tostring(err))
    return rows
end

local function exec(statement: string, args: any): any
    local db = assert(sql.get(DB))
    local result, err = db:execute(statement, args)
    db:release()
    test.is_nil(err, tostring(err))
    return result
end

local function settings(): any return assert(assert(contract.get("kickside.settings:settings")):open()) end

local function configure(mode: string): any
    local prefix = env.get("app.upload_storage:prefix")
    test.is_true(type(prefix) == "string" and #prefix > 0, "Test prefix is required")
    local checked = policy.validate({ value = { mode = mode, resource_id = "app.upload_storage:s3", prefix = prefix } })
    test.is_true(checked.valid, "Test policy invalid for prefix " .. tostring(prefix) .. ": " .. tostring(checked.error))
    local saved, save_err = settings():set({ namespace = "kickside.uploads.storage", key = "policy",
        value = { mode = mode, resource_id = "app.upload_storage:s3", prefix = prefix } })
    test.is_nil(save_err, tostring(save_err))
    test.is_true(saved.success, "Storage policy save: " .. tostring(saved.error))
    local result, apply_err = funcs.call("kickside.uploads.storage.service:request", {})
    test.is_nil(apply_err, tostring(apply_err))
    test.is_true(result.success, tostring(result.error))
    return assert(policy.current())
end

local function owner(): (string, any)
    local id = "storage-live-" .. uuid.v4()
    exec([[INSERT INTO app_users(user_id,email,full_name,password_hash,status)
        VALUES ($1,$2,$1,'test-only','active')]], { id, id .. "@uploads.test" })
    for _, group in ipairs({ "app:uploads_test", "wippy.security:process" }) do
        exec("INSERT INTO app_user_groups(user_id,group_id) VALUES ($1,$2)", { id, group })
    end
    local actor = assert(security.new_actor(id, { security_groups = { "app:uploads_test" } }))
    return id, assert(funcs.new():with_actor(actor):with_scope(assert(security.named_scope("wippy.security:process"))))
end

-- Claim one known job under a real lease, then use Jobs' live monitored-process
-- dispatcher. This avoids unrelated suite jobs while exercising native process
-- supervision, the owning worker, SQL publication, and S3 IO end to end.
local function run_job(id: string): any
    local db = assert(sql.get(DB))
    local dbtype = tostring(db:type())
    local token = uuid.v4()
    local _, claim_err = db:execute([[UPDATE kickside_job SET status='running',lease_token=$1,
        execution_seq=execution_seq+1,attempts=attempts+1,lease_until=$2 WHERE id=$3]],
        { token, lifecycle.future_string(dbtype, 120), id })
    test.is_nil(claim_err, tostring(claim_err))
    local rows = assert(db:query("SELECT * FROM kickside_job WHERE id=$1", { id }))
    local row = rows[1]
    local binding = assert(dispatch.parse_worker_ref(row.worker_ref))
    test.eq(binding.worker_runtime, "proc")
    local output, err = dispatch.run_supervised_proc(db, dbtype, row, binding, nil, nil)
    db:release()
    test.is_nil(err, tostring(err))
    test.not_nil(output)
    local current = assert(jobs.get_job(id))
    if current.status == "running" then
        local _, complete_err = jobs.complete(id, { token = token, execution_seq = row.execution_seq }, {})
        test.is_nil(complete_err, tostring(complete_err))
    end
    test.eq(assert(jobs.get_job(id)).status, "done")
    return output
end

local function upload(bytes: string, filename: string, mime: string): (any, string, any)
    local id, executor = owner()
    local uploaded, upload_err = executor:call("app:admit_upload", {
        action = "upload", actor_id = id, bytes = bytes, filename = filename,
        size = #bytes, mime_type = mime, metadata = {},
    })
    test.is_nil(upload_err, tostring(upload_err))
    test.not_nil(uploaded)
    pending_files[#pending_files + 1] = { id = uploaded.uuid, owner = id, executor = executor }
    local queued = assert(records.get(uploaded.uuid))
    run_job(queued.processing_job_id)
    return assert(records.get(uploaded.uuid)), id, executor
end

local function placement_job(upload_id: string): any
    for _, row in ipairs(query("SELECT * FROM kickside_job WHERE job_type=$1", { "kickside.uploads.storage:offload_job" })) do
        local payload = type(row.payload) == "table" and row.payload or assert(json.decode(tostring(row.payload)))
        if payload.upload_id == upload_id then return row end
    end
    error("Upload completion did not enqueue storage placement")
end

local function restricted_reader(id: string): any
    local policies = {}
    for _, entry in ipairs({ "app:upload_runtime_resources", "kickside.uploads.security:uploads_resource_access",
        "kickside.uploads.storage.security:cloud", "kickside.uploads.security:module_runtime",
        "app.upload_storage:content_contracts" }) do
        policies[#policies + 1] = assert(security.policy(entry))
    end
    return assert(funcs.new():with_actor(assert(security.new_actor(id, {}))):with_scope(assert(security.new_scope(policies))))
end

return { run = test.run_cases(function()
    test.describe("native S3 upload storage", function()
        test.before_all(function() configure("s3") end)
        test.after_all(function()
            for _, item in ipairs(pending_files) do
                local _, delete_err = item.executor:call("app:admit_upload", { action = "delete", upload_id = item.id })
                test.is_nil(delete_err, tostring(delete_err))
            end
            local _, prune_err = offload.prune("2999-01-01T00:00:00Z", 500)
            test.is_nil(prune_err, tostring(prune_err))
            configure("local")
        end)

        test.it("processes locally, offloads under supervision, and preserves session and content-provider reads", function()
            configure("s3")
            local bytes = "Storage ownership handbook: returns take seventeen days. " .. uuid.v4()
            local file, id = upload(bytes, "handbook.txt", "text/plain")
            test.eq(file.storage_state, "completed")
            test.is_true(assert(fs.get(STORAGE)):exists(file.storage_path))
            local primary = assert(artifacts.get_primary_content_artifact(file.uuid))
            local before = assert(content.read_artifact_content(file.uuid, primary.artifact_id))
            local version = assert(registry.current_version()):id()
            local placed = run_job(placement_job(file.uuid).id)
            test.is_true(placed.success)
            test.is_true(placed.placed >= 2)
            test.eq(assert(registry.current_version()):id(), version)
            test.is_false(assert(fs.get(STORAGE)):exists(file.storage_path))
            local location = assert(locations.get(DB, STORAGE, file.storage_path, nil))
            test.eq(location.state, "ready")
            test.is_true(location.resource_id:find("kickside.uploads.storage.runtime:", 1, true) == 1)
            test.eq(assert(content.read_artifact_content(file.uuid, primary.artifact_id)), before)

            local result, read_err = restricted_reader(id):call("app.upload_storage:read_probe", { upload_id = file.uuid })
            test.is_nil(read_err, tostring(read_err))
            test.eq(result.content.content, before)
            test.eq(result.content.source_ref.upload_id, file.uuid)
            test.eq(result.content.source_ref.artifact_id, primary.artifact_id)
            test.eq(result.attachment.uuid, file.uuid)
            test.is_true(#result.messages > 0)
            test.is_nil(result.content.storage_path)
            test.is_nil(result.content.metadata.storage_id)
            local _, stranger_err = restricted_reader("storage-stranger"):call("app.upload_storage:read_probe", { upload_id = file.uuid })
            test.not_nil(stranger_err)
        end)

        test.it("keeps previously placed bytes readable after placement is disabled and the overlay is reconciled", function()
            configure("s3")
            local file, _, executor = upload("old storage survives settings changes " .. uuid.v4(), "old.txt", "text/plain")
            run_job(placement_job(file.uuid).id)
            local primary = assert(artifacts.get_primary_content_artifact(file.uuid))
            local expected = assert(content.read_artifact_content(file.uuid, primary.artifact_id))
            local loc = assert(locations.get(DB, STORAGE, file.storage_path, nil))
            configure("local")
            test.not_nil(registry.get(loc.resource_id))
            local result, read_err = executor:call("app.upload_storage:read_probe", { upload_id = file.uuid })
            test.is_nil(read_err, tostring(read_err))
            test.eq(result.content.content, expected)
        end)

        test.it("streams a multipart original and retrieves its exact bytes through the authorized raw endpoint", function()
            configure("s3")
            local bytes = string.rep("Native multipart S3 transfer.\n", 220000) .. uuid.v4()
            local file, _, executor = upload(bytes, "video.bin", "application/octet-stream")
            run_job(placement_job(file.uuid).id)
            local raw, raw_err = executor:with_context({ upload_id = file.uuid }):call("app.upload_storage:api_probe", {})
            test.is_nil(raw_err, tostring(raw_err))
            test.eq(raw.status, 200)
            test.eq(raw.body, bytes)
        end)

        test.it("discovers sanitized destinations and runs the administrator's real connection probe", function()
            local executor = assert(funcs.new():with_actor(assert(security.new_actor("storage-settings-admin", {})))
                :with_scope(assert(security.named_scope("wippy.security:process"))))
            local found, discover_err = executor:with_context({ storage_method = "GET" }):call("app.upload_storage:settings_probe", {})
            test.is_nil(discover_err, tostring(discover_err))
            test.eq(found.status, 200)
            test.eq(#found.body.resources, 1)
            test.eq(found.body.resources[1].id, "app.upload_storage:s3")
            test.is_nil(found.body.resources[1].config)
            test.is_nil(found.body.resources[1].endpoint)
            local checked, check_err = executor:with_context({ storage_method = "POST", storage_body = {
                mode = "s3", resource_id = "app.upload_storage:s3", prefix = env.get("app.upload_storage:prefix"),
            } }):call("app.upload_storage:settings_probe", {})
            test.is_nil(check_err, tostring(check_err))
            test.eq(checked.status, 200, tostring(checked.body.error))
            test.is_true(checked.body.success)
        end)
    end)
end) }
