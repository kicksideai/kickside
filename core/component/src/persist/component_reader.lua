-- component_reader: a fluent, immutable query builder over the component tables.
-- Builder methods return a new reader; terminal methods (all/one/count/exists)
-- own a pooled connection for their single call, release it on every return
-- path, and return (value, error?) — errors are structured via the global errors
-- module and never raised, so callers stay in control of flow.

local sql = require("sql")
local persisted_json = require("persisted_json")
local uuid = require("uuid")
local component_query = require("component_query")
local component_types = require("component_types")
local implementation_access = require("implementation_access")
local error_envelope = require("error_envelope")

-- A reader's immutable state: include flags and filters, compiled by
-- component_query.
type ReaderState = component_query.ReaderState

-- One component row as read back. Optional fields are populated only when the
-- matching include flag is set. private_context/meta are open JSON leaves.
type ComponentResult = {
    component_id: string,
    impl_id: string,
    created_at: string,
    updated_at: string,
    private_context: { [string]: any }?,
    context_revision: integer?,
    meta: { [string]: string }?,
    access_level: integer?,
    parent_id: string?,
    position: string?,
    path: string?,
}

-- Which extra columns/joins to populate.
type IncludeOptions = {
    meta: boolean?,
    private_context: boolean?,
    access_level: boolean?,
    placement: boolean?,
}

-- ReaderState describes the stored query fields consumed by component_query;
-- Reader adds the fluent methods supplied by reader_mt.__index.
type Reader = ReaderState & {
    _copy: (Reader) -> Reader,
    with_user: (Reader, string) -> Reader,
    with_components: (Reader, ...any) -> Reader,
    with_impl_ids: (Reader, ...any) -> Reader,
    with_id_match: (Reader, string) -> (Reader?, error?),
    with_meta: (Reader, { [string]: string }?) -> Reader,
    with_text: (Reader, string) -> Reader,
    with_access_mask: (Reader, integer) -> Reader,
    with_parent: (Reader, string?) -> Reader,
    with_path_prefix: (Reader, string) -> Reader,
    include_options: (Reader, IncludeOptions) -> Reader,
    limit: (Reader, integer, integer?) -> Reader,
    order_by: (Reader, string?, string?) -> Reader,
    order_by_position: (Reader) -> Reader,
    _finalize_row: (Reader, ComponentResult) -> error?,
    all: (Reader) -> (ComponentResult[]?, error?),
    one: (Reader) -> (ComponentResult?, error?),
    count: (Reader) -> (integer?, error?),
    exists: (Reader) -> (boolean, error?),
}

local component_reader = {}
local methods = {}
local reader_mt = { __index = methods }

-- Immutable copy of a reader for the next builder step.
function methods._copy(self: Reader): Reader
    local new_instance = {}
    for k, v in pairs(self) do
        new_instance[k] = v
    end
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Normalize varargs/array args into a string list.
local function normalize_args(args: any[], arg_count: integer): string[]
    if arg_count == 1 and type(args[1]) == "table" and not getmetatable(args[1]) then
        return args[1] :: string[]
    end
    return args :: string[]
end

-- Initialize a new reader for components.
function component_reader.new(): Reader
    local instance = {
        _user_id = nil,
        _component_ids = nil,
        _no_component_match = false,
        _impl_ids = nil,
        _match_ids = "all",
        _meta_filters = nil,
        _text = nil,
        _access_mask_filter = nil,
        _parent_id = nil,
        _parent_is_null = false,
        _path_prefix = nil,
        _include_meta = true,
        _include_private_context = false,
        _include_access_level = false,
        _include_placement = false,
        _limit = nil,
        _offset = nil,
        _order_by = component_types.DEFAULTS.ORDER_BY,
        _order_direction = component_types.DEFAULTS.ORDER_DIRECTION,
        _order_by_position = false,
    }
    return setmetatable(instance, reader_mt) :: Reader
end

