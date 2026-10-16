-- Pure ExecutionIdentity v2 helpers shared by the component persist writers.
-- No security, SQL, contract, or process calls: canonical audit bytes and
-- audit record construction only. Live checks (ambient actor, policy
-- liveness, ADMIN, fences) stay with the caller. Every identity primitive
-- (KIND, DELEGATE_ACTION, actor_key, principal_of_key, is_maintenance_key,
-- check_principal, is_valid_id, same_principal, check_grant, utc_now,
-- delegation encoding) lives only in
-- kickside.execution:execution_identity (IDENTITY-1 §2.1); this module
-- never reimplements one.
local M = {}

type Principal = { kind: string, id: string }

M.AUDIT_TABLE = "kickside_execution_identity_audit"

function M.escape_json(text: string): string
    local out: { string } = {}
    for i = 1, #text do
        local byte = text:byte(i)
        if byte == 34 then out[#out + 1] = "\\\""
        elseif byte == 92 then out[#out + 1] = "\\\\"
        elseif byte == 10 then out[#out + 1] = "\\n"
        elseif byte == 13 then out[#out + 1] = "\\r"
        elseif byte == 9 then out[#out + 1] = "\\t"
        elseif byte < 32 then out[#out + 1] = string.format("\\u%04x", byte)
        else out[#out + 1] = string.char(byte) end
    end
    return table.concat(out)
end

function M.json_string(value: any): string
    if value == nil then return "null" end
    return "\"" .. M.escape_json(tostring(value)) .. "\""
end

-- Canonical v2 bytes in fixed field order.
function M.canonical_identity(principal: Principal, authorizer: Principal, component_id: string, captured_at: string,
    credential_id: string?, link_id: string?): string
    return "{\"authorized_by\":{\"id\":" .. M.json_string(authorizer.id) .. ",\"kind\":" .. M.json_string(authorizer.kind) .. "}"
        .. ",\"captured_at\":" .. M.json_string(captured_at)
        .. ",\"component_id\":" .. M.json_string(component_id)
        .. ",\"credential_id\":" .. M.json_string(credential_id) .. ",\"link_id\":" .. M.json_string(link_id)
        .. ",\"principal\":{\"id\":" .. M.json_string(principal.id) .. ",\"kind\":" .. M.json_string(principal.kind) .. "}"
        .. ",\"version\":2}"
end

function M.request_digest(principal: Principal, expected_generation: number): string
    return "{\"expected_generation\":" .. tostring(expected_generation)
        .. ",\"principal\":{\"id\":" .. M.json_string(principal.id) .. ",\"kind\":" .. M.json_string(principal.kind) .. "}}"
end

function M.audit_record(old_principal: string, principal: Principal, authorizer: Principal, request_id: string,
    digest: string, expected: number, outcome: string, canonical: string): string
    return "{\"authorizer\":" .. M.json_string(authorizer.kind .. ":" .. authorizer.id)
        .. ",\"expected_generation\":" .. tostring(expected)
        .. ",\"identity_hash\":" .. M.json_string(canonical)
        .. ",\"new_principal\":" .. M.json_string(principal.kind .. ":" .. principal.id)
        .. ",\"old_principal\":" .. M.json_string(old_principal)
        .. ",\"outcome\":" .. M.json_string(outcome)
        .. ",\"request_digest\":" .. M.json_string(digest)
        .. ",\"request_id\":" .. M.json_string(request_id) .. "}"
end

return M
