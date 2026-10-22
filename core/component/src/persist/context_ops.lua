-- Component private context writes and the execution identity SET path.
-- Callers own the transaction; validation of authority and any cross-store
-- command receipt happens before it begins. Declaration commands live in
-- declaration_ops, the declaration fence in declaration_fence.
local sql = require("sql")
local time = require("time")
local json = require("json")
local security = require("security")
local component_types = require("component_types")
local context_policy = require("context_policy")
local access_ops = require("access_ops")
local access_subjects = require("access_subjects")
local declaration_fence = require("declaration_fence")
local audit_policy = require("audit_policy")
local dependency_error = require("identity_access").dependency_error
local meta_ops = require("meta_ops")

local M = {}
type Principal = { kind: string, id: string }
type Executor = sql.DB | sql.Transaction

local TABLE = component_types.TABLES.COMPONENTS
local authorized_identity = setmetatable({}, { __mode = "k" })

local function failure(message: string, kind: string, error_kind: string?): error
    return (errors.new({ message = message, kind = kind,
        details = error_kind and { error_kind = error_kind } or nil }) :: error)
end

local function encode(value: any): (string?, error?)
    local encoded, err = json.encode(value)
    if err then return nil, errors.wrap(err, "failed to encode private context") end
    if not encoded then return nil, failure("failed to encode private context: nil", errors.INVALID) end
    return encoded, nil
end

local function lock_and_read(tx: any, component_id: string): ({ [string]: any }?, error?, integer?)
    local lock_err = meta_ops.lock_component_tx(tx, component_id)
    if lock_err then return nil, lock_err end
    local rows, read_err = sql.builder.select("private_context", "context_revision"):from(TABLE)
        :where("component_id = ?", component_id):limit(1):run_with(tx):query()
    if read_err then return nil, errors.wrap(read_err, "failed to read private context") end
    if not rows or not rows[1] then return nil, failure("component not found", errors.NOT_FOUND) end
    local raw = rows[1].private_context
    if type(raw) == "table" then return raw :: { [string]: any }, nil, tonumber(rows[1].context_revision) :: integer end
    local decoded, decode_err = json.decode(type(raw) == "string" and raw ~= "" and raw or "{}")
    if decode_err then return nil, errors.wrap(decode_err, "stored private context is invalid") end
    if type(decoded) ~= "table" then
        return nil, failure("stored private context is invalid", errors.INTERNAL)
    end
    return decoded :: { [string]: any }, nil, tonumber(rows[1].context_revision) :: integer
end

-- Read a component's current context_revision within the transaction; nil when the
-- component does not exist.
function M.context_revision_tx(tx: Executor, component_id: string): (integer?, error?)
    local rows, err = sql.builder.select("context_revision")
        :from(component_types.TABLES.COMPONENTS)
        :where("component_id = ?", component_id)
        :limit(1)
        :run_with(tx):query()
    if err then
        return nil, errors.wrap(err, "failed to read context revision")
    end
    if not rows or #rows == 0 then
        return nil, nil
    end
    return tonumber((rows[1] :: any).context_revision) :: integer, nil
end

function M.check_context_revision(tx: any, component_id: string, expected: integer): error?
    local lock_err = meta_ops.lock_component_tx(tx, component_id)
    if lock_err then return lock_err end
    local version, read_err = M.context_revision_tx(tx, component_id)
    if read_err then return read_err end
    if version ~= expected then
        return (errors.new({ message = "context subject version mismatch", kind = errors.CONFLICT,
            retryable = false, details = { reason = "version_mismatch", subject = "context",
                version = version, expected = expected } }) :: error)
    end
    return nil
end

local function write(tx: any, component_id: string, context: { [string]: any }): (component_types.CommandResult?, error?)
    local encoded, enc_err = encode(context)
    if enc_err then return nil, enc_err end
    local result, err = sql.builder.update(TABLE)
        :set("private_context", encoded)
        :set("context_revision", sql.builder.expr("context_revision + 1"))
        :set("updated_at", time.now():utc():format_rfc3339())
        :where("component_id = ?", component_id):run_with(tx):exec()
    if err then return nil, errors.wrap(err, "failed to write private context") end
    if result.rows_affected == 0 then return nil, failure("component not found", errors.NOT_FOUND) end
    return { component_id = component_id, changes_made = true }, nil
