-- component_query: the SQL a component reader state compiles to: the access
-- join over the actor's typed subjects, id/impl/meta and placement filters,
-- ordering and pagination. Pure query construction; the reader executes it.

local sql = require("sql")
local security = require("security")
local access_subjects = require("access_subjects")
local component_types = require("component_types")

local M = {}

-- Include flags + filters that make up a reader's immutable state.
type ReaderState = {
    _user_id: string?,
    _component_ids: string[]?,
    _after_component_id: string?,
    _no_component_match: boolean,
    _impl_ids: string[]?,
    _match_ids: string?,
    _meta_filters: { [string]: string }?,
    _principal_owner: {kind: string, id: string}?,
    _text: string?,
    _access_mask_filter: integer?,
    _parent_id: string?,
    _parent_is_null: boolean,
    _path_prefix: string?,
    _include_meta: boolean,
    _include_principal_owner: boolean?,
    _include_private_context: boolean,
    _include_secrets: boolean?,
    _include_access_level: boolean,
    _include_placement: boolean,
    _limit: integer?,
    _offset: integer?,
    _order_by: string,
    _order_direction: string,
    _order_by_position: boolean,
}

M.ReaderState = ReaderState

local META_MATCH = "SELECT component_id FROM " .. component_types.TABLES.META .. " WHERE key = ? AND value = ?"

-- Build a parameterized IN clause as { sql_fragment, value1, value2, ... }.
local function create_in_clause(field: string, values: string[]?): any[]?
    if not values or #values == 0 then
        return nil
    end
    if #values == 1 then
        return { field .. " = ?", values[1] }
    end
    local placeholders: string[] = {}
    for i = 1, #values do
        placeholders[i] = "?"
    end
    return { field .. " IN (" .. table.concat(placeholders, ", ") .. ")", unpack(values) }
end

local function order_clause(state: ReaderState): (string?, error?)
    local field = state._order_by
    if type(field) ~= "string" or not component_types.ORDERING.FIELDS[field] then
        return nil, (errors.new({
            message = "invalid component order field: " .. tostring(field),
            kind = errors.INVALID,
        }) :: error)
    end

    local direction = state._order_direction
    if type(direction) ~= "string" or not component_types.ORDERING.DIRECTIONS[direction] then
        return nil, (errors.new({
            message = "invalid component order direction: " .. tostring(direction),
            kind = errors.INVALID,
        }) :: error)
    end

    -- component_id breaks ties so ordering and pagination are total.
    return "c." .. field .. " " .. direction .. ", c.component_id " .. direction, nil
end

