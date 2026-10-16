local sql = require("sql")
local security = require("security")
local json = require("json")
local jobs_config = require("jobs_config")
local jobs_wake = require("jobs_wake")
local threads_writer = require("threads_writer")
local retention_notifier = require("retention_notifier")
local contract = require("contract")
local execution_identity = require("execution_identity")
local upload_types = require("types")
local jobs = require("jobs")
local provision = require("provision")
local processing_intent_repo = require("processing_intent_repo")

local IDENTITY_META_KEY = assert(execution_identity.CONTEXT_KEY, "execution_identity.CONTEXT_KEY is required")
local JOB_TYPE = "kickside.uploads.service:process_job_proc"
-- Runs as a supervisable process so the job worker can terminate a hung attempt
-- (e.g. an OCR inference that will not return) and finalize it through retry.

local SETTINGS_CONTRACT = "kickside.settings:settings"
local SETTINGS_NS = "kickside.uploads"
local SETTING_MAX_EXECUTION_MS = "process_max_execution_ms"
local DEFAULT_MAX_EXECUTION_MS = 600000

local function failure(message: string, kind: string, error_kind: string, retryable: boolean?): error
    return errors.new({ message = message, kind = kind, retryable = retryable == true,
        details = { error_kind = error_kind } })
end

-- Admin-tunable hard ceiling for one processing attempt, served from the warmed
-- settings cache. The worker uses it as the per-job termination deadline. A
-- settings outage degrades to the code default rather than blocking the upload.
local function max_execution_ms(): integer
    local def = contract.get(SETTINGS_CONTRACT)
    if def then
        local inst = def:open()
        if inst then
            local r = inst:get({ namespace = SETTINGS_NS, key = SETTING_MAX_EXECUTION_MS })
            if r and r.success and tonumber(r.value) and tonumber(r.value) >= 1 then
                return math.floor(tonumber(r.value) :: number) :: integer
            end
        end
    end
    return DEFAULT_MAX_EXECUTION_MS
end

local function upload_identity(upload: any, deferred: boolean?): (any?, any?, any?)
    local meta = type(upload) == "table" and upload.metadata or nil
    local identity = type(meta) == "table" and meta[IDENTITY_META_KEY] or nil
    if type(identity) == "table" and type(identity.actor_id) == "string" and identity.actor_id ~= "" then
        local stored, row_err = execution_identity.from_row(identity.actor_id, identity.actor_context)
        if row_err or not stored then
            return nil, nil, row_err
        end
        local actor, actor_err = security.actor()
        local scope, scope_err = security.scope()
        if actor_err or not actor or scope_err or not scope then
            return nil, nil, failure("authenticated upload context is unavailable",
                errors.PERMISSION_DENIED, "access")
        end
        if actor:id() == identity.actor_id and actor:id() == upload.actor_id then
            return actor, scope, nil
        end
        if not deferred then
            return nil, nil, failure("upload identity does not match authenticated caller",
                errors.PERMISSION_DENIED, "access")
        end
        local opts = { deferred_owner = "kickside.uploads:uploads" }
        local resolved, resolve_err = execution_identity.resolve(stored, opts)
        if resolve_err or not resolved then return nil, nil, resolve_err end
        return resolved.actor, resolved.scope, nil
    end
    return nil, nil, errors.new({ message = "upload execution identity is required", kind = errors.PERMISSION_DENIED, retryable = false, details = { error_kind = "subject" } })
end

