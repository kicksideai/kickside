-- Shared reply-provider sender.
--
-- The channel/DM session bridge and the DM surface's system-notice path write
-- output back to a connection's reply provider through here. This is the single
-- chunking + send loop they share.

local production_component = require("component")
local registry = require("registry")
local logger = require("logger")
local conn_types = require("conn_types")
local production_authorization = require("reply_authorization")

local function construct(dependencies: any): any
local component = dependencies.component
local reply_authorization = dependencies.authorization
local M = {}

-- The reply-provider target: the connection component to open and the resource
-- to post to. Callers may pass a wider config; only these two are read here.
type ReplyConfig = {
    component_id: string?,
    resource_id: string?,
    reply_proof: any?,
    outbound: boolean?,
}

M.ReplyConfig = ReplyConfig

type StatusHandle = {
    component_id: string?,
    resource_id: string?,
    reply_proof: any?,
    message_ref: string?,
    sent: boolean?,
    editable: boolean?,
}

M.StatusHandle = StatusHandle

local DEFAULT_MAX_LENGTH = 2000

-- Split content into <= max_len chunks, preferring to break on a late newline.
local function chunk_content(content: string, max_len: number): {string}
    if #content <= max_len then
        return { content }
    end

    local chunks: {string} = {}
    local remaining = content

    while #remaining > 0 do
        if #remaining <= max_len then
            chunks[#chunks + 1] = remaining
            break
        end

        local cut = max_len
        local newline = string.find(string.sub(remaining, 1, max_len), "\n[^\n]*$")
        if newline and newline > max_len / 2 then
            cut = newline - 1
        end

        chunks[#chunks + 1] = string.sub(remaining, 1, math.floor(cut))
        remaining = string.sub(remaining, math.floor(cut) + 1)
    end

    return chunks
end

M.chunk_content = chunk_content

-- Send each chunk via send_fn(chunk) -> (result, err). Partial-failure rule:
-- a failure before anything is delivered is retriable. A later failure is an
-- incomplete, ambiguous delivery: return an error plus partial=true so callers
-- keep it visible without automatically resending already delivered chunks.
local function send_chunks(chunks: {string}, send_fn: any): (any?, any?, boolean?)
    local last_result = nil
    local sent = 0
    for i, chunk in ipairs(chunks) do
        local result, send_err = send_fn(chunk)
        if not send_err and type(result) == "table" and result.success == false then
            send_err = result.error or "reply provider refused the send"
        end
        if send_err then
            if sent == 0 then
                return nil, send_err
            end
            logger:warn("reply truncated: chunk send failed after partial delivery", {
                sent = sent, total = #chunks, failed_chunk = i, error = tostring(send_err),
            })
            return nil, send_err, true
        end
        sent = sent + 1
        last_result = result
    end
    return last_result, nil
end

M.send_chunks = send_chunks

type ReplyCapabilities = { max_length: number, content_types: { string }, attachments: boolean, embeds: boolean }

-- capabilities(component_id) -> a reply provider's STATIC capabilities, read from its
-- binding's `meta.reply` block. This is the connection-capabilities seam that replaced the get_capabilities
-- contract method: capabilities are declared once on the contract.binding, so a
-- consumer resolves them straight from the registry instead of opening the provider.
--
-- Resolution: component_id -> impl_id (component.list_system, a trusted read) ->
-- registry.get(impl_id).meta.reply. Missing optional declarations use text defaults;
-- lookup errors propagate to the caller.
function M.capabilities(component_id: string): (ReplyCapabilities?, any?)
    local caps: ReplyCapabilities = {
        max_length = DEFAULT_MAX_LENGTH, content_types = { "text/markdown" },
        attachments = false, embeds = false,
    }
    if type(component_id) ~= "string" or component_id == "" then return caps end
    local rows, list_err = component.list_system({ component_ids = { component_id } })
    if list_err then return nil, list_err end
    local impl_id = (type(rows) == "table" and rows[1]) and tostring((rows[1] :: any).impl_id or "") or ""
    if impl_id == "" then return caps end
    local entry: any, entry_err = registry.get(impl_id)
    if entry_err then return nil, entry_err end
    local meta: any = type(entry) == "table" and (entry :: any).meta or nil
    local reply: any = type(meta) == "table" and (meta :: any).reply or nil
    if type(reply) ~= "table" then return caps end
    caps.max_length = tonumber((reply :: any).max_length) or caps.max_length
    if type((reply :: any).content_types) == "table" then caps.content_types = (reply :: any).content_types :: { string } end
    caps.attachments = (reply :: any).attachments == true
    caps.embeds = (reply :: any).embeds == true
    return caps
end

-- authorize(config) -> err?. Every provider operation here uses the
-- connection's bot credentials, which open_private reads at the trusted system
-- level, so the caller is authorized first (OWNERSHIP A30): a presented reply
-- proof must admit this connection and conversation, and an operation without
-- one is ordinary outbound under the caller's connection WRITE grant.
local function authorize(config: ReplyConfig): error?
    if config.reply_proof ~= nil then
        return reply_authorization.verify({ reply_proof = config.reply_proof,
            connection_id = config.component_id, resource_id = config.resource_id }) :: error?
    end
    local _, access_err = component.validate_access(config.component_id, component.ACCESS.WRITE)
    return access_err
end

-- open(config) -> (provider?, err?): the reply provider, opened only after the
-- caller is authorized for it.
local function open(config: ReplyConfig): (any?, any?)
    local component_id = config.component_id
    if not component_id or component_id == "" then return nil, "reply component_id not configured" end
    local auth_err = authorize(config)
    if auth_err then return nil, auth_err end
    local svc, err = component.open_private(component_id, conn_types.REPLY_PROVIDER_CONTRACT)
    if err then return nil, err end
    if not svc then return nil, "reply provider did not open" end
    return svc, nil
end

-- Send content to the configured reply provider, chunked to the provider's declared
-- reply max_length (default 2000). Returns the last send result or an error; an
-- authorization refusal is the typed error from authorize.
function M.send_reply(worker_config: ReplyConfig, content: string): (any?, any?, boolean?)
    local component_id = worker_config.component_id
    local svc, err = open(worker_config)
    if err or not svc then return nil, err end

    local caps, caps_err = M.capabilities(component_id :: string)
    if caps_err then return nil, caps_err end
    local max_length = (caps :: ReplyCapabilities).max_length
    if worker_config.reply_proof ~= nil and #content > max_length then
        return nil, "sealed reply exceeds one provider message"
    end
    local chunks = chunk_content(content, max_length)
    return send_chunks(chunks, function(chunk: string): (any?, string?)
        return svc:send_reply({
            resource_id = worker_config.resource_id,
            content_type = "markdown",
            content = chunk,
            reply_proof = worker_config.reply_proof,
            outbound = worker_config.outbound,
        })
    end)
end

-- Render transient provider-native status for a reply target. Providers map this
-- to their own channel UX (Discord typing, Slack typing/activity when available).
-- Unsupported providers are a clean no-op; callers must never synthesize status by
-- posting chat messages.
function M.send_status(worker_config: ReplyConfig, phase: string, label: string?): (boolean, any?)
    local svc, err = open(worker_config)
    if err or not svc then return false, err end
    local result, status_err = (svc :: any):send_status({
        resource_id = worker_config.resource_id,
        phase = phase,
        label = label,
        reply_proof = worker_config.reply_proof,
    })
    if status_err then return false, status_err end
    if type(result) == "table" and (result :: any).success == false then
        return false, (result :: any).error or "status render failed"
    end
    return true, nil
end

local function message_ref(result: any): string
    if type(result) ~= "table" then return "" end
    local ref = (result :: any).message_ref or (result :: any).id or (result :: any).ts
    if type(ref) ~= "string" then return "" end
    return ref
end

function M.update_reply(worker_config: ReplyConfig, message_ref_value: string, content: string): (any?, any?)
    if message_ref_value == "" then return nil, "message_ref is required" end
    local svc, err = open(worker_config)
    if err or not svc then return nil, err end
    return (svc :: any):update_reply({
        resource_id = worker_config.resource_id,
        message_ref = message_ref_value,
        content_type = "markdown",
        content = content,
        reply_proof = worker_config.reply_proof,
    })
end

function M.update_status(handle: StatusHandle, content: string): (StatusHandle, any?, boolean)
    handle = type(handle) == "table" and handle or {}
    local config: ReplyConfig = { component_id = handle.component_id, resource_id = handle.resource_id,
        reply_proof = handle.reply_proof }
    local ref = handle.message_ref or ""

    if ref ~= "" and handle.editable ~= false then
        local result, err = M.update_reply(config, ref, content)
        if not err and type(result) == "table" and (result :: any).success ~= false then
            handle.sent = true
            handle.editable = true
            local updated_ref = message_ref(result)
            if updated_ref ~= "" then handle.message_ref = updated_ref end
            return handle, nil, true
        end
        if err then return handle, err, false end
        return handle, type(result) == "table" and result.error or "reply provider refused the update", false
    end

    if handle.sent == true then return handle, nil, false end
    local result, err = M.send_reply(config, content)
    if err then return handle, err, false end
    handle.sent = true
    local ref_out = message_ref(result)
    if ref_out ~= "" then
        handle.message_ref = ref_out
        handle.editable = true
    else
        handle.editable = false
    end
    return handle, nil, true
end

function M.finish_status(handle: StatusHandle, content: string): (any?, any?, boolean)
    handle = type(handle) == "table" and handle or {}
    local config: ReplyConfig = { component_id = handle.component_id, resource_id = handle.resource_id,
        reply_proof = handle.reply_proof }
    if handle.message_ref and handle.message_ref ~= "" and handle.editable ~= false then
        local result, err = M.update_reply(config, handle.message_ref, content)
        if err then return nil, err, false end
        if type(result) ~= "table" or result.success == false then
            return nil, type(result) == "table" and result.error or "reply provider refused the update", false
        end
        return result, nil, true
    end
    local result, err = M.send_reply(config, content)
    return result, err, false
end

M.new = construct
return M
end

return construct({ component = production_component, authorization = production_authorization })
