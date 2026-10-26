-- Shared type surfaces for the generic automation engine. Dynamic provider
-- payloads stay `any`, but stable envelopes returned by automations_lib are
-- exported here so API wrappers and provider installers can share one contract.

local registry = require("registry")

local M = {}

M.DB_CONFIG = "kickside.automation:db_config"

type Map = { [string]: any }

type ModuleRef = any
type ContractInstance = { [string]: any }
type ErrorValue = any

type RollbackStep = {
    target: string,
    args: Map?,
}

type RollbackChain = { RollbackStep }


type InstallRecorder = {
    rollback: (string, Map?) -> (),
}

type CreatedResource = Map

-- The main drive's source an install declares (A22).
type MainSource = {
    source_kind: string,
    source_ref: string?,
    source_thread_id: string?,
    wake_key: string?,
    event_type: string?,
    start: string?,
    config: Map?,
    schedule: { type: string, expression: string }?,
}

type InstallBodyResult = {
    state: Map,
    metadata: Map?,
    public_state: Map?,
    created: { CreatedResource }?,
    source: MainSource?,
}

type InstallBody = (InstallRecorder) -> (InstallBodyResult?, any?)

type InstallResult = {
    state: Map,
    metadata: Map,
    public_state: Map?,
    created: { CreatedResource }?,
    source: MainSource?,
    rollback: { RollbackStep },
}

type ReplayOptions = {
    options: Map?,
}

type LifecycleMethods = { [string]: boolean }

type BindingMethods = { [string]: string }

type BindingContract = {
    contract: string?,
    methods: BindingMethods?,
}

type RegistryEntry = {
    id: string,
    kind: string?,
    meta: Map?,
    data: {
        contracts: { BindingContract }?,
    }?,
}

type AutomationControl = {
    name: string,
    request_id_required: boolean?,
    keys_required: boolean?,
}

type AutomationAction = {
    name: string,
    contract: string,
    target: string,
}

type ViewComponent = {
    id: string,
    name: string,
    title: string,
    tag_name: string,
    base_path: string,
    entry_point: string,
    url: string,
}

type OwnedResourceSpec = {
    kind: string,
    state_key: string,
}

type ClassValue = string | { string }

type AutomationType = {
    id: string,
    name: string,
    title: string,
    description: string,
    icon: string,
    category: string,
    class: ClassValue?,
    primary: boolean,
    installable: boolean,
    reconfigurable: boolean?,
    exportable: boolean?,
    inputs: Map?,
    component: Map?,
    source: Map?,
    public_state_schema: Map?,
    delete_options: Map?,
    actions: { AutomationAction },
    controls: { AutomationControl },
}

type ListTypesOptions = {
    class: string?,
    category: string?,
}

type ComponentRow = {
    component_id: string,
    impl_id: string,
    parent_id: string?,
    created_at: any?,
    updated_at: any?,
    meta: Map?,
    private_context: Map?,
    access_level: integer?,
}

type RegistryModule = {
    find: (Map) -> ({ RegistryEntry }?, ErrorValue?),
    get: (string) -> (RegistryEntry?, ErrorValue?),
}

type FuncExecutor = {
    call: (FuncExecutor, string, Map) -> (any, ErrorValue?),
}

type FuncsModule = {
    new: () -> (FuncExecutor?, ErrorValue?),
}

type AccessMasks = {
    NONE: integer,
    READ: integer,
    WRITE: integer,
    DELETE: integer,
    ADMIN: integer,
    FULL: integer,
}

function M.db_id(): string
    local entry, err = registry.get(M.DB_CONFIG)
    if err then error(err) end
    return entry.meta.db_id :: string
end

type ComponentRegistrationResult = {
    component_id: string?,
}

type ComponentAccessContext = {
    impl_id: string?,
}

type ComponentDeleteResult = {
    success: boolean?,
    error: ErrorValue?,
}

type ComponentUpdateResult = {
    success: boolean?,
    error: ErrorValue?,
}

type ComponentService = {
    register: (ComponentService, Map) -> (ComponentRegistrationResult?, ErrorValue?),
    get_access_context: (ComponentService, Map) -> (ComponentAccessContext?, ErrorValue?),
    update: (ComponentService, Map) -> (ComponentUpdateResult?, ErrorValue?),
    delete: (ComponentService, Map) -> (ComponentDeleteResult?, ErrorValue?),
}