-- Filter by user ID (for access control).
function methods.with_user(self: Reader, user_id: string): Reader
    local new_instance = self:_copy()
    new_instance._user_id = user_id
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Filter by specific component IDs (varargs or a single array). Component ids
-- are UUIDs, so an id of any other shape names no component; a filter made only
-- of such ids matches nothing.
function methods.with_components(self: Reader, ...): Reader
    local args = { ... }
    local count = select("#", ...)
    local new_instance = self:_copy()
    local requested = normalize_args(args, count)
    local ids: string[] = {}
    for _, id in ipairs(requested) do
        if type(id) == "string" and uuid.validate(id) then ids[#ids + 1] = id end
    end
    new_instance._component_ids = ids
    new_instance._no_component_match = #requested > 0 and #ids == 0
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Filter by implementation IDs (varargs or a single array).
function methods.with_impl_ids(self: Reader, ...): Reader
    local args = { ... }
    local count = select("#", ...)
    local new_instance = self:_copy()
    new_instance._impl_ids = normalize_args(args, count)
    return setmetatable(new_instance, reader_mt) :: Reader
end

function methods.with_id_match(self: Reader, mode: string): (Reader?, error?)
    if mode ~= "all" and mode ~= "any" then
        return nil, (errors.new({ kind = errors.INVALID, message = "match_ids must be all or any" }) :: error)
    end
    local next_reader = self:_copy()
    next_reader._match_ids = mode
    return (next_reader :: Reader?), nil
end

local function no_identity_match(self: Reader): boolean
    return self._no_component_match and not (self._match_ids == "any" and self._impl_ids and #self._impl_ids > 0)
end

-- Filter by metadata key-value pairs (all must match).
function methods.with_meta(self: Reader, meta_filters: { [string]: string }?): Reader
    if not meta_filters or type(meta_filters) ~= "table" then
        return self
    end
    local new_instance = self:_copy()
    new_instance._meta_filters = meta_filters
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Filter to components whose id, implementation id, or any metadata value
-- contains text, case-insensitively.
function methods.with_text(self: Reader, text: string): Reader
    local new_instance = self:_copy()
    new_instance._text = text
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Filter by access mask (user must have at least these permissions).
function methods.with_access_mask(self: Reader, mask: integer): Reader
    local new_instance = self:_copy()
    new_instance._access_mask_filter = mask
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Filter by parent id. Pass nil to scope to root-level components.
function methods.with_parent(self: Reader, parent_id: string?): Reader
    local new_instance = self:_copy()
    if parent_id == nil then
        new_instance._parent_id = nil
        new_instance._parent_is_null = true
    else
        new_instance._parent_id = parent_id
        new_instance._parent_is_null = false
    end
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Filter to components whose stored path is the given prefix or below it. The
-- prefix must be a stored path value (sqlite materialized path or pg ltree).
function methods.with_path_prefix(self: Reader, path_prefix: string): Reader
    local new_instance = self:_copy()
    new_instance._path_prefix = path_prefix
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Configure what data to include.
function methods.include_options(self: Reader, options: IncludeOptions): Reader
    if not options or type(options) ~= "table" then
        return self
    end

    local new_instance = self:_copy()
    if options.meta ~= nil then new_instance._include_meta = options.meta end
    if options.private_context ~= nil then new_instance._include_private_context = options.private_context end
    if options.access_level ~= nil then new_instance._include_access_level = options.access_level end
    if options.placement ~= nil then new_instance._include_placement = options.placement end
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Set pagination.
function methods.limit(self: Reader, limit: integer, offset: integer?): Reader
    local new_instance = self:_copy()
    new_instance._limit = limit
    new_instance._offset = offset or 0
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Set ordering.
function methods.order_by(self: Reader, field: string?, direction: string?): Reader
    local new_instance = self:_copy()
    new_instance._order_by = field or component_types.DEFAULTS.ORDER_BY
    new_instance._order_direction = direction or component_types.DEFAULTS.ORDER_DIRECTION
    new_instance._order_by_position = false
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Order by sibling position (lexorank), then created_at for stability.
function methods.order_by_position(self: Reader): Reader
    local new_instance = self:_copy()
    new_instance._order_by_position = true
    return setmetatable(new_instance, reader_mt) :: Reader
end

-- Load metadata for components keyed by component_id.
local function load_metadata(db: any, component_ids: string[]): ({ [string]: { [string]: string } }?, error?)
    if not component_ids or #component_ids == 0 then
        return {}, nil
    end

    local meta_clause = component_query.in_clause("component_id", component_ids)
    if not meta_clause then
        return {}, nil
    end

    local meta_rows, err = sql.builder.select("component_id", "key", "value")
        :from(component_types.TABLES.META)
        :where(sql.builder.expr(unpack(meta_clause)))
        :order_by("component_id, key")
        :run_with(db):query()
    if err then
        return nil, errors.wrap(err, "failed to load component metadata")
    end

    local metadata_map: { [string]: { [string]: string } } = {}
    for _, row in ipairs(meta_rows or {}) do
        if not metadata_map[row.component_id] then
            metadata_map[row.component_id] = {}
        end
        metadata_map[row.component_id][row.key] = row.value
    end
    return metadata_map, nil
end

-- Open a pooled connection for a single terminal call.
local function get_db(): (any, error?)
    local db, err = sql.get(component_types.db_id())
    if err then return nil, errors.wrap(err, "failed to connect to database") end
    if not db then
        return nil, errors.new({message = "database connection is absent", kind = errors.UNAVAILABLE})
    end
    return db, nil
end

local function release_db(db: any, primary: error?): error?
    return error_envelope.cleanup(function(): (any, error?) return db:release() end, primary, "failed to release component reader database")
end

-- Decode private context and project the access mask into access_level.
function methods._finalize_row(self: Reader, component: ComponentResult): error?
    if self._include_private_context then
        local context, context_err = persisted_json.decode_table(component.private_context, "component.private_context", true)
        if context_err then return context_err end
        component.private_context = context :: { [string]: any }?
        component.context_revision = tonumber(component.context_revision) :: integer
    end
    local raw = component :: any
    if self._include_access_level and raw.access_mask ~= nil then
        component.access_level = raw.access_mask
        raw.access_mask = nil
    end
    return nil
end

-- Get all matching components.
function methods.all(self: Reader): (ComponentResult[]?, error?)
    if no_identity_match(self) then return {}, nil end
    local query, build_err = component_query.select(self)
    if build_err then
        return nil, build_err
    end
    local candidate_query = self._user_id and component_query.implementation_candidates(self) or nil

    local db, db_err = get_db()
    if db_err then
        return nil, db_err
    end

    if self._user_id then
        local narrowed, narrow_err = implementation_access.narrow(db, query, candidate_query)
        if narrow_err then return nil, release_db(db, narrow_err) end
        query = narrowed
    end
    local results, err = (query :: any):run_with(db):query()
    if err then
        return nil, release_db(db, errors.wrap(err, "failed to fetch components"))
    end

    local metadata_map: { [string]: { [string]: string } } = {}
    if self._include_meta and results and #results > 0 then
        local component_ids: string[] = {}
        for _, component in ipairs(results) do
            component_ids[#component_ids + 1] = component.component_id
        end
        local loaded, meta_err = load_metadata(db, component_ids)
        if meta_err then
            return nil, release_db(db, meta_err)
        end
        metadata_map = loaded or {}
    end

    local release_err = release_db(db, nil)
    if release_err then return nil, release_err end

    for _, component in ipairs(results or {}) do
        local context_err = self:_finalize_row(component :: ComponentResult)
        if context_err then return nil, context_err end
        if self._include_meta then
            component.meta = metadata_map[component.component_id] or {}
        end
    end

    return (results or {}) :: ComponentResult[], nil
end

-- Get a single component (nil, nil when none match).
function methods.one(self: Reader): (ComponentResult?, error?)
    if no_identity_match(self) then return nil, nil end
    local query, build_err = component_query.select(self)
    if build_err then
        return nil, build_err
    end
    local candidate_query = self._user_id and component_query.implementation_candidates(self) or nil

    local db, db_err = get_db()
    if db_err then
        return nil, db_err
    end

    if self._user_id then
        local narrowed, narrow_err = implementation_access.narrow(db, query, candidate_query)
        if narrow_err then return nil, release_db(db, narrow_err) end
        query = narrowed
    end
    local results, err = (query :: any):limit(1):run_with(db):query()
    if err then
        return nil, release_db(db, errors.wrap(err, "failed to fetch component"))
    end

    if not results or #results == 0 then
        return nil, release_db(db, nil)
    end

    local component = results[1]

    if self._include_meta then
        local metadata_map, meta_err = load_metadata(db, { component.component_id :: string })
        if meta_err then
            return nil, release_db(db, meta_err)
        end
        component.meta = (metadata_map or {})[component.component_id] or {}
    end

    local release_err = release_db(db, nil)
    if release_err then return nil, release_err end

    local context_err = self:_finalize_row(component :: ComponentResult)
    if context_err then return nil, context_err end
    return component :: ComponentResult, nil
end

-- Count matching components.
function methods.count(self: Reader): (integer?, error?)
    if no_identity_match(self) then return 0, nil end
    local query_builder = component_query.count(self)
    local candidate_query = self._user_id and component_query.implementation_candidates(self) or nil

    local db, db_err = get_db()
    if db_err then
        return nil, db_err
    end
    if self._user_id then
        local narrowed, narrow_err = implementation_access.narrow(db, query_builder, candidate_query)
        if narrow_err then return nil, release_db(db, narrow_err) end
        query_builder = narrowed
    end
    local results, err = query_builder:run_with(db):query()
    local primary: error? = nil
    if err then primary = errors.wrap(err, "failed to count components") end
    local final_err = release_db(db, primary)
    if final_err then return nil, final_err end

    return results[1].count :: integer, nil
end

-- Check if matching components exist.
function methods.exists(self: Reader): (boolean, error?)
    local n, err = self:count()
    if err then
        return false, err
    end
    return (n or 0) > 0, nil
end

return component_reader
