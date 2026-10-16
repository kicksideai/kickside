-- placement: hierarchy + ordering engine for the components table.
--
-- Two backend-specific representations of the ancestor path, one logical model:
--   postgres: ltree column. Labels are component UUIDs with hyphens stripped
--             (32 hex chars = a valid ltree label). Ancestor/descendant via @>/<@.
--   sqlite:   materialized TEXT path "/<id>/<id>/".
--
-- Ancestry and subtree reads go through the kickside_component_ancestor
-- closure (below); the path column remains the stored placement spelling that
-- credential narrowing prefixes match.
--
-- Ordering uses a lexorank string (fractional, midpoint between neighbors) so a
-- reorder is O(1): only the moved row's position changes. Read/query helpers
-- return values plus a typed error?; they never raise so the caller's
-- transaction keeps control of rollback.

local sql = require("sql")
local component_types = require("component_types")

local M = {}

-- A pooled connection or an open transaction; every helper reads through either.
type Executor = sql.DB | sql.Transaction

-- One placement row as read back.
type Node = {
    component_id: string,
    impl_id: string,
    parent_id: string?,
    position: string?,
    path: string?,
}

-- lexorank alphabet: digits then lowercase letters, ordered by byte value.
local ALPHABET = component_types.LEXORANK.ALPHABET
local BASE = #ALPHABET
local MIN_CHAR = ALPHABET:sub(1, 1)       -- "0"
local MAX_CHAR = ALPHABET:sub(BASE, BASE) -- "z"

local function char_index(c: string): integer
    return (ALPHABET:find(c, 1, true) or 1) - 1
end

local function index_char(i: integer): string
    return ALPHABET:sub(i + 1, i + 1)
end