type ComponentModule = {
    query: (Map) -> ({ ComponentRow }?, ErrorValue?),
    list_system: (Map) -> ({ ComponentRow }?, ErrorValue?),
    get_context: (string, integer) -> (AutomationPrivateContext?, ErrorValue?),
    get_private_context: (string) -> (AutomationPrivateContext?, ErrorValue?),
    get_identity_receipt: ((string) -> (Map?, ErrorValue?))?,
    component_owner: (string) -> (string?, ErrorValue?),
    validate_access: (string, integer) -> (any?, ErrorValue?),
    get_service: () -> (ComponentService?, ErrorValue?),
    open: (string, integer, string) -> (ContractInstance?, ErrorValue?),
    notify_access: ((string, string?, Map?, Map?) -> (Map?, ErrorValue?))?,
    set_meta: (string, Map, Map?) -> (boolean, ErrorValue?),
    update: (string, { any }, Map?) -> (ComponentUpdateResult?, ErrorValue?),
    ACCESS: AccessMasks,
}

type LoggerInstance = {
    warn: (LoggerInstance, string, Map?) -> (),
}

type InstalledAutomation = {
    owner_id: string?,
    is_owner: boolean,
    id: string,
    type: string,
    title: string,
    icon: string,
    description: string,
    class: ClassValue?,
    created_at: any,
    updated_at: any,
    access_level: integer,
    parent_id: string?,
    public_state: Map?,
    drive_status: Map?,
    availability: Map?,
}

type ListInstalledOptions = {
    actor_id: string?,
    class: string?,
    parent_id: string?,
    limit: number?,
    offset: number?,
}

type InstallTypeResult = {
    id: string,
    type: string,
    metadata: Map,
    created: { CreatedResource }?,
    drives: { string },
}

-- The v2 execution identity (IDENTITY-1) the component stores under
-- _execution_identity; kickside.execution:execution_identity owns its shape.
type ExecutionIdentity = {
    version: number,
    principal: { kind: string, id: string },
    authorized_by: { kind: string, id: string },
    component_id: string?,
    credential_id: string?,
    link_id: string?,
    captured_at: string,
}

type AutomationPrivateContext = Map & {
    _rollback: { RollbackStep }?,
    _execution_identity: ExecutionIdentity?,
}

type RuntimeAutomation = {
    id: string,
    type: string,
    metadata: Map,
    execution_identity: ExecutionIdentity?,
    state: Map?,
    drive_status: Map?,
}

type UninstallResult = {
    id: string,
    replayed: integer,
    replay_failed: integer,
    discarded: Map?,
    status: string?,
    in_progress: boolean?,
    deleted: boolean?,
    cleanup_pending: boolean?,
    retryable: boolean?,
    kind: string?,
    details: Map?,
}

type CallActionResult = {
    id: string,
    method: string,
    result: any,
}

type PatchStateOptions = {
    public_meta: Map?,
}

M.AUTOMATION_TYPE = "kickside.automation"
M.LIFECYCLE_METHODS = {
    install = true,
    delete = true,
} :: LifecycleMethods

M.Map = Map
M.ModuleRef = ModuleRef
M.ContractInstance = ContractInstance
M.ErrorValue = ErrorValue
M.RollbackStep = RollbackStep
M.RollbackChain = RollbackChain
M.InstallRecorder = InstallRecorder
M.CreatedResource = CreatedResource
M.InstallBodyResult = InstallBodyResult
M.InstallBody = InstallBody
M.InstallResult = InstallResult
M.ReplayOptions = ReplayOptions
M.LifecycleMethods = LifecycleMethods
M.BindingMethods = BindingMethods
M.BindingContract = BindingContract
M.RegistryEntry = RegistryEntry
M.AutomationAction = AutomationAction
M.AutomationControl = AutomationControl
M.ViewComponent = ViewComponent
M.OwnedResourceSpec = OwnedResourceSpec
M.ClassValue = ClassValue
M.AutomationType = AutomationType
M.ListTypesOptions = ListTypesOptions
M.ComponentRow = ComponentRow
M.RegistryModule = RegistryModule
M.FuncExecutor = FuncExecutor
M.FuncsModule = FuncsModule
M.AccessMasks = AccessMasks
M.ComponentRegistrationResult = ComponentRegistrationResult
M.ComponentAccessContext = ComponentAccessContext
M.ComponentDeleteResult = ComponentDeleteResult
M.ComponentUpdateResult = ComponentUpdateResult
M.ComponentService = ComponentService
M.ComponentModule = ComponentModule
M.LoggerInstance = LoggerInstance
M.InstalledAutomation = InstalledAutomation
M.ListInstalledOptions = ListInstalledOptions
M.InstallTypeResult = InstallTypeResult
M.AutomationPrivateContext = AutomationPrivateContext
M.ExecutionIdentity = ExecutionIdentity
M.RuntimeAutomation = RuntimeAutomation
M.UninstallResult = UninstallResult
M.CallActionResult = CallActionResult
M.PatchStateOptions = PatchStateOptions

return M
