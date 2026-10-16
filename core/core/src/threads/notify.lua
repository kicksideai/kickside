-- Thread-update notifier. emit_thread_update loads the thread's stored attrs,
-- resolves the audience from its stored owner and audience members, fans a
-- message out across this slice's pub/sub topics, and delivers it to each
-- user's hub process. The audience comes only from stored data: a caller names
-- the thread, never its recipients. A user without a connected hub is skipped;
-- any other delivery failure is returned. Writers reach it through emit, which
-- calls the emit_update function so hub delivery runs under the threads service
-- identity.

local json = require("json")
local time = require("time")
local sql = require("sql")
local consts = require("consts")
local funcs = require("funcs")
local env = require("threads_env")

local notify = {}

local EMIT_UPDATE = "kickside.core.threads:emit_update"

-- An access/audience sub-block carried inside thread attrs; either shape may
-- name members. Both lists are arbitrary JSON, so untrusted entries are filtered
-- to non-empty strings in resolve_user_ids.
type AudienceBlock = {
    user_ids: { any }?,
    members: { any }?,
}

-- The subset of a thread's attrs this slice reads to derive an audience. attrs
-- are open JSON, so each list is { any } and gets string-filtered downstream.
type ThreadAttrs = {
    user_ids: { any }?,
    members: { any }?,
    access: AudienceBlock?,
    audience: AudienceBlock?,
    owner_principal: any?,
    audience_principals: { any }?,
}

type Transport = {
    lookup: (string) -> (any?, error?),
    send: (any, string, any) -> (any?, error?),
    load_attrs: (string) -> (ThreadAttrs | string | nil, error?),
}

local default_lookup = process.registry.lookup :: (string) -> (any?, error?)

local function default_send(pid: any, topic: string, payload: any): (any?, error?)
    return process.send(pid :: string, topic, payload)
end

-- The stored attrs of one thread; a thread without a row has no audience.
local function default_load_attrs(thread_id: string): (ThreadAttrs | string | nil, error?)
    local db, db_err = sql.get(env.db_id() :: string)
    if db_err then return nil, errors.wrap(db_err, "thread audience db unavailable") end
    if not db then
        return nil, errors.new({message = "thread audience database acquisition returned no connection",
            kind = errors.INTERNAL, retryable = false,
            details = {code = "thread_audience_database_response", field = "sql.get"}})
    end
    local rows, query_err = db:query("SELECT attrs FROM kickside_thread WHERE id=$1", { thread_id })
    db:release()
    if query_err then
        return nil, errors.wrap(query_err, "thread audience lookup failed")
    end
    local row = rows and (rows :: { table })[1] or nil
    return row and row.attrs or nil, nil
end

local default_transport: Transport = { lookup = default_lookup, send = default_send, load_attrs = default_load_attrs }

-- Shape accepted by emit_thread_update. thread_id is required; everything else
-- is optional. event/data/thread are caller-defined payload bodies relayed
-- verbatim, so they stay open JSON (any). The audience is never part of it.
-- type discriminates the envelope ("event" | "projection", default "event");
-- projection_kind names the read model when type is
-- "projection"; seq carries the event/projection sequence the update reflects.
type EmitPayload = {
    thread_id: string?,
    topic: string?,
    event_type: string?,
    type: string?,
    projection_kind: string?,
    seq: integer?,
    -- caller-defined payload bodies, relayed to subscribers untouched.
    event: any?,
    data: any?,
    thread: any?,
}

-- The message delivered to each hub, carrying the typed payload envelope. topic
-- is set per fan-out iteration; the event/data/thread bodies are relayed from the
-- caller's payload untouched. type is the envelope discriminator;
-- projection_kind/seq are set for projection advances.
type EmitMessage = {
    topic: string?,
    type: string,
    thread_id: string,
    projection_kind: string?,
    seq: integer?,
    event_type: string,
    event: any?,
    data: any?,
    thread: any?,
    ts: string,
}

-- Summary returned to the caller. Counts reflect delivery attempts across the
-- topic x recipient fan-out, not unique recipients.
type EmitResult = {
    topic: string,
    topics: { string },
    thread_id: string,
    recipients: integer,
    topic_count: integer,
    delivered: integer,
    failed: integer,
}

local function trim(value: string?): string
    if type(value) ~= "string" then
        return ""
    end
    return (value :: string):match("^%s*(.-)%s*$") or ""
end