-- Midpoint rank strictly between lo and hi (either may be nil = open bound).
-- Returns a string that sorts after lo and before hi byte-wise.
function M.rank_between(lo: string?, hi: string?): string
    local lo_s = lo or ""
    local hi_s = hi or ""

    local result: string[] = {}
    local i = 1
    while true do
        local lo_c = i <= #lo_s and lo_s:sub(i, i) or MIN_CHAR
        local hi_c = i <= #hi_s and hi_s:sub(i, i) or (hi_s == "" and MAX_CHAR or MIN_CHAR)

        if hi_s == "" then
            hi_c = MAX_CHAR
        end

        local lo_i = char_index(lo_c)
        local hi_i = char_index(hi_c)

        if lo_i == hi_i then
            result[i] = index_char(lo_i)
            i = i + 1
        else
            local mid = math.floor((lo_i + hi_i) / 2)
            if mid > lo_i then
                result[i] = index_char(mid)
                return table.concat(result)
            end
            -- Neighbors are adjacent: keep lo's char and descend a level.
            result[i] = index_char(lo_i)
            i = i + 1
            -- Append a midpoint above the implicit MIN of lo's next level.
            local next_lo = (i <= #lo_s) and char_index(lo_s:sub(i, i)) or 0
            result[i] = index_char(math.floor((next_lo + BASE) / 2))
            return table.concat(result)
        end
    end
    -- Unreachable: the loop returns once lo and hi diverge.
    return table.concat(result)
end

local function is_postgres(db: Executor): boolean
    return (db :: sql.DB):type() == sql.type.POSTGRES
end

-- ltree label for a component: uuid with hyphens stripped (32 hex chars).
local function ltree_label(component_id: string): string
    return (component_id:gsub("%-", ""))
end

-- Build the stored path for a node given its parent's stored path (or nil/root).
-- postgres: parent_path .. "." .. label ; root = label
-- sqlite:   parent_path .. id .. "/"     ; root = "/" .. id .. "/"
function M.build_path(db: Executor, component_id: string, parent_path: string?): string
    if is_postgres(db) then
        local label = ltree_label(component_id)
        if parent_path and parent_path ~= "" then
            return parent_path .. "." .. label
        end
        return label
    end
    local sep = component_types.PATH_SEPARATOR
    if parent_path and parent_path ~= "" then
        return parent_path .. component_id .. sep
    end
    return sep .. component_id .. sep
end

-- Whether a stored path is the prefix node itself or one of its descendants, matching
-- the same dialect rules build_path writes: a sqlite prefix carries the "/" separator
-- and is a literal string prefix of any descendant path; a pg ltree label has no "/"
-- and is itself or an ancestor when path == prefix or path starts with prefix .. ".".
-- The single-op, in-memory mirror of descendants() for point access checks.
function M.path_under_prefix(path: string?, prefix: string?): boolean
    if type(path) ~= "string" or path == "" or type(prefix) ~= "string" or prefix == "" then
        return false
    end
    if prefix:find(component_types.PATH_SEPARATOR, 1, true) then
        return path:sub(1, #prefix) == prefix
    end
    return path == prefix or path:sub(1, #prefix + 1) == prefix .. "."
end

-- Whether path falls under any prefix in the list. An empty list confines to nothing.
function M.path_under_any(path: string?, prefixes: { string }?): boolean
    if not prefixes then return false end
    for _, prefix in ipairs(prefixes) do
        if M.path_under_prefix(path, prefix) then
            return true
        end
    end
    return false
end

-- Read a component's stored parent_id, position, path within a tx.
function M.read_node(tx: Executor, component_id: string, for_write: boolean?): (Node?, error?)
    local query = sql.builder.select("component_id", "impl_id", "parent_id", "position", "path")
        :from(component_types.TABLES.COMPONENTS)
        :where("component_id = ?", component_id)
        :limit(1)
    if for_write then
        local dialect, dialect_err = (tx :: sql.Transaction):db_type()
        if dialect_err then return nil, dialect_err end
        if dialect == sql.type.POSTGRES then query = query:suffix("FOR UPDATE") end
    end
    local rows, err = query:run_with(tx):query()
    if err then
        return nil, errors.wrap(err, "placement read_node failed")
    end
    if not rows or #rows == 0 then
        return nil, nil
    end
    return rows[1] :: Node, nil
end

-- Structural writers serialize before reading paths or ancestry. A row lock on
-- the immediate parent alone cannot fence creation under a moving ancestor.
-- SQLite already serializes transactions on its single connection.
function M.lock_tree(tx: Executor): error?
    local dialect, dialect_err = (tx :: sql.Transaction):db_type()
    if dialect_err then return dialect_err end
    if dialect == sql.type.POSTGRES then
        local _, lock_err = tx:query("SELECT pg_advisory_xact_lock(hashtextextended('kickside.component.placement', 0))")
        if lock_err then
            return errors.wrap(lock_err, "component placement lock failed")
        end
    end
    return nil
end

-- Largest sibling position under parent_id (nil parent = root). Used to append.
function M.max_sibling_position(tx: Executor, parent_id: string?): (string?, error?)
    local q = sql.builder.select("position")
        :from(component_types.TABLES.COMPONENTS)
        :order_by("position DESC")
        :limit(1)
    if parent_id == nil then
        q = q:where("parent_id IS NULL")
    else
        q = q:where("parent_id = ?", parent_id)
    end
    local rows, err = q:run_with(tx):query()
    if err then
        return nil, errors.wrap(err, "placement max_sibling_position failed")
    end
    if rows and #rows > 0 and rows[1].position ~= nil then
        return rows[1].position :: string, nil
    end
    return nil, nil
end

-- Ancestry closure (DDL component 08). Every component owns one self row
-- (depth 0) plus one row per ancestor (depth = distance). Placement writers
-- keep it exact inside their transaction; readers resolve ancestry and
-- subtrees through its indexes instead of scanning paths.

local ANCESTOR = component_types.TABLES.ANCESTOR

local function closure_failure(message: string, cause: any?): error
    local text = message
    if cause ~= nil then text = text .. ": " .. tostring(cause) end
    return (errors.new({ message = text, kind = errors.INTERNAL }) :: error)
end

local function affected(result: any): integer
    return math.floor(tonumber(result and result.rows_affected) or 0)
end

-- Record a newly created node: its self row plus its parent's chain one level
-- deeper. The parent must already carry its own ancestry.
function M.link_node(tx: Executor, component_id: string, parent_id: string?): error?
    local _, self_err = sql.builder.insert(ANCESTOR)
        :set_map({ component_id = component_id, ancestor_id = component_id, depth = 0 })
        :run_with(tx):exec()
    if self_err then return closure_failure("ancestry self row for " .. component_id .. " failed", self_err) end
    if parent_id == nil or parent_id == "" then return nil end
    local result, err = tx:execute("INSERT INTO " .. ANCESTOR .. " (component_id, ancestor_id, depth)"
        .. " SELECT $1, ancestor_id, depth + 1 FROM " .. ANCESTOR .. " WHERE component_id = $2"
        .. " ORDER BY ancestor_id", { component_id, parent_id })
    if err then return closure_failure("ancestry of " .. component_id .. " under " .. tostring(parent_id) .. " failed", err) end
    if affected(result) < 1 then
        return closure_failure("parent component " .. tostring(parent_id) .. " has no ancestry")
    end
    return nil
end

-- Re-hang the subtree rooted at root_id under new_parent_id (nil = database
-- root). Edges from subtree members to the old outside chain are removed and
-- the new chain is written, both in (component_id, ancestor_id) order. Edges
-- inside the subtree are unchanged.
function M.relink_subtree(tx: Executor, db: Executor, root_id: string, new_parent_id: string?): error?
    local outside = "component_id IN (SELECT component_id FROM " .. ANCESTOR .. " WHERE ancestor_id = $1)"
        .. " AND ancestor_id NOT IN (SELECT component_id FROM " .. ANCESTOR .. " WHERE ancestor_id = $2)"
    if is_postgres(db) then
        local _, lock_err = tx:query("SELECT component_id, ancestor_id FROM " .. ANCESTOR .. " WHERE " .. outside
            .. " ORDER BY component_id, ancestor_id FOR UPDATE", { root_id, root_id })
        if lock_err then return closure_failure("ancestry lock for subtree " .. root_id .. " failed", lock_err) end
    end
    local _, del_err = tx:execute("DELETE FROM " .. ANCESTOR .. " WHERE " .. outside, { root_id, root_id })
    if del_err then return closure_failure("ancestry detach for subtree " .. root_id .. " failed", del_err) end
    if new_parent_id == nil or new_parent_id == "" then return nil end
    local result, ins_err = tx:execute("INSERT INTO " .. ANCESTOR .. " (component_id, ancestor_id, depth)"
        .. " SELECT s.component_id, p.ancestor_id, s.depth + p.depth + 1"
        .. " FROM " .. ANCESTOR .. " s JOIN " .. ANCESTOR .. " p ON p.component_id = $1"
        .. " WHERE s.ancestor_id = $2 ORDER BY s.component_id, p.ancestor_id", { new_parent_id, root_id })
    if ins_err then return closure_failure("ancestry attach for subtree " .. root_id .. " failed", ins_err) end
    if affected(result) < 1 then
        return closure_failure("parent component " .. tostring(new_parent_id) .. " has no ancestry")
    end
    return nil
end

-- Remove a deleted node's own edges and every edge that names it. Its former
-- children are re-hung first, so no descendant edge still points at it.
function M.unlink_node(tx: Executor, component_id: string): error?
    local _, err = tx:execute("DELETE FROM " .. ANCESTOR .. " WHERE component_id = $1 OR ancestor_id = $2",
        { component_id, component_id })
    if err then return closure_failure("ancestry removal for " .. component_id .. " failed", err) end
    return nil
end

-- Owner teardown keeps its delete mark across calls. These two helpers remove
-- at most `limit` closure edges per call, in primary-key order. The ordinary
-- placement writer above still uses its atomic relink for live moves.
local function delete_edge_page(tx: Executor, db: Executor, where_clause: string,
    args: { any }, limit: integer): (boolean?, error?)
    local params: { any } = {}
    for _, value in ipairs(args) do params[#params + 1] = value end
    params[#params + 1] = limit
    local query = "SELECT component_id,ancestor_id FROM " .. ANCESTOR .. " WHERE " .. where_clause
        .. " ORDER BY component_id,ancestor_id LIMIT $" .. tostring(#params)
    if is_postgres(db) then query = query .. " FOR UPDATE" end
    local rows, read_err = tx:query(query, params)
    if read_err or type(rows) ~= "table" then
        return nil, closure_failure("ancestry owner page read failed", read_err or "missing result")
    end
    for _, row in ipairs(rows :: { { component_id: string, ancestor_id: string } }) do
        local result, delete_err = tx:execute("DELETE FROM " .. ANCESTOR
            .. " WHERE component_id=$1 AND ancestor_id=$2", { row.component_id, row.ancestor_id })
        if delete_err or not result or tonumber(result.rows_affected) ~= 1 then
            return nil, closure_failure("ancestry owner page delete failed", delete_err or "missing row proof")
        end
    end
    return #rows == limit, nil
end

function M.relink_root_page(tx: Executor, db: Executor, root_id: string, limit: integer): (boolean?, error?)
    local where_clause = "component_id IN (SELECT component_id FROM " .. ANCESTOR .. " WHERE ancestor_id=$1)"
        .. " AND ancestor_id NOT IN (SELECT component_id FROM " .. ANCESTOR .. " WHERE ancestor_id=$2)"
    return delete_edge_page(tx, db, where_clause, { root_id, root_id }, limit)
end

function M.unlink_node_page(tx: Executor, db: Executor, component_id: string, limit: integer): (boolean?, error?)
    return delete_edge_page(tx, db, "component_id=$1 OR ancestor_id=$2",
        { component_id, component_id }, limit)
end

-- Strict ancestors of a node, nearest first, as component ids.
function M.ancestor_ids(tx: Executor, component_id: string): ({ string }?, error?)
    local rows, err = sql.builder.select("ancestor_id")
        :from(ANCESTOR)
        :where("component_id = ?", component_id)
        :where("depth > ?", 0)
        :order_by("depth ASC")
        :run_with(tx):query()
    if err then return nil, closure_failure("placement ancestors failed", err) end
    local out: { string } = {}
    for _, row in ipairs(rows or {}) do out[#out + 1] = tostring((row :: any).ancestor_id) end
    return out, nil
end

-- Strict descendants of a node, as { component_id, path }, in id order.
function M.descendants(tx: Executor, component_id: string): (Node[]?, error?)
    local rows, err = sql.builder.select("c.component_id", "c.path")
        :from(ANCESTOR .. " a")
        :inner_join(component_types.TABLES.COMPONENTS .. " c ON c.component_id = a.component_id")
        :where("a.ancestor_id = ?", component_id)
        :where("a.depth > ?", 0)
        :order_by("c.component_id ASC")
        :run_with(tx):query()
    if err then return nil, closure_failure("placement descendants failed", err) end
    return (rows or {}) :: Node[], nil
end

-- Is candidate_id the node itself or one of its descendants? Cycle guard.
function M.is_self_or_descendant(tx: Executor, component_id: string, candidate_id: string): (boolean, error?)
    local rows, err = sql.builder.select("component_id")
        :from(ANCESTOR)
        :where("component_id = ?", candidate_id)
        :where("ancestor_id = ?", component_id)
        :limit(1)
        :run_with(tx):query()
    if err then return false, closure_failure("placement cycle check failed", err) end
    return rows ~= nil and #rows > 0, nil
end

return M
