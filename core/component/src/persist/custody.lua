-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local registry = require("registry")
local component_types = require("component_types")
local error_envelope = require("error_envelope")

local M = {}
local COMPONENTS = component_types.TABLES.COMPONENTS
type Executor = sql.DB | sql.Transaction
type Owner = { type: string, kind: string?, id: string, incarnation: string? }

function M.unresolved(): error
    return errors.new({kind = errors.CONFLICT, message = "component custody requires upgrade proof",
        retryable = true, details = {code = "custody_unresolved"}})
end

local function exists(db: Executor, condition: string, args: { any }): (boolean?, error?)
    local rows, err = db:query("SELECT 1 FROM " .. COMPONENTS .. " WHERE " .. condition .. " LIMIT 1", args)
    if err then return nil, err end
    return rows[1] ~= nil, nil
end

-- Historical placements and metadata can both change. Probe unresolved child
-- kinds across the producer's scope, including already-fenced rows.
function M.validate_legacy_custodian(db: Executor, row: any): error?
    if tonumber(row.custody_legacy) ~= 1 then return nil end
    local binding, lookup_err = registry.get(row.impl_id)
    if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then return lookup_err end
    local meta = binding and binding.meta
    if type(meta) ~= "table" then return nil end
    if type(meta.root_attachment_producers) == "table" and next(meta.root_attachment_producers) ~= nil then
        -- Current manifests cannot exclude historical attachments. Removed
        -- manifests and drained metadata can leave a row with no scope proof.
        local pending, err = exists(db, "owner_type='unresolved' AND component_id<>$1",
            {row.component_id})
        if err then return err end
        if pending then return M.unresolved() end
    end
    if type(meta.owned_child_producers) == "table" then
        for impl_id in pairs(meta.owned_child_producers) do
            local pending, err = exists(db, "owner_type='unresolved' AND impl_id=$1 AND component_id<>$2",
                {impl_id, row.component_id})
            if err then return err end
            if pending then return M.unresolved() end
        end
    end
    return nil
end

local function predicate(owner: Owner): (string, { any })
    if owner.type == "component" then
        return "owner_type='component' AND owner_kind IS NULL AND owner_id=$1 AND owner_incarnation=$2",
            {owner.id, owner.incarnation}
    end
    return "owner_type='principal' AND owner_kind=$1 AND owner_id=$2 AND owner_incarnation IS NULL",
        {owner.kind, owner.id}
end

function M.has_children(db: Executor, id: string, incarnation: string?): (boolean?, error?)
    if incarnation == nil then return false, nil end
    local condition, args = predicate({type = "component", id = id, incarnation = incarnation})
    return exists(db, condition, args)
end

-- Direct retirement cannot discard a protected edge. Owned retirement can
-- bring this gate to readiness by retiring the exact children first.
function M.validate_removal(db: Executor, id: string, row: any): error?
    local legacy_err = M.validate_legacy_custodian(db, row)
    if legacy_err then return legacy_err end
    local children, read_err = M.has_children(db, id, row.secrets_incarnation)
    if read_err then return read_err end
    if children then
        return errors.new({kind = errors.CONFLICT, message = "component has custody dependants"})
    end
    return nil
end

function M.matches(row: any, expected: any): boolean
    local owner = expected.owner
    return row.secrets_incarnation == expected.incarnation and row.owner_type == owner.type
        and row.owner_id == owner.id and row.owner_kind == owner.kind and row.owner_incarnation == owner.incarnation
end

-- Adoption locks this same row before changing its principal. Carry the
-- report's original authority through every immutable descendant edge.
function M.lock_principal_root(tx: sql.Transaction, dialect: string, root: any): (boolean?, error?)
    local rows, err = tx:query("SELECT 1 FROM " .. COMPONENTS
        .. " WHERE component_id=$1 AND secrets_incarnation=$2 AND owner_type='principal' AND owner_kind=$3 AND owner_id=$4"
        .. (dialect == sql.type.POSTGRES and " FOR UPDATE" or ""),
        {root.id, root.incarnation, root.owner.kind, root.owner.id})
    if err then return nil, err end
    return rows[1] ~= nil, nil
end

-- Reports are authorized outside Component. Return only exact typed edges and
-- physical rows. The retirement transaction rechecks the evidence for each row.
function M.list(owner: Owner, limit: integer): ({ any }?, error?)
    local db, open_err = sql.get(component_types.db_id())
    if open_err then return nil, open_err end
    local rows, primary
    if owner.type == "component" then
        local custodians, lookup_err = db:query("SELECT component_id,impl_id,custody_legacy FROM " .. COMPONENTS
            .. " WHERE component_id=$1 AND secrets_incarnation=$2", {owner.id, owner.incarnation})
        primary = lookup_err
        if not primary and custodians[1] then primary = M.validate_legacy_custodian(db, custodians[1]) end
    end
    if not primary then
        local condition, args = predicate(owner)
        args[3] = limit
        rows, primary = db:query("SELECT component_id,secrets_incarnation FROM " .. COMPONENTS
            .. " WHERE " .. condition .. " ORDER BY component_id LIMIT $3", args)
    end
    primary = error_envelope.cleanup(function(): (any, error?) return db:release() end, primary, "release custody database")
    if primary then return nil, primary end
    return rows, nil
end

-- A retained FULL grant on an unresolved row is a reason to preserve it for
-- review. It never confers custody or authorizes lifecycle retirement.
function M.review_witness(user_id: string): (any?, error?)
    local db, open_err = sql.get(component_types.db_id())
    if open_err then return nil, open_err end
    local rows, read_err = db:query([[SELECT c.component_id,c.secrets_incarnation FROM kickside_component_access a
        JOIN kickside_components c ON c.component_id=a.component_id
        WHERE a.subject_type='user' AND a.subject_id=$1 AND a.access_mask=15 AND a.inherited=0
          AND a.source_component_id=CAST(a.component_id AS TEXT) AND c.owner_type='unresolved' AND c.custody_legacy=1
          AND c.secrets_incarnation IS NOT NULL ORDER BY a.component_id LIMIT 1]], {user_id})
    local err = error_envelope.cleanup(function(): (any, error?) return db:release() end, read_err, "release custody review evidence")
    if err then return nil, err end
    return rows[1], nil
end

return M
