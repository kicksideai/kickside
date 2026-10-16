local logger = require("logger")
local upload_record_repo = require("upload_record_repo")
local upload_read_model = require("upload_read_model")
local pipeline_lib = require("pipeline_lib")
local upload_tokens = require("upload_tokens")
local log = logger:named("upload_lib")
type TokenError = string | error

local function shallow_copy(input: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(input) == "table" then
        for k, v in pairs(input) do out[k] = v end
    end
    return out
end

local function upload_token(metadata: any): string?
    if type(metadata) ~= "table" then return nil end
    if type(metadata.__upload_token) ~= "string" or metadata.__upload_token == "" then return nil end
    return metadata.__upload_token
end

local function first_completion_token(metadata: any): string?
    local token = upload_token(metadata)
    if token then return token end
    if type(metadata) == "table" and type(metadata.__upload_tokens) == "table" then
        for _, value in ipairs(metadata.__upload_tokens) do
            if type(value) == "string" and value ~= "" then return value end
        end
    end
    return nil
end

local function bound_token_upload_id(metadata: any): (string?, error?)
    if type(metadata) ~= "table" then return nil, nil end
    local tokens: { string } = {}
    if type(metadata.__upload_token) == "string" and metadata.__upload_token ~= "" then
        tokens[#tokens + 1] = metadata.__upload_token
    end
    if type(metadata.__upload_tokens) == "table" then
        for _, token in ipairs(metadata.__upload_tokens) do
            if type(token) == "string" and token ~= "" then tokens[#tokens + 1] = token end
        end
    end
    local bound: string? = nil
    for _, token in ipairs(tokens) do
        local payload = upload_tokens.unpack(token)
        if type(payload) == "table" and type(payload.upload_id) == "string" then
            if bound and bound ~= payload.upload_id then
                return nil, errors.new({ message = "callback tokens target different uploads", kind = errors.INVALID,
                    retryable = false, details = { error_kind = "declaration" } })
            end
            bound = payload.upload_id
        end
    end
    return bound, nil
end

local function rebind_child_tokens(metadata: any, upload_id: string): TokenError?
    local function rebind(token: any): (any, TokenError?)
        if type(token) ~= "string" or token == "" then return token, nil end
        local payload = upload_tokens.unpack(token)
        if type(payload) ~= "table" then return token, nil end
        local rebound, rebound_err = upload_tokens.pack({
            upload_id = upload_id, function_id = payload.function_id,
            on_error_id = payload.on_error_id, params = payload.params,
            actor_id = payload.actor_id, actor_context = payload.actor_context,
            trace_context = payload.trace_context,
        })
        return rebound, rebound_err
    end
    local token, token_err = rebind(metadata.__upload_token)
    if token_err then return token_err end
    metadata.__upload_token = token
    if type(metadata.__upload_tokens) == "table" then
        local rebound_tokens: { any } = {}
        for i, value in ipairs(metadata.__upload_tokens) do
            local rebound, err = rebind(value)
            if err then return err end
            rebound_tokens[i] = rebound
        end
        metadata.__upload_tokens = rebound_tokens
    end
    return nil
end

local function token_trace_context(metadata: any): any?
    local token = first_completion_token(metadata)
    if not token then return nil end
    local payload, err = upload_tokens.unpack(token)
    if err then
        log:warn("upload token trace unpack failed", { error = tostring(err) })
        return nil
    end
    return type(payload) == "table" and type((payload :: any).trace_context) == "table" and (payload :: any).trace_context or nil
end

local function take_trace_context(metadata: any): (any?, string?)
    if type(metadata) ~= "table" then return nil, nil end
    local raw = metadata.trace_context
    if raw == nil then
        raw = token_trace_context(metadata)
    end
    metadata.trace_context = nil
    if raw == nil then return nil, nil end
    if type(raw) ~= "table" then return nil, "trace_context must be an object" end
    return raw, nil
end

local function fill_missing_trace_context(upload: any, trace_context: any): ()
    if type(upload) ~= "table" or type(trace_context) ~= "table" or upload.trace_context then
        return
    end
    local _, err = upload_record_repo.update_trace_context(tostring(upload.uuid), trace_context)
    if err then
        log:warn("failed to attach trace_context to dedup upload", { upload_id = upload.uuid, error = tostring(err) })
    else
        upload.trace_context = trace_context
    end
end

local function add_token(tokens: { string }, seen: { [string]: boolean }, token: any): ()
    if type(token) ~= "string" or token == "" or seen[token] then return end
    seen[token] = true
    tokens[#tokens + 1] = token
end

local function defer_dedup_upload_token(existing: any, token: string): ()
    if type(existing) ~= "table" or not existing.uuid then return end

    local meta = shallow_copy(existing.metadata)
    local tokens: { string } = {}
    local seen: { [string]: boolean } = {}
    add_token(tokens, seen, meta.__upload_token)
    if type(meta.__upload_tokens) == "table" then
        for _, value in ipairs(meta.__upload_tokens) do add_token(tokens, seen, value) end
    end
    add_token(tokens, seen, token)
    meta.__upload_tokens = tokens

    local _, err = upload_record_repo.update_metadata(tostring(existing.uuid), meta)
    if err then
        log:warn("failed to defer dedup upload token", { upload_id = existing.uuid, error = tostring(err) })
    else
        existing.metadata = meta
    end
end

local function handle_dedup_upload_token(existing: any, metadata: any): ()
    local token = upload_token(metadata)
    if not token then return end

    local committed = select(1, upload_read_model.get_for_actor(
        tostring(existing.actor_id or ""), tostring(existing.uuid or "")))
    local status = type(committed) == "table" and tostring((committed :: any).status or "") or ""
    if status == "completed" then
        local callback_upload = shallow_copy(existing)
        callback_upload.metadata = metadata
        pipeline_lib.invoke_upload_token(callback_upload, true, nil)
    elseif status == "error" then
        local callback_upload = shallow_copy(existing)
        callback_upload.metadata = metadata
        pipeline_lib.invoke_upload_token(callback_upload, false,
            tostring((committed :: any).error or "File processing failed"))
    else
        defer_dedup_upload_token(existing, token)
    end
end

return {
    bound_token_upload_id = bound_token_upload_id,
    rebind_child_tokens = rebind_child_tokens,
    take_trace_context = take_trace_context,
    fill_missing_trace_context = fill_missing_trace_context,
    handle_dedup_upload_token = handle_dedup_upload_token,
}
