local execution_identity = require("execution_identity")
local upload_query_repo = require("upload_query_repo")
local upload_tokens = require("upload_tokens")

local function failure(message: string, kind: string, error_kind: string): error
    return errors.new({ message = message, kind = kind,
        retryable = kind == errors.UNAVAILABLE or kind == errors.INTERNAL,
        details = { error_kind = error_kind } })
end

local function clean_metadata(metadata: any): { [string]: any }
    local clean: { [string]: any } = {}
    if type(metadata) ~= "table" then return clean end
    for k, v in pairs(metadata) do
        if type(k) ~= "string" or k:sub(1, 1) ~= "_" then
            clean[k] = v
        end
    end
    return clean
end

local function callback_function_id(payload: any, success: boolean): string?
    local id = success and payload.function_id or payload.on_error_id
    if type(id) ~= "string" or id == "" then return nil end
    return id
end

local function run(input: any): (any, any?)
    input = type(input) == "table" and input or {}
    local payload = type(input.payload) == "table" and input.payload or {}
    local upload_id = tostring(payload.upload_id or "")
    if upload_id == "" then return nil, failure("missing upload_id", errors.INVALID, "declaration") end
    local token = type(payload.token) == "string" and payload.token or ""
    if token == "" then return nil, failure("missing upload callback token", errors.INVALID, "declaration") end

    local token_payload, token_err = upload_tokens.unpack(token)
    if token_err or type(token_payload) ~= "table" then
        if type(token_err) == "userdata" then return nil, token_err end
        return nil, failure("invalid upload callback token: " .. tostring(token_err or "unknown"),
            errors.INVALID, "declaration")
    end
    if token_payload.upload_id ~= upload_id then
        return nil, failure("upload callback token does not match upload", errors.INVALID, "declaration")
    end

    local success = payload.success == true
    local func_id = callback_function_id(token_payload, success)
    if not func_id then
        return nil, failure("upload callback function is required", errors.INVALID, "declaration")
    end

    local upload, upload_err = upload_query_repo.get(upload_id)
    if upload_err or not upload then
        if errors.is(upload_err, errors.NOT_FOUND) or (not upload and not upload_err) then
            return nil, failure("upload callback target is missing", errors.NOT_FOUND, "subject")
        end
        if type(upload_err) == "userdata" then return nil, upload_err end
        return nil, failure("upload callback lookup failed: " .. tostring(upload_err),
            errors.UNAVAILABLE, "infrastructure")
    end

    local stored, row_err = execution_identity.from_row(token_payload.actor_id, token_payload.actor_context)
    if row_err or not stored then return nil, row_err end
    local executor, bind_err = execution_identity.bind(stored, {
        deferred_owner = "kickside.uploads:uploads",
    })
    if bind_err or not executor then return nil, bind_err end

    local trace_context = token_payload.trace_context
    local scoped, context_err = executor:with_context({
            upload_id = upload.uuid,
            actor_id = upload.actor_id,
            trace_context = trace_context,
        })
    if context_err or not scoped then return nil, context_err end

    local _, call_err = scoped:call(func_id, {
        upload_id = upload.uuid,
        status = success and "completed" or "error",
        error = payload.error,
        mime_type = upload.mime_type,
        size = upload.size,
        storage_id = upload.storage_id,
        storage_path = upload.storage_path,
        type_id = upload.type_id,
        metadata = clean_metadata(upload.metadata),
        params = token_payload.params,
        trace_context = trace_context,
    })
    if call_err then
        return nil, call_err
    end

    return { success = true, upload_id = upload.uuid, function_id = func_id }, nil
end

return { run = run }
