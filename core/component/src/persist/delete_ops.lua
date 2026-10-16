-- Component deletion and child re-rooting under the caller's transaction.
local sql = require("sql")
local placement = require("placement")
local component_types = require("component_types")
type Executor = sql.DB | sql.Transaction

local function response_error(field: string): error
    return errors.new({message = "component deletion response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "component_delete_response", field = field}})
end

local function rows_error(rows: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(rows) ~= "table" then return response_error(field) end
    return nil
end

local function affected_count(result: any, err: error?, operation: string, field: string,
    maximum: integer, exact: integer?): (integer?, error?)
    if err then return nil, errors.wrap(err, operation) end
    if type(result) ~= "table" then return nil, response_error(field) end
    local count = tonumber(result.rows_affected)
    if count == nil or count ~= count or count < 0 or count > maximum or count % 1 ~= 0
        or (exact ~= nil and count ~= exact) then return nil, response_error(field) end
    return count :: integer, nil
end

-- Keep the direct child attached as a durable continuation pointer until both
-- its old-prefix paths and outside ancestry edges are drained. The deleted
-- owner's committed mark blocks its own writes while these bounded pages run.
local function reroot_child_page(tx: Executor, db: Executor, parent_id: string, child_id: string): (boolean?, error?)
    local parent, parent_err = placement.read_node(tx, parent_id)
    if parent_err then return nil, errors.wrap(parent_err, "parent read during child reroot failed") end
    if type(parent) ~= "table" then return nil, response_error("parent") end
    local child_old_path = placement.build_path(db, child_id, tostring(parent.path))
    local new_root_path = placement.build_path(db, child_id, nil)
    local dialect, type_err = (tx :: any):db_type()
    if type_err then return nil, errors.wrap(type_err, "child reroot dialect unavailable") end
    if type(dialect) ~= "string" or dialect == "" then return nil, response_error("database.type") end
    local prefix = tostring(dialect) == sql.type.POSTGRES and "c.path <@ $2::ltree" or "c.path LIKE $2 || '%'"
    local rows, read_err = tx:query("SELECT c.component_id,c.path FROM " .. component_types.TABLES.ANCESTOR
        .. " a JOIN " .. component_types.TABLES.COMPONENTS .. " c ON c.component_id=a.component_id"
        .. " WHERE a.ancestor_id=$1 AND " .. prefix .. " ORDER BY c.component_id LIMIT $3",
        { child_id, child_old_path, 100 })
    local page_err = rows_error(rows, read_err, "child reroot path page failed", "child.paths")
    if page_err then return nil, page_err end
    for _, row in ipairs(rows :: { { component_id: string, path: string } }) do
        local old = tostring(row.path)
        local path = new_root_path .. old:sub(#child_old_path + 1)
        local result, update_err = tx:execute("UPDATE " .. component_types.TABLES.COMPONENTS
            .. " SET path=$1 WHERE component_id=$2 AND path=$3", { path, row.component_id, old })
        local _, write_err = affected_count(result, update_err, "child reroot path update failed", "child.path_update", 1, 1)
        if write_err then return nil, write_err end
    end
    if #rows == 100 then return true, nil end
    local edges_pending, edge_err = placement.relink_root_page(tx, db, child_id, 100)
    if edge_err then return nil, edge_err end
    if edges_pending then return true, nil end
    local result, update_err = tx:execute("UPDATE " .. component_types.TABLES.COMPONENTS
        .. " SET parent_id=NULL WHERE component_id=$1 AND parent_id=$2", { child_id, parent_id })
    local _, detach_err = affected_count(result, update_err, "child reroot detach failed", "child.detach", 1, 1)
    if detach_err then return nil, detach_err end
    return false, nil
end

-- Validate the deterministic placement constraints of a component deletion without
-- mutating anything. Teardown calls this before invoking an implementation-owned
-- deletable, so a missing child policy cannot destroy side data and only then reject
-- the component-row deletion. DELETE_COMPONENT calls the same function again in its
-- write transaction to remain authoritative under concurrency.
-- Validation only reads children and explicitly handles a missing query result.
type ChildReader = { query: (string, ...unknown) -> ({ table }?, error?) }

local function validate_delete_tx(tx: Executor | ChildReader, payload: any): ({ { component_id: string, path: string? } }?, error?)
    payload = type(payload) == "table" and payload or {}
    if not payload.component_id then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end

    -- Capture direct children before deletion so each subtree can be explicitly
    -- orphaned to root (parent_id NULL) with re-materialized paths afterward.
    local children, cerr = tx:query("SELECT component_id,path FROM " .. component_types.TABLES.COMPONENTS
        .. " WHERE parent_id=$1 ORDER BY component_id ASC LIMIT 1", { payload.component_id })
    local read_err = rows_error(children, cerr, "failed to read children", "children.rows")
    if read_err then return nil, read_err end
    local child_rows = children :: { { component_id: string, path: string? } }
    if #child_rows > 0 then
        local policy = payload.child_policy
        if policy == nil or policy == "" then
            return nil, (errors.new({
                message = "component has child components; pass child_policy=reparent_root or delete children first",
                kind = errors.CONFLICT,
            }) :: error)
        end
        if policy ~= "reparent_root" then
            return nil, (errors.new({ message = "unsupported child_policy: " .. tostring(policy), kind = errors.INVALID }) :: error)
        end
    end
    return child_rows, nil
end

-- The component's delete mark is committed before this command. Drain at most
-- 100 owned auxiliary rows in its transaction; the existing retention slot
-- retries the same command while the mark keeps new component writes fenced.
local function drain_owner_rows(tx: Executor, component_id: string): (boolean?, error?)
    local specs = {
        { "kickside_component_declaration_fence", "automation_id" },
        { component_types.TABLES.ACCESS, "access_id" },
        { component_types.TABLES.META, "meta_id" },
        { "kickside_execution_identity_audit", "identity_generation" },
    }
    local remaining = 100
    for _, spec in ipairs(specs) do
        if remaining == 0 then break end
        local result, delete_err = tx:execute("WITH doomed AS (SELECT " .. spec[2] .. " FROM " .. spec[1]
            .. " WHERE component_id=$1 ORDER BY " .. spec[2] .. " LIMIT $2) DELETE FROM " .. spec[1]
            .. " WHERE component_id=$1 AND " .. spec[2] .. " IN (SELECT " .. spec[2] .. " FROM doomed)",
            { component_id, remaining })
        local count, page_err = affected_count(result, delete_err, "component owner page failed for " .. spec[1],
            "owner.delete", remaining, nil)
        if page_err then return nil, page_err end
        remaining = remaining - (count :: integer)
    end
    for _, spec in ipairs(specs) do
        local rows, read_err = tx:query("SELECT " .. spec[2] .. " FROM " .. spec[1]
            .. " WHERE component_id=$1 LIMIT 1", { component_id })
        local continuation_err = rows_error(rows, read_err, "component owner continuation read failed for " .. spec[1], "owner.rows")
        if continuation_err then return nil, continuation_err end
        if rows[1] then return true, nil end
    end
    return false, nil
end

-- DELETE_COMPONENT payload: { component_id, child_policy? }. Placement is not
-- ownership: a plain delete refuses direct children; child_policy =
-- "reparent_root" explicitly preserves the old placement behavior for ownership
-- cascades that delete a parented component outside a workspace subtree walk.
-- The component's own meta + access rows are deleted in the same tx:
-- per-connection SQLite FK enforcement is off, so the schema's ON DELETE CASCADE
-- does not fire and these would otherwise orphan on every component deletion.
local function delete_component(tx: Executor, db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    local payload = command.payload or {}
    local tree_err = placement.lock_tree(tx)
    if tree_err then return nil, tree_err end
    local child_rows, validation_err = validate_delete_tx(tx, payload)
    if validation_err then return nil, validation_err end

    local locked, lock_err = tx:execute("UPDATE " .. component_types.TABLES.COMPONENTS
        .. " SET context_revision=context_revision WHERE component_id=$1", { payload.component_id })
    local _, proof_err = affected_count(locked, lock_err, "component delete lock failed", "component.lock", 1, nil)
    if proof_err then return nil, proof_err end

    local pending, owner_err = drain_owner_rows(tx, payload.component_id :: string)
    if owner_err then return nil, owner_err end
    if pending then
        return { component_id = payload.component_id, changes_made = false,
            rows_affected = 0, deleted = false, pending = true }, nil
    end
    if child_rows and child_rows[1] then
        local child_pending, child_err = reroot_child_page(tx, db, payload.component_id :: string,
            tostring(child_rows[1].component_id))
        if child_err then return nil, child_err end
        if child_pending then
            return { component_id = payload.component_id, changes_made = false,
                rows_affected = 0, deleted = false, pending = true }, nil
        end
        local more_children, children_err = tx:query("SELECT component_id FROM " .. component_types.TABLES.COMPONENTS
            .. " WHERE parent_id=$1 LIMIT 1", { payload.component_id })
        local continuation_err = rows_error(more_children, children_err, "child reroot continuation read failed", "children.remaining")
        if continuation_err then return nil, continuation_err end
        if more_children[1] then
            return { component_id = payload.component_id, changes_made = false,
                rows_affected = 0, deleted = false, pending = true }, nil
        end
    end

    local edges_pending, edge_err = placement.unlink_node_page(tx, db, payload.component_id :: string, 100)
    if edge_err then return nil, edge_err end
    if edges_pending then
        return { component_id = payload.component_id, changes_made = false,
            rows_affected = 0, deleted = false, pending = true }, nil
    end

    local result, err = sql.builder.delete(component_types.TABLES.COMPONENTS)
        :where("component_id = ?", payload.component_id)
        :run_with(tx):exec()
    local count, delete_err = affected_count(result, err, "failed to delete component", "component.delete", 1, nil)
    if delete_err then return nil, delete_err end

    return {
        component_id = payload.component_id,
        changes_made = (count :: integer) > 0,
        rows_affected = count :: integer,
        deleted = true,
    }, nil
end

return { validate_delete_tx = validate_delete_tx, delete_component = delete_component }
