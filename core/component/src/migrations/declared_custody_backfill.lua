-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local component_types = require("component_types")
local execution_identity = require("execution_identity")
local identity_ops = require("identity_ops")

local PAGE = 200

local function initial_user_id(row, audit)
    local context = json.decode(row.private_context)
    local identity = type(context) == "table" and context._execution_identity
    if not execution_identity.validate(identity) or identity.version ~= execution_identity.VERSION
        or identity.component_id ~= row.component_id then
        return nil
    end
    local principal, authorizer = identity.principal, identity.authorized_by
    if principal.kind ~= "user" or authorizer.kind ~= "user" or principal.id ~= authorizer.id then
        return nil
    end
    local canonical = identity_ops.canonical_identity(principal, authorizer, identity.component_id,
        identity.captured_at, identity.credential_id, identity.link_id)
    local initial_audit = identity_ops.audit_record("none", principal, authorizer,
        "initial:" .. row.component_id, "initial", 0, "initial", canonical)
    if row.identity_hash ~= canonical or audit ~= initial_audit then return nil end
    return principal.id
end

local function enroll(tx, row, postgres, verify_producer)
    local receipts, read_err = tx:query([[
        SELECT f.automation_id,f.command_id,f.declaration_hash,a.record_json
          FROM kickside_component_declaration_fence f
          JOIN kickside_execution_identity_audit a ON a.component_id=f.component_id
         WHERE f.component_id=$1 AND a.request_id=$2 AND a.identity_generation=0
           AND f.applied_command_generation=1 AND f.command_id<>'' AND f.declaration_hash<>''
           AND NOT EXISTS (SELECT 1 FROM kickside_component_declaration_fence other
                            WHERE other.component_id=f.component_id AND other.automation_id<>f.automation_id)
        ]] .. (postgres and " FOR SHARE OF f,a" or ""), {row.component_id, "initial:" .. row.component_id})
    if read_err then error(read_err) end
    local receipt = receipts[1]
    local owner_id = receipt and initial_user_id(row, receipt.record_json)
    if not owner_id then return end

    local declaration = {component_id = row.component_id, automation_id = receipt.automation_id,
        command_id = receipt.command_id, declaration_hash = receipt.declaration_hash}
    if verify_producer(tx, declaration, postgres) ~= true then return end

    local result, write_err = tx:execute([[
        UPDATE kickside_components SET owner_type='principal',owner_kind='user',owner_id=$1
         WHERE component_id=$2 AND secrets_incarnation=$3 AND owner_type='unresolved'
           AND custody_legacy=1 AND deleting_at IS NULL AND identity_generation=0 AND identity_hash=$4
        ]], {owner_id, row.component_id, row.secrets_incarnation, row.identity_hash})
    if write_err then error(write_err) end
    if tonumber(result.rows_affected) ~= 1 then error("custody backfill lost its component fence") end
end

-- Producer migrations supply the shared database transaction and their fixed
-- verifier. Component holds the row and its receipts through producer proof
-- and derives ownership from the initial identity.
return function(tx, options)
    if options.db_id ~= component_types.db_id() then return nil end
    local cursor, postgres = options.cursor, options.postgres
    local after = cursor and " AND component_id>$2 ORDER BY component_id LIMIT $3" or " ORDER BY component_id LIMIT $2"
    local args = cursor and {options.impl_id, cursor, PAGE} or {options.impl_id, PAGE}
    local rows, err = tx:query([[
        SELECT component_id,secrets_incarnation,CAST(private_context AS TEXT) AS private_context,identity_hash
          FROM kickside_components
         WHERE owner_type='unresolved' AND custody_legacy=1 AND impl_id=$1 AND deleting_at IS NULL
           AND secrets_incarnation IS NOT NULL AND identity_generation=0 AND identity_hash IS NOT NULL
        ]] .. after .. (postgres and " FOR UPDATE" or ""), args)
    if err then error(err) end
    for _, row in ipairs(rows) do enroll(tx, row, postgres, options.verify_producer) end
    return #rows == PAGE and rows[PAGE].component_id or nil
end
