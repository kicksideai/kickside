local json = require("json")

-- Stable serialization and delegation bytes for ExecutionIdentity v2.
-- Installed into the runtime owner so validation and error construction stay one path.
type Principal = { kind: string, id: string }
type ExecutionIdentity = {
    version: number,
    principal: Principal,
    authorized_by: Principal,
    component_id: string?,
    credential_id: string?,
    link_id: string?,
    captured_at: string,
}
type Map = { [string]: any }

return function(M: any, failure: any)
    local DELEGATE_POLICY_PREFIX = "kickside.delegate:"
    local function u32be(n: number): string
        local b1: integer = (math.floor(n / 16777216) % 256) :: integer
        local b2: integer = (math.floor(n / 65536) % 256) :: integer
        local b3: integer = (math.floor(n / 256) % 256) :: integer
        local b4: integer = (n % 256) :: integer
        return string.char(b1, b2, b3, b4)
    end

    local function field_bytes(text: string): string
        return u32be(#text) .. text
    end

    -- delegation_bytes(kind, id, root) -> canonical byte string (IDENTITY-1 §2.1):
    -- 0x01 || u32be(len(kind)) || kind || u32be(len(id)) || id || u32be(len(root))
    -- || root, where root is the execution root or "*" for an explicit cross-root
    -- grant. Length prefixes make eng vs eng:x vs different roots unambiguous.
    function M.delegation_bytes(kind: string, id: string, root: string?): string
        local anchor = root or "*"
        return string.char(0x01) .. field_bytes(kind) .. field_bytes(id) .. field_bytes(anchor)
    end

    local function hex_bytes(raw: string): string
        local parts: { string } = {}
        for i = 1, #raw do parts[#parts + 1] = string.format("%02x", raw:byte(i)) end
        return table.concat(parts)
    end

    -- delegation_policy_id(kind, id, root) -> the one named policy per grant.
    function M.delegation_policy_id(kind: string, id: string, root: string?): string
        return DELEGATE_POLICY_PREFIX .. hex_bytes(M.delegation_bytes(kind, id, root))
    end

    -- check_grant(grantee, granted_by) -> error?. Pure grantor allowlist
    -- (IDENTITY-1 §2.1): groups never grant or authorize; a component ADMIN
    -- acting on themselves cannot self-grant delegation.
    function M.check_grant(grantee: any, granted_by: any): error?
        local grantee_principal, grantee_err = M.check_principal(grantee, "grantee")
        if grantee_err then return grantee_err end
        local grantor, grantor_err = M.check_principal(granted_by, "granted_by")
        if grantor_err then return grantor_err end
        if (grantor :: Principal).kind == M.KIND.GROUP then
            return failure("groups never grant delegation", errors.PERMISSION_DENIED, "access", false)
        end
        if (grantor :: Principal).kind == (grantee_principal :: Principal).kind
            and (grantor :: Principal).id == (grantee_principal :: Principal).id then
            return failure("delegation self-grant is refused", errors.PERMISSION_DENIED, "access", false)
        end
        return nil
    end

    -- to_row(identity) -> ({actor_id, actor_context}?, err?). actor_id is the
    -- derived runtime key; actor_context encodes the whole v2 object.
    function M.to_row(identity: any): (any?, error?)
        local ok, verr = M.validate(identity)
        if not ok then return nil, verr end
        local id = identity :: ExecutionIdentity
        local encoded, jerr = json.encode({
            version = M.VERSION,
            principal = { kind = id.principal.kind, id = id.principal.id },
            authorized_by = { kind = id.authorized_by.kind, id = id.authorized_by.id },
            component_id = id.component_id,
            credential_id = id.credential_id,
            link_id = id.link_id,
            captured_at = id.captured_at,
        })
        if jerr or not encoded then
            return nil, failure("failed to encode execution identity: " .. tostring(jerr), errors.INVALID, "declaration", false, jerr)
        end
        return { actor_id = M.actor_key(id.principal), actor_context = encoded }, nil
    end

    -- from_row(actor_id, actor_context) -> (ExecutionIdentity?, err?). v2 only:
    -- invalid or unsupported identity records refuse.
    function M.from_row(actor_id: any, actor_context: any): (ExecutionIdentity?, error?)
        if type(actor_id) ~= "string" or actor_id == "" then
            return nil, failure("actor_id is required", errors.INVALID, "declaration", false)
        end
        local decoded: any = nil
        if type(actor_context) == "string" and actor_context ~= "" then
            local value, derr = json.decode(actor_context)
            if derr or type(value) ~= "table" then
                return nil, failure("invalid actor_context json", errors.INVALID, "declaration", false, derr)
            end
            decoded = value
        elseif type(actor_context) == "table" then
            decoded = actor_context
        else
            return nil, failure("actor_context is required", errors.INVALID, "declaration", false)
        end
        local ok, verr = M.validate(decoded)
        if not ok then
            return nil, verr
        end
        local id = decoded :: ExecutionIdentity
        if actor_id ~= M.actor_key(id.principal) then
            return nil, failure("actor_id does not match the stored principal", errors.INVALID, "declaration", false)
        end
        return {
            version = M.VERSION,
            principal = { kind = id.principal.kind, id = id.principal.id },
            authorized_by = { kind = id.authorized_by.kind, id = id.authorized_by.id },
            component_id = id.component_id,
            credential_id = id.credential_id,
            link_id = id.link_id,
            captured_at = id.captured_at,
        }, nil
    end
end