end

function M.set_context(tx: any, payload: any): (component_types.CommandResult?, error?)
    if type(payload.component_id) ~= "string" or payload.component_id == "" then
        return nil, failure("component ID is required", errors.INVALID)
    end
    local incoming = payload.private_context or {}
    local invalid = context_policy.validate_public(incoming, payload.delete_keys)
    if invalid then return nil, invalid end
    local stored, read_err = lock_and_read(tx, payload.component_id)
    if read_err then return nil, read_err end
    return write(tx, payload.component_id, context_policy.preserve_runtime_keys(stored, incoming))
end

function M.patch_context(tx: any, payload: any): (component_types.CommandResult?, error?)
    if type(payload.component_id) ~= "string" or payload.component_id == "" then
        return nil, failure("component ID is required", errors.INVALID)
    end
    local invalid = context_policy.validate_public(payload.patch, payload.delete_keys)
    if invalid then return nil, invalid end
    local stored, read_err = lock_and_read(tx, payload.component_id)
    if read_err then return nil, read_err end
    for key, value in pairs(payload.patch) do stored[key] = value end
    if type(payload.delete_keys) == "table" then
        for _, key in ipairs(payload.delete_keys) do stored[key] = nil end
    end
    return write(tx, payload.component_id, stored :: { [string]: any })
end

local identity = require("identity_ops")
local execution_identity = require("execution_identity")

local function ambient_authorizer(): (Principal?, error?)
    local actor, actor_err = security.actor()
    if actor_err then return nil, errors.wrap(actor_err, "authenticated actor lookup failed") end
    if not actor then return nil, failure("authenticated actor is required", errors.PERMISSION_DENIED, "access") end
    local actor_id, id_err = actor:id()
    if id_err then return nil, errors.wrap(id_err, "authenticated actor identity lookup failed") end
    if type(actor_id) ~= "string" or actor_id == "" then
        return nil, failure("authenticated actor is required", errors.PERMISSION_DENIED, "access")
    end
    if execution_identity.is_maintenance_key(actor_id) then
        return nil, failure("framework maintenance actors never authorize execution", errors.INVALID, "declaration")
    end
    local authorizer, key_err = execution_identity.principal_of_key(actor_id)
    if key_err or not authorizer then return nil, key_err end
    if (authorizer :: Principal).kind == execution_identity.KIND.GROUP then
        return nil, failure("groups do not authorize execution", errors.PERMISSION_DENIED, "access")
    end
    return authorizer, nil
end

-- Selection uses the same capture boundary as execution. Capture retains
-- inherited credential/link restrictions and refuses replacement of an admitted
-- principal or root; native group decisions belong to the resolver.
local function check_act_as(authorizer: Principal, principal: Principal, component_id: string): (any?, error?)
    local proposed, capture_err = execution_identity.capture({principal = principal, component_id = component_id})
    if capture_err or not proposed then return nil, capture_err end
    if not execution_identity.same_principal(proposed.authorized_by, authorizer) then
        return nil, failure("execution selection must use the authenticated authorizer", errors.PERMISSION_DENIED, "subject")
    end
    if execution_identity.same_principal(authorizer, principal) then return proposed, nil end
    local authorized, authorize_err = execution_identity.authorize(proposed)
    if authorize_err or not authorized then return nil, authorize_err end
    return proposed, nil
end

local function owner_denied(automation_id: string, reason: any): error
    return failure("component is owned by its declaration owner " .. automation_id
        .. "; its execution identity changes only through the owner's set_execution_identity command"
        .. (reason ~= nil and (": " .. tostring(reason)) or ""), errors.PERMISSION_DENIED, "access")
end