-- Decode a JSON string into a ThreadAttrs table; pass-through if already a
-- table; {} on anything else. Used for the loosely-typed thread_attrs input.
local function decode_attrs(raw: ThreadAttrs | string | nil): ThreadAttrs
    if type(raw) == "table" then
        return raw :: ThreadAttrs
    end
    if type(raw) ~= "string" or raw == "" then
        return {} :: ThreadAttrs
    end
    local decoded, err = json.decode(raw :: string)
    if err or type(decoded) ~= "table" then
        return {} :: ThreadAttrs
    end
    return decoded :: ThreadAttrs
end

-- Append every non-empty trimmed string in values onto target. Non-string
-- entries (the lists come from open JSON) are skipped.
local function collect_array_strings(target: { string }, values: { any }?)
    if type(values) ~= "table" then
        return
    end
    for _, value in ipairs(values :: { any }) do
        if type(value) == "string" then
            local normalized = trim(value :: string)
            if normalized ~= "" then
                target[#target + 1] = normalized
            end
        end
    end
end

-- Merge audience ids from the thread's owner and attrs (user_ids,
-- members, access.{user_ids,members}, audience.members),
-- preserving first-seen order and dropping duplicates. thread_attrs is a JSON
-- string or a ThreadAttrs table.
function notify.resolve_user_ids(thread_attrs: ThreadAttrs | string | nil): { string }
    local collected: { string } = {}
    local attrs = decode_attrs(thread_attrs)
    local owner = attrs.owner_principal
    if type(owner) == "table" and owner.kind == "user" and type(owner.id) == "string" then
        collect_array_strings(collected, { owner.id })
    end
    if type(attrs.audience_principals) == "table" then
        for _, member in ipairs(attrs.audience_principals :: { any }) do
            if type(member) == "table" and member.kind == "user" and type(member.id) == "string" then
                collect_array_strings(collected, { member.id })
            end
        end
    end
    collect_array_strings(collected, attrs.user_ids)
    collect_array_strings(collected, attrs.members)
    if type(attrs.access) == "table" then
        collect_array_strings(collected, (attrs.access :: AudienceBlock).user_ids)
        collect_array_strings(collected, (attrs.access :: AudienceBlock).members)
    end
    if type(attrs.audience) == "table" then
        collect_array_strings(collected, (attrs.audience :: AudienceBlock).members)
    end

    local seen: { [string]: boolean } = {}
    local unique: { string } = {}
    for _, user_id in ipairs(collected) do
        if not seen[user_id] then
            seen[user_id] = true
            unique[#unique + 1] = user_id
        end
    end
    return unique
end

-- Append value onto values if it is a non-empty string not already present.
local function push_unique(values: { string }, value: string?)
    local normalized = trim(value)
    if normalized == "" then
        return
    end
    for _, existing in ipairs(values) do
        if existing == normalized then
            return
        end
    end
    values[#values + 1] = normalized
end

-- The per-thread topic name: PREFIX .. thread_id. A single client can subscribe
-- to exactly this to watch one thread's stream in isolation.
local function thread_topic(thread_id: string): string
    return consts.THREAD_TOPIC_PREFIX .. thread_id
end

-- The per-thread per-kind projection (read-model) topic name:
-- PREFIX .. thread_id .. INFIX .. kind. A client subscribes to exactly this to
-- watch one read model of one thread advance.
function notify.projection_topic(thread_id: string, projection_kind: string): string
    return consts.THREAD_TOPIC_PREFIX .. thread_id .. consts.PROJECTION_TOPIC_INFIX .. projection_kind
end

-- The ordered topic set one update fans out to. An event update lands on the
-- caller's topic (or the default), the global overview, and the per-thread topic.
-- A projection update lands on its read-model topic and the overview. Deduplicated
-- so a caller naming a topic explicitly does not get it twice.
function notify.build_topics(
    thread_id: string, topic: string?, payload_type: string, projection_kind: string?
): { string }
    local topics: { string } = {}
    if payload_type == consts.PAYLOAD_TYPE.PROJECTION then
        push_unique(topics, topic)
        if type(projection_kind) == "string" and trim(projection_kind) ~= "" then
            push_unique(topics, notify.projection_topic(thread_id, trim(projection_kind)))
        end
        push_unique(topics, consts.OVERVIEW_TOPIC)
        return topics
    end
    push_unique(topics, topic)
    push_unique(topics, consts.DEFAULT_TOPIC)
    push_unique(topics, consts.OVERVIEW_TOPIC)
    push_unique(topics, thread_topic(thread_id))
    return topics
end

-- Deliver one message to a user's hub process. Returns (false, nil) when the
-- user has no registered hub, (true, nil) once sent, and the error of a failed
-- lookup or send, so a refused delivery is never mistaken for an absent hub.
local function emit_to_user_hub(transport: Transport, user_id: string, topic: string, payload: EmitMessage): (boolean, error?)
    local hub_pid, lookup_err = transport.lookup(consts.USER_HUB_PREFIX .. user_id)
    if lookup_err then
        if (lookup_err :: any):kind() == errors.NOT_FOUND then return false, nil end
        return false, lookup_err
    end
    if not hub_pid then
        return false, nil
    end
    local _, send_err = transport.send(hub_pid, topic, payload)
    if send_err ~= nil then
        return false, send_err
    end
    return true, nil
end

-- emit_thread_update is the function.lua entry point. payload_raw is a JSON
-- string or an EmitPayload table. Resolves the audience and topics, then
-- delivers a per-topic message to each recipient hub. Returns (EmitResult, nil)
-- or (nil, error) when thread_id is missing.
local function emit_thread_update(payload_raw: EmitPayload | string | nil, transport: Transport): (EmitResult?, error?)
    local payload: EmitPayload
    if type(payload_raw) == "string" then
        local decoded, err = json.decode(payload_raw :: string)
        if err or type(decoded) ~= "table" then
            return nil, (errors.new({ message = "payload is not valid JSON", kind = errors.INVALID }) :: error)
        end
        payload = decoded :: EmitPayload
    elseif type(payload_raw) == "table" then
        payload = payload_raw :: EmitPayload
    else
        return nil, (errors.new({ message = "payload is required", kind = errors.INVALID }) :: error)
    end

    local thread_id = trim(payload.thread_id)
    if thread_id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local payload_type = trim(payload.type)
    if payload_type ~= consts.PAYLOAD_TYPE.PROJECTION then
        payload_type = consts.PAYLOAD_TYPE.EVENT
    end

    local projection_kind: string? = nil
    local trimmed_kind = trim(payload.projection_kind)
    if trimmed_kind ~= "" then
        projection_kind = trimmed_kind
    end

    local topic = trim(payload.topic)
    if topic == "" then
        if payload_type == consts.PAYLOAD_TYPE.PROJECTION and projection_kind then
            topic = notify.projection_topic(thread_id, projection_kind :: string)
        else
            topic = consts.DEFAULT_TOPIC
        end
    end
    local topics = notify.build_topics(thread_id, topic, payload_type, projection_kind)

    local stored_attrs, attrs_err = transport.load_attrs(thread_id)
    if attrs_err then return nil, attrs_err end
    local user_ids = notify.resolve_user_ids(stored_attrs)

    local event_type = trim(payload.event_type)
    if event_type == "" then
        event_type = consts.DEFAULT_EVENT_TYPE
    end

    local seq: integer? = nil
    if type(payload.seq) == "number" then
        seq = math.floor(payload.seq :: number) :: integer
    end

    local message: EmitMessage = {
        type = payload_type,
        thread_id = thread_id,
        projection_kind = projection_kind,
        seq = seq,
        event_type = event_type,
        event = payload.event,
        data = payload.data,
        thread = payload.thread,
        ts = time.now():utc():format(time.RFC3339),
    }

    local delivered = 0
    local failed = 0
    for _, event_topic in ipairs(topics) do
        message.topic = event_topic
        for _, user_id in ipairs(user_ids) do
            local ok, err = emit_to_user_hub(transport, user_id, event_topic, message)
            if err then
                return nil, (errors.wrap(err, "thread update delivery to user " .. user_id .. " failed") :: error)
            end
            if ok then
                delivered = delivered + 1
            else
                failed = failed + 1
            end
        end
    end

    return {
        topic = topic,
        topics = topics,
        thread_id = thread_id,
        recipients = #user_ids,
        topic_count = #topics,
        delivered = delivered,
        failed = failed,
    }, nil
end

-- emit is the library-facing seam used by thread writers after their write
-- commits. Delivery runs in the emit_update function under the threads service
-- identity, independent of the writer's process authority.
function notify.emit(payload: table): (EmitResult?, error?)
    local result, err = funcs.call(EMIT_UPDATE, payload)
    if err then return nil, err end
    return result :: EmitResult, nil
end

-- Construct an isolated notifier with an explicit transport. The registered entry
-- uses the process transport; other callers can supply their own hub transport.
function notify.new(transport: Transport): { emit_thread_update: (EmitPayload | string | nil) -> (EmitResult?, error?) }
    return {
        emit_thread_update = function(payload_raw: EmitPayload | string | nil): (EmitResult?, error?)
            return emit_thread_update(payload_raw, transport)
        end,
    }
end

notify.emit_thread_update = notify.new(default_transport).emit_thread_update

return notify