-- Scope a query to components the actor can access: one aggregated row per
-- reached component carrying the effective mask (the union of the typed
-- subjects' direct grants on the component and on every ancestor). When the
-- caller scopes to specific component ids, the filter is pushed into the reach
-- rows so single-component reads stay bounded.
local function apply_access_join(query_builder: any, subjects: any, prefixes: {string}?, component_ids: string[]?,
    access_mask_filter: integer?, meta_key: string?, meta_value: string?): any
    local reach, args = access_subjects.reach_rows(subjects, component_ids)
    local metadata_join = ""
    if meta_key ~= nil then
        -- A component has at most one row per metadata key. Filter reached
        -- components before grouping without multiplying or dropping grants.
        metadata_join = " INNER JOIN (" .. META_MATCH .. ") m ON m.component_id = x.component_id"
        args[#args + 1] = meta_key
        args[#args + 1] = meta_value
    end
    local join_sql = "(SELECT x.component_id AS component_id, " .. access_subjects.EFFECTIVE_MASK
        .. " AS access_mask FROM (" .. reach .. ") x" .. metadata_join
        .. " GROUP BY x.component_id) ca ON c.component_id = ca.component_id"
    query_builder = query_builder:inner_join(join_sql, unpack(args))

    if access_mask_filter then
        query_builder = query_builder:where("(ca.access_mask & ?) = ?", access_mask_filter, access_mask_filter)
    end

    -- Optional injected narrowing: when the acting identity carries an access filter,
    -- confine results to its whitelisted subtrees. AND-ed onto the real access join, so
    -- it can only reject, never widen. An empty list is the deny-all sentinel. Per
    -- prefix the dialect matches placement: "/"-bearing -> sqlite LIKE, else pg ltree.
    if prefixes then
        if #prefixes == 0 then
            query_builder = query_builder:where("1 = 0")
        else
            local clauses: { string } = {}
            local clause_args: any[] = {}
            for _, p in ipairs(prefixes) do
                if (p :: string):find(component_types.PATH_SEPARATOR, 1, true) then
                    -- sqlite materialized path: escape LIKE metacharacters (\ % _) in the
                    -- prefix so a path label can never act as a wildcard, then ESCAPE it.
                    local esc = (p :: string):gsub("\\", "\\\\"):gsub("%%", "\\%%"):gsub("_", "\\_")
                    clauses[#clauses + 1] = "c.path LIKE ? ESCAPE '\\'"
                    clause_args[#clause_args + 1] = esc .. "%"
                else
                    clauses[#clauses + 1] = "c.path <@ ?"
                    clause_args[#clause_args + 1] = p
                end
            end
            query_builder = query_builder:where("(" .. table.concat(clauses, " OR ") .. ")", unpack(clause_args))
        end
    end

    return query_builder
end

-- Build the ACL proof for a foreign payload query. The caller supplies an
-- already observed component key and fences that binding in its statement.
-- Implementation visibility in Component listings is independent of this ACL.
function M.snapshot_access(component_id: string, mask: integer, actor: any?): (any?, error?)
    local err: error?
    if actor == nil then actor, err = security.actor() end
    if err then return nil, err end
    local user_id, id_err
    if actor then user_id, id_err = actor:id() end
    if id_err then return nil, id_err end
    if type(user_id) ~= "string" or user_id == "" then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "component access requires an actor"})
    end
    local subjects, subject_err = access_subjects.resolve(user_id, actor)
    if subject_err then return nil, subject_err end
    local prefixes, filter_err = access_subjects.access_filter(user_id, actor)
    if filter_err then return nil, filter_err end
    local query = sql.builder.select("c.component_id"):from(component_types.TABLES.COMPONENTS .. " c")
        :where("c.component_id = ?", component_id)
    return apply_access_join(query, subjects, prefixes, {component_id}, mask), nil
end

-- Apply placement filters shared by main and count queries.
local function apply_placement_filters(state: ReaderState, query_builder: any): any
    local self = state
    if self._parent_is_null then
        query_builder = query_builder:where("c.parent_id IS NULL")
    elseif self._parent_id then
        query_builder = query_builder:where("c.parent_id = ?", self._parent_id)
    end

    if self._path_prefix then
        if self._path_prefix:find(component_types.PATH_SEPARATOR, 1, true) then
            -- sqlite materialized path
            query_builder = query_builder:where("c.path LIKE ?", self._path_prefix .. "%")
        else
            -- pg ltree path label
            query_builder = query_builder:where("c.path <@ ?", self._path_prefix)
        end
    end

    return query_builder
end

-- Apply id / impl / meta / text filters shared by main and count queries.
local function apply_filters(state: ReaderState, query_builder: any, joined_meta_key: string?): any
    local self = state
    if self._after_component_id then
        query_builder = query_builder:where("c.component_id > ?", self._after_component_id)
    end
    local clauses: { string } = {}
    local args: { any } = {}
    if self._component_ids and #self._component_ids > 0 then
        local id_clause = create_in_clause("c.component_id", self._component_ids)
        if id_clause then
            clauses[#clauses + 1] = id_clause[1]
            for i = 2, #id_clause do args[#args + 1] = id_clause[i] end
        end
    end

    if self._impl_ids and #self._impl_ids > 0 then
        local impl_clause = create_in_clause("c.impl_id", self._impl_ids)
        if impl_clause then
            clauses[#clauses + 1] = impl_clause[1]
            for i = 2, #impl_clause do args[#args + 1] = impl_clause[i] end
        end
    end
    if #clauses > 0 then
        local join = self._match_ids == "any" and " OR " or " AND "
        query_builder = query_builder:where(sql.builder.expr("(" .. table.concat(clauses, join) .. ")", unpack(args)))
    end

    if self._principal_owner then
        query_builder = query_builder:where("c.owner_type = 'principal' AND c.owner_kind = ? AND c.owner_id = ? AND c.owner_incarnation IS NULL",
            self._principal_owner.kind, self._principal_owner.id)
    end

    if self._meta_filters then
        for key, value in pairs(self._meta_filters) do
            if key ~= joined_meta_key then
                query_builder = query_builder:where(sql.builder.expr("c.component_id IN (" .. META_MATCH .. ")", key, value))
            end
        end
    end

    if self._text then
        local escaped = string.lower(self._text):gsub("[\\%%_]", "\\%0")
        local pattern = "%" .. escaped .. "%"
        query_builder = query_builder:where(sql.builder.expr(
            "(LOWER(CAST(c.component_id AS TEXT)) LIKE ? ESCAPE '\\' OR LOWER(c.impl_id) LIKE ? ESCAPE '\\'"
                .. " OR c.component_id IN (SELECT component_id FROM " .. component_types.TABLES.META
                .. " WHERE LOWER(value) LIKE ? ESCAPE '\\'))",
            pattern, pattern, pattern
        ))
    end

    return apply_placement_filters(self, query_builder)
end

local function access_component_ids(state: ReaderState): { string }?
    if state._match_ids == "any" and state._impl_ids and #state._impl_ids > 0 then return nil end
    return state._component_ids
end

-- Build the shared access and filter portion of component reads. Callers add
-- projection, ordering, or aggregation after this point.
local function filtered_query(state: ReaderState, fields: { string }): any
    local query_builder = sql.builder.select(unpack(fields)):from(component_types.TABLES.COMPONENTS .. " c")
    local meta_key: string? = nil
    if state._user_id then
        local subjects = access_subjects.resolve(state._user_id)
        local prefixes = access_subjects.access_filter(state._user_id)
        local meta_value: string?
        -- One metadata join lets the index scope the grant aggregation without
        -- growing the join list with the number of caller-supplied filters.
        if state._meta_filters then meta_key, meta_value = next(state._meta_filters) end
        query_builder = apply_access_join(query_builder, subjects, prefixes, access_component_ids(state),
            state._access_mask_filter, meta_key, meta_value)
    end
    return apply_filters(state, query_builder, meta_key)
end

M.filtered_query = filtered_query

-- select(state) -> the main SELECT for a reader state.
function M.select(state: ReaderState): (any?, error?)
    local select_fields = { "c.component_id", "c.impl_id", "c.created_at", "c.updated_at", "c.deleting_at", "c.delete_intent" }

    if state._include_principal_owner then
        table.insert(select_fields, "CASE WHEN c.owner_type='principal' THEN c.owner_kind END AS owner_kind")
        table.insert(select_fields, "CASE WHEN c.owner_type='principal' THEN c.owner_id END AS owner_id")
    end
    if state._include_private_context then
        table.insert(select_fields, "c.private_context")
        table.insert(select_fields, "c.encrypted_secrets")
        table.insert(select_fields, "c.secrets_generation")
        table.insert(select_fields, "c.secrets_incarnation")
        table.insert(select_fields, "c.context_revision")
    end
    if state._include_placement then
        table.insert(select_fields, "c.parent_id")
        table.insert(select_fields, "c.position")
        table.insert(select_fields, "c.path")
    end
    if state._include_access_level and state._user_id then
        table.insert(select_fields, "ca.access_mask")
    end

    local query_builder = filtered_query(state, select_fields)

    if state._order_by_position then
        query_builder = query_builder:order_by("c.position ASC")
        query_builder = query_builder:order_by("c.created_at ASC")
        query_builder = query_builder:order_by("c.component_id ASC")
    else
        local order_sql, order_err = order_clause(state)
        if order_err then
            return nil, order_err
        end
        query_builder = query_builder:order_by(order_sql :: string)
    end

    if state._limit then
        query_builder = query_builder:limit(state._limit)
        if state._offset and state._offset > 0 then
            query_builder = query_builder:offset(state._offset)
        end
    end

    return query_builder, nil
end

M.in_clause = create_in_clause

-- implementation_candidates(state) selects only implementation ids reachable
-- through the same grants and filters as a reader, before ordering/pagination.
function M.implementation_candidates(state: ReaderState): any
    return filtered_query(state, { "DISTINCT c.impl_id" })
end

-- count(state) -> the COUNT query for a reader state.
function M.count(state: ReaderState): any
    return filtered_query(state, { "COUNT(DISTINCT c.component_id) as count" })
end

return M