-- prepare_identity(input, owner?) validates a SET_EXECUTION_IDENTITY request
-- outside any SQL transaction: input = {component_id, principal, request_id,
-- expected_identity_generation}. Caller identity, act-as and liveness run
-- here; ADMIN, the generation fence and the audit write run in the tx below.
-- owner = { automation_id, verify } names the declaration owner of a fenced
-- component: verify(request) must confirm the request as its pending set_execution_identity
-- command for this operator.
function M.prepare_identity(input: any, owner: any?): (any?, error?)
    if type(input) ~= "table" then
        return nil, failure("SET_EXECUTION_IDENTITY input must be a table", errors.INVALID, "declaration")
    end
    local args = input :: any
    if type(args.component_id) ~= "string" or args.component_id == "" then
        return nil, failure("component ID is required", errors.INVALID, "declaration")
    end
    local principal, principal_err = execution_identity.check_principal(args.principal, "principal")
    if principal_err or not principal then return nil, principal_err end
    if type(args.request_id) ~= "string" or args.request_id == "" then
        return nil, failure("request_id is required", errors.INVALID, "declaration")
    end
    local expected = tonumber(args.expected_identity_generation)
    if expected == nil or expected < 0 or expected ~= math.floor(expected) then
        return nil, failure("expected_identity_generation must be a non-negative integer", errors.INVALID, "declaration")
    end
    local authorizer, authorizer_err = ambient_authorizer()
    if authorizer_err or not authorizer then return nil, authorizer_err end
    local captured, act_err = check_act_as(authorizer, principal, args.component_id :: string)
    if act_err or not captured then return nil, act_err end
    local owner_automation: string? = nil
    local command_fence: any = nil
    if owner ~= nil then
        local automation_id = tostring((owner :: any).automation_id or "")
        local confirmed, verify_err = (owner :: any).verify({
            automation_id = automation_id,
            component_id = args.component_id,
            command_id = args.request_id,
            operator_id = (authorizer :: Principal).id,
            principal = principal,
            expected_identity_generation = expected,
        })
        if verify_err then return nil, verify_err end
        if type(confirmed) ~= "table" or (confirmed :: any).valid ~= true
            or tostring((confirmed :: any).automation_id or "") ~= automation_id then
            return nil, owner_denied(automation_id, type(confirmed) == "table" and (confirmed :: any).reason or nil)
        end
        owner_automation = automation_id
        if confirmed.command_generation ~= nil then
            local generation = confirmed.command_generation
            if type(generation) ~= "number" or generation < 1 or generation ~= math.floor(generation)
                or confirmed.command_id ~= args.request_id or type(confirmed.declaration_hash) ~= "string"
                or confirmed.declaration_hash == "" then
                return nil, failure("invalid owner command fence", errors.INVALID, "declaration")
            end
            command_fence = {component_id=args.component_id,automation_id=automation_id,generation=generation,
                command_id=confirmed.command_id,declaration_hash=confirmed.declaration_hash}
        end
    end
    local subjects, subjects_err = access_subjects.resolve(authorizer.id)
    if subjects_err then return nil, errors.wrap(subjects_err, "identity access subjects unavailable") end
    local prefixes, prefixes_err = access_subjects.access_filter(authorizer.id)
    if prefixes_err then return nil, errors.wrap(prefixes_err, "identity access filter unavailable") end
    local token = {}
    authorized_identity[token] = {
        component_id = args.component_id,
        principal = principal,
        authorizer = authorizer,
        request_id = args.request_id,
        request_digest = identity.request_digest(principal, expected),
        expected_generation = expected,
        owner_automation = owner_automation,
        command_fence = command_fence,
        captured_at = captured.captured_at,
        credential_id = captured.credential_id,
        link_id = captured.link_id,
        actor_id = authorizer.id,
        subjects = subjects,
        prefixes = prefixes,
    }
    return token, nil
end

local function lock_and_read_identity(tx: any, component_id: string): (any?, error?)
    local stored, read_err = lock_and_read(tx, component_id)
    if read_err or not stored then return nil, read_err end
    local rows, gen_err = sql.builder.select("identity_generation", "identity_hash"):from(TABLE)
        :where("component_id = ?", component_id):limit(1):run_with(tx):query()
    if gen_err then
        return nil, dependency_error(gen_err, "failed to read identity fence", true)
    end
    if not rows or not rows[1] then return nil, failure("component not found", errors.NOT_FOUND, "access") end
    return {
        context = stored,
        generation = tonumber((rows[1] :: any).identity_generation) or 0,
        hash = (rows[1] :: any).identity_hash,
    }, nil
