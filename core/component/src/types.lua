-- Shared type surface for kickside.component.
-- Private context and external contract instances are intentionally open at the
-- edge; persisted/public component rows and service envelopes are stable.

local registry = require("registry")

local M = {}

M.DB_CONFIG = "kickside.component:db_config"

-- Resolve the same requirement-injected resource used by the migrations. Keeping
-- the value in a registry entry makes namespace dependency remapping authoritative
-- for both schema setup and every runtime read/write.
function M.db_id(): string
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string
end

-- Backing tables (created by the module's migrations).
M.TABLES = {
    COMPONENTS = "kickside_components",
    META = "kickside_component_meta",
    ACCESS = "kickside_component_access",
    ANCESTOR = "kickside_component_ancestor",
}

-- Reserved metadata key recording a component's owner (the creating user).
M.OWNER_META_KEY = "owner"

-- A framework maintenance actor is never a principal (IDENTITY-1 §1), so it
-- owns a component it creates only while its frame holds this action on the
-- component's impl_id. A dispatcher of work that has not bound its owner's
-- execution identity denies it, so that work cannot leave a component no
-- principal manages.
M.MAINTENANCE_OWN_ACTION = "component.own.maintenance"

-- An instance operator adopts a component no principal holds access to: the
-- frame must hold this action on AUTHZ.COMPONENTS_RESOURCE.
M.ADOPT_ACTION = "component.adopt"

-- Component meta is public render/read-model state. Private config, credentials,
-- and deferred execution identity live in private_context or owner tables.
M.FORBIDDEN_PUBLIC_META_KEYS = {
    config = true,
    private_context = true,
    context = true,
    secret = true,
    secrets = true,
    secret_config = true,
    credential = true,
    credentials = true,
    token = true,
    tokens = true,
    access_token = true,
    refresh_token = true,
    id_token = true,
    api_key = true,
    password = true,
    auth = true,
    authorization = true,
    actor_id = true,
    actor_context = true,
    run_actor_id = true,
    execution_identity = true,
    _execution_identity = true,
}

M.ACCESS = {
    NONE = 0,
    READ = 1,
    WRITE = 2,
    DELETE = 4,
    ADMIN = 8,

    READ_WRITE = 3,
    READ_DELETE = 5,
    WRITE_DELETE = 6,
    FULL = 15,
}

-- Typed grant subjects (IDENTITY-1 §5).
M.SUBJECT_TYPES = {
    USER = "user",
    GROUP = "group",
    SERVICE = "service",
}

M.CONTRACTS = {
    SERVICE = "kickside.component:component_service",
    LIFECYCLE = "kickside.component:lifecycle",
}

M.METHODS = {
    QUERY_COMPONENTS = "query_components",
    COUNT_COMPONENTS = "count_components",
}

M.AUTHZ = {
    LIST_ALL = "list_all",
    COMPONENTS_RESOURCE = "kickside.component:components",
}

M.SCOPES = {
    ALL = "all",
}

M.COMMAND_TYPES = {
    CREATE_COMPONENT = "CREATE_COMPONENT",
    DELETE_COMPONENT = "DELETE_COMPONENT",
    SET_CONTEXT = "SET_CONTEXT",
    PATCH_CONTEXT = "PATCH_CONTEXT",
    SET_META = "SET_META",
    GRANT_ACCESS = "GRANT_ACCESS",
    REVOKE_ACCESS = "REVOKE_ACCESS",
    SET_PLACEMENT = "SET_PLACEMENT",
}

M.DEFAULTS = {
    ACCESS_MASK = 15,
    ORDER_BY = "created_at",
    ORDER_DIRECTION = "DESC",
    LIMIT = 50,
}

M.ORDERING = {
    FIELDS = {
        component_id = true,
        impl_id = true,
        created_at = true,
        updated_at = true,
    },
    DIRECTIONS = {
        ASC = true,
        DESC = true,
    },
}

M.PAGINATION = {
    MIN_LIMIT = 1,
    MAX_LIMIT = 100,
    DEFAULT_LIMIT = 50,
    MIN_OFFSET = 0,
    DEFAULT_OFFSET = 0,
}

M.LEXORANK = {
    ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz",
}

M.PATH_SEPARATOR = "/"

type JsonMap = { [string]: any }
type MetadataMap = { [string]: string }

-- Runtime contract proxies are method sets provided by Wippy's contract layer.
type ContractInstance = any
type ServiceInstance = any

type IncludeOptions = {
    meta: boolean?,
    private_context: boolean?,
    access_level: boolean?,
    placement: boolean?,
}

type ComponentRow = {
    component_id: string,
    impl_id: string,
    created_at: string,
    updated_at: string,
    private_context: JsonMap?,
    context_revision: integer?,
    meta: MetadataMap?,
    access_level: integer?,
    parent_id: string?,
    position: string?,
    path: string?,
}

type AccessContextResult = {
    id: string?,
    component_id: string?,
    context: JsonMap?,
    context_included: boolean?,
    context_revision: integer?,
    access_level: integer?,
    impl_id: string?,
    success: boolean?,
    error: string?,
}

type QueryInclude = {
    meta: boolean?,
    private_context: boolean?,
    access: boolean?,
    placement: boolean?,
}

type QueryOrder = {
    field: string?,
    direction: string?,
}

type QueryFilter = {
    component_ids: string[]?,
    impl_ids: string[]?,
    match_ids: string?,
    meta: MetadataMap | boolean?,
    text: string?,
    parent_id: string?,
    path_prefix: string?,
    include: QueryInclude?,
    order_by: string | QueryOrder?,
    limit: integer?,
    offset: integer?,
    access_mask: integer?,
    actor_id: string?,
    scope: string?,
}

type AccessGrant = {
    subject_id: string,
    subject_type: string?,
    access_mask: integer,
    owner: boolean?,
}

type UpdateOptions = {
    expected_revision: integer?,
}

type ServiceEnvelope = {
    success: boolean?,
    error: string?,
    kind: string?,
    retryable: boolean?,
    details: { [string]: any }?,
}

type UpdateResult = {
    component_id: string,
    changes_made: boolean,
    context_revision: integer,
    results: { any },
}

type Command = {
    type: string,
    payload: JsonMap?,
}

type CommandResult = JsonMap

type SubtreeResult = {
    root_component_id: string,
    affected: integer,
    changes_made: boolean,
}

M.JsonMap = JsonMap
M.MetadataMap = MetadataMap
M.ContractInstance = ContractInstance
M.ServiceInstance = ServiceInstance
M.IncludeOptions = IncludeOptions
M.ComponentRow = ComponentRow
M.AccessContextResult = AccessContextResult
M.QueryInclude = QueryInclude
M.QueryOrder = QueryOrder
M.QueryFilter = QueryFilter
M.AccessGrant = AccessGrant
M.ServiceEnvelope = ServiceEnvelope
M.UpdateResult = UpdateResult
M.UpdateOptions = UpdateOptions
M.Command = Command
M.CommandResult = CommandResult
M.SubtreeResult = SubtreeResult

return M