local function enqueue_upload_job(upload: any, deferred: boolean?, persist: any?): (any, any?)
    local owner_actor_id: string? = nil
    if type(upload.actor_id) == "string" then
        owner_actor_id = upload.actor_id
    end
    local component_id = upload_types.component_id_for_owner(owner_actor_id)
    if not component_id then
        return nil, failure("upload actor has no uploads component id", errors.INVALID, "declaration")
    end

    local actor, scope, id_err = upload_identity(upload, deferred)
    if id_err then return nil, id_err end

    -- Lifecycle-owner moment for non-interactive/bridge actors. They never pass
    -- websocket login, so the relay workspace plugin never provisions their uploads
    -- component; first ingest is that first touch. Provisioning under the upload's
    -- own reconstructed actor + scope, keyed by the owner. A failure surfaces as an
    -- error -- an unprovisioned component never masquerades as a queued upload.
    local _, provision_err = provision.ensure_user(actor, scope, owner_actor_id :: string)
    if provision_err then
        if type(provision_err) == "userdata" then return nil, provision_err end
        return nil, failure("failed to ensure uploads component: " .. tostring(provision_err),
            errors.UNAVAILABLE, "infrastructure", true)
    end

    local params = {
        namespace = "uploads", scope = tostring(upload.uuid),
        owner_locator = { kind = "user", id = owner_actor_id :: string },
        key = "process",
        thread_id = component_id,
        job_type = JOB_TYPE,
        queue_tier = "live",
        priority = 20,
        max_attempts = 5,
        concurrency_key = "uploads:" .. component_id,
        immutable_payload = { upload_id = upload.uuid,
            max_execution_ms = tonumber(upload.processing_max_execution_ms) or max_execution_ms() },
        trace_context = upload.trace_context,
    }
    local event = {
        type = upload_types.EVENT.QUEUED,
        body = {
            upload_id = upload.uuid,
            filename = type(upload.metadata) == "table" and upload.metadata.filename or nil,
            mime_type = upload.mime_type,
            size = upload.size,
            type_id = upload.type_id,
        },
        external = {
            external_source = upload_types.EVENT_SOURCE,
            external_id = tostring(upload.uuid),
            external_version = upload_types.EVENT.QUEUED,
        },
    }
    local body_json, encode_err = json.encode(event.body)
    if encode_err then return nil, encode_err end
    event.body, event.body_json, event.trace_context = nil, body_json, upload.trace_context
    local db, db_err = sql.get(jobs_config.db_id())
    if db_err or not db then return nil, db_err end
    local raw_type, type_err = db:type()
    if type_err then db:release(); return nil, type_err end
    local dbtype = tostring(raw_type)
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return nil, begin_err end
    local function abort(err: any): (any?, any?)
        local _, rollback_err = tx:rollback()
        db:release()
        if rollback_err then return nil, errors.wrap(rollback_err, "upload transaction rollback after " .. tostring(err)) end
        return nil, err
    end
    if persist then
        local stored, persist_err = persist(tx, dbtype)
        if persist_err or not stored then return abort(persist_err) end
        upload = stored
        if upload.deduped then
            local _, rollback_err = tx:rollback()
            db:release()
            if rollback_err then return nil, rollback_err end
            return { upload = upload, duplicate = true, job_id = upload.processing_job_id }, nil
        end
        params.trace_context = upload.trace_context
        params.immutable_payload.max_execution_ms = upload.processing_max_execution_ms
        event.trace_context = upload.trace_context
    end
    local enqueued, enqueue_err = jobs.enqueue_tx(tx, dbtype, params)
    if enqueue_err then return abort(enqueue_err) end
    if not enqueued.existing then
        local _, append_err = threads_writer.append_system_tx(tx, dbtype, component_id, { event })
        if append_err then return abort(append_err) end
    end
    if upload.processing_intent_state ~= nil then
        local _, ack_err = processing_intent_repo.acknowledge_enqueue_tx(tx, upload.uuid, enqueued.id)
        if ack_err then return abort(ack_err) end
    end
    local _, commit_err = tx:commit()
    if commit_err then return abort(commit_err) end
    if upload.processing_intent_state ~= nil then
        upload.processing_intent_state, upload.processing_job_id = "acknowledged", enqueued.id
    end
    local result = {
        upload = upload,
        enqueued = not enqueued.existing,
        duplicate = enqueued.existing,
        job_id = enqueued.id,
        upload_id = upload.uuid,
        thread_id = component_id,
    }
    if not enqueued.existing then
        local _, notify_err = retention_notifier.notify({ kind = "events_appended", thread_id = component_id })
        if notify_err then db:release(); return result, notify_err end
    end
    local _, wake_err = jobs_wake.nudge_workers(db, dbtype)
    db:release()
    return result, wake_err
end

return { enqueue_upload_job = enqueue_upload_job, max_execution_ms = max_execution_ms }