end

local function write_identity(tx: any, component_id: string, state: any, new_identity: any, canonical: string): (any?, error?)
    local stored = state.context
    stored._execution_identity = new_identity
    local encoded, enc_err = encode(stored)
    if enc_err then return nil, enc_err end
    local result, err = sql.builder.update(TABLE)
        :set("private_context", encoded)
        :set("context_revision", sql.builder.expr("context_revision + 1"))
        :set("identity_generation", state.generation + 1)
        :set("identity_hash", canonical)
        :set("updated_at", time.now():utc():format_rfc3339())
        :where("component_id = ?", component_id):run_with(tx):exec()
    if err then return nil, dependency_error(err, "failed to write execution identity", true) end
    if result.rows_affected == 0 then return nil, failure("component not found", errors.NOT_FOUND, "access") end
    return { component_id = component_id, changes_made = true }, nil
end

local function preserved_restrictions(stored: any, captured: any): (string?, string?, boolean, error?)
    local prior = type(stored) == "table" and (stored :: any)._execution_identity or nil
    local combined: { [string]: any } = {}
    local introduced = false
    for _, field in ipairs({"credential_id", "link_id"}) do
        local value: any = nil
        if type(prior) == "table" then value = (prior :: any)[field] end
        if value ~= nil and (type(value) ~= "string" or value == "") then
            return nil, nil, false, failure("stored execution identity has an invalid " .. field,
                errors.INTERNAL, "infrastructure")
        end
        local incoming = captured[field]
        if value ~= nil and incoming ~= nil and value ~= incoming then
            return nil, nil, false, failure("selection cannot replace the stored " .. field,
                errors.PERMISSION_DENIED, "subject")
        end
        if value == nil and incoming ~= nil then introduced = true end
        combined[field] = value or incoming
    end
    return combined.credential_id, combined.link_id, introduced, nil
end

local function audit_row(tx: any, component_id: string, generation: number, request_id: string, record: string): error?
    local result, err = sql.builder.insert(identity.AUDIT_TABLE):set_map({
        component_id = component_id,
        identity_generation = generation,
        request_id = request_id,
        record_json = record,
        created_at = execution_identity.utc_now(),
        published_at = sql.as.null(),
    }):run_with(tx):exec()
    if err then return dependency_error(err, "failed to write identity audit", true) end
    if not result or tonumber(result.rows_affected) ~= 1 then
        return failure("failed to write identity audit: missing row proof", errors.INTERNAL, "infrastructure")
    end
    return nil
end

-- set_execution_identity_tx(tx, token): component row, declaration fence,
-- access rows, then identity and audit in the same transaction.
function M.set_execution_identity_tx(tx: Executor, token: any): (component_types.CommandResult?, error?)
    local prepared = authorized_identity[token]
    if not prepared then return nil, failure("validated identity token is required", errors.PERMISSION_DENIED, "access") end
    authorized_identity[token] = nil
    local component_id = prepared.component_id :: string
    local state, read_err = lock_and_read_identity(tx, component_id)
    if read_err or not state then return nil, read_err end
    -- The fence is read under the component lock: a fenced component takes an
    -- identity only for the owner command confirmed at prepare.
    local owner, owner_err = declaration_fence.owner(tx, component_id)
    if owner_err then return nil, owner_err end
    if owner ~= nil and prepared.owner_automation ~= owner then return nil, owner_denied(owner :: string, nil) end
    if prepared.command_fence ~= nil then
        local input = prepared.command_fence
        local prior, fence_err = declaration_fence.read(tx, component_id, input.automation_id)
        if fence_err then return nil, fence_err end
        if prior and (input.generation < prior.applied_command_generation
            or input.declaration_hash ~= prior.declaration_hash
            or (input.generation == prior.applied_command_generation and input.command_id ~= prior.command_id)) then
            return nil, failure("identity command loses its declaration fence", errors.CONFLICT, "declaration")
        end
        local save_err = declaration_fence.save_tx(tx, prior ~= nil, input)
        if save_err then return nil, save_err end
    end
    local allowed, access_err = access_ops.check_user_access(tx, prepared.actor_id, component_id,
        component_types.ACCESS.ADMIN, prepared.subjects, prepared.prefixes, true)
    if access_err then return nil, access_err end
    if not allowed then return nil, failure("ADMIN access is required", errors.PERMISSION_DENIED, "access") end
    local credential_id, link_id, introduced, restriction_err = preserved_restrictions((state :: any).context, prepared)
    if restriction_err then return nil, restriction_err end
    local replays, replay_err = sql.builder.select("record_json", "identity_generation"):from(identity.AUDIT_TABLE)
        :where("component_id = ?", component_id):where("request_id = ?", prepared.request_id)
        :limit(1):run_with(tx):query()
    if replay_err then
        return nil, dependency_error(replay_err, "failed to read identity audit", true)
    end
    if replays and replays[1] then
        if introduced then
            return nil, failure("request_id already used without the captured restrictions", errors.CONFLICT, "declaration")
        end
        local record = tostring((replays[1] :: any).record_json or "")
        -- record_json stores the digest JSON-escaped; compare the escaped form.
        if not record:find(identity.escape_json(prepared.request_digest), 1, true) then
            return nil, failure("request_id already used with a different digest", errors.CONFLICT, "declaration")
        end
        return {
            component_id = component_id,
            principal = prepared.principal,
            identity_generation = tonumber((replays[1] :: any).identity_generation),
            request_id = prepared.request_id,
            changes_made = false,
        }, nil
    end
    if prepared.expected_generation ~= (state :: any).generation then
        return nil, failure("stale identity generation: expected " .. tostring(prepared.expected_generation)
            .. ", current " .. tostring((state :: any).generation), errors.CONFLICT, "declaration")
    end
    local new_identity = {
        version = 2,
        principal = { kind = prepared.principal.kind, id = prepared.principal.id },
        authorized_by = { kind = prepared.authorizer.kind, id = prepared.authorizer.id },
        component_id = component_id,
        captured_at = prepared.captured_at,
    }
    if credential_id ~= nil then new_identity.credential_id = credential_id end
    if link_id ~= nil then new_identity.link_id = link_id end
    local canonical = identity.canonical_identity(prepared.principal, prepared.authorizer, component_id, prepared.captured_at,
        credential_id, link_id)
    local old_record = (state :: any).context._execution_identity
    local old_principal = "none"
    if type(old_record) == "table" and type((old_record :: any).principal) == "table" then
        old_principal = tostring((old_record :: any).principal.kind) .. ":" .. tostring((old_record :: any).principal.id)
    end
    local record = identity.audit_record(old_principal, prepared.principal, prepared.authorizer,
        prepared.request_id, prepared.request_digest, prepared.expected_generation, "set", canonical)
    if prepared.command_fence ~= nil then
        local audit, decode_err = json.decode(record)
        if decode_err then return nil, decode_err end
        audit.command_generation = prepared.command_fence.generation
        audit.declaration_hash = prepared.command_fence.declaration_hash
        local encoded, encode_err = json.encode(audit)
        if encode_err then return nil, encode_err end
        record = encoded
    end
    local size_err = audit_policy.check_row(component_id, record, "set_execution_identity")
    if size_err then return nil, size_err end
    local written, write_err = write_identity(tx, component_id, state, new_identity, canonical)
    if write_err or not written then return nil, write_err end
    local current_generation = tonumber((state :: any).generation) or 0
    local audit_err = audit_row(tx, component_id, current_generation + 1, prepared.request_id, record)
    if audit_err then return nil, audit_err end
    return {
        component_id = component_id,
        principal = prepared.principal,
        identity_generation = (state :: any).generation + 1,
        request_id = prepared.request_id,
        changes_made = true,
    }, nil
end

-- The locked context read and write the component's runtime-key writers share.
M.lock_and_read_tx = lock_and_read
M.write_context_tx = write

-- The identity state read, identity write and audit row the adoption writer
-- shares with the SET path.
M.lock_and_read_identity_tx = lock_and_read_identity
M.write_identity_tx = write_identity
M.audit_row_tx = audit_row

M.redact = context_policy.redact

return M
