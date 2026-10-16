-- Automation state reads: installed and runtime listings, public state,
-- private state and config.

local automation_types = require("types")
local support = require("engine_support")
local errors = require("errors")
local schema = require("engine_schema")

type Map = { [string]: any }

local part = {}

-- attach(M, dependencies, P) defines this part's engine functions on M; P
-- carries the private helpers the engine parts share.
function part.attach(M: any, dependencies: any, P: any): ()
    local execution_identity = dependencies.execution_identity
    local AUTOMATION_TYPE = support.AUTOMATION_TYPE
    local EXECUTION_IDENTITY_KEY = support.EXECUTION_IDENTITY_KEY
    local automation_error = support.automation_error
    local PORTABLE_INPUT_KEY = support.PORTABLE_INPUT_KEY
    local copy_private_state = support.copy_private_state
    local pagination_int = support.pagination_int
    local strip_reserved_state = support.strip_reserved_state
    local project_public_state = schema.project_public_state

    function M.list_installed(opts: automation_types.ListInstalledOptions?): ({automation_types.InstalledAutomation}?, any)
        opts = opts or {}
        local limit, limit_err = pagination_int(opts.limit, "limit")
        if limit_err then return nil, limit_err end
        local offset, offset_err = pagination_int(opts.offset, "offset")
        if offset_err then return nil, offset_err end

        local component = dependencies.component :: automation_types.ComponentModule
        local registry = dependencies.registry :: automation_types.RegistryModule

        -- Read every umbrella by binding impl id (any class). Only a caller's
        -- explicit class narrows the query; umbrellas whose class isn't the
        -- literal "automation" (e.g. knowledge) stay listed otherwise.
        local impl_ids, impl_err = P.automation_binding_ids()
        if impl_err or not impl_ids then return nil, impl_err end
        local owned_ids, owned_err = P.owned_automation_ids()
        if owned_err or not owned_ids then return nil, owned_err end
        if #impl_ids == 0 and #owned_ids == 0 then return {}, nil end

        local parent_id = type(opts.parent_id) == "string" and opts.parent_id ~= "" and opts.parent_id or nil
        -- Install stores one scalar meta.class, so a class filter is an exact
        -- meta match inside the query and pages stay exact.
        local meta_filter = type(opts.class) == "string" and opts.class ~= "" and { class = opts.class } or nil

        -- Actor-scoped read goes through the access-filtered read-port; the no-actor
        -- path is a trusted system listing (e.g. background reconciliation).
        local rows: any, rows_err: any
        if type(opts.actor_id) == "string" and opts.actor_id ~= "" then
            rows, rows_err = component.query({
                actor_id = opts.actor_id,
                impl_ids = impl_ids,
                component_ids = owned_ids,
                match_ids = "any",
                parent_id = parent_id,
                meta = meta_filter,
                include = { meta = true, access = true, placement = true },
                order_by = { field = "created_at", direction = "DESC" },
                limit = limit,
                offset = offset,
            })
        else
            rows, rows_err = component.list_system({
                impl_ids = impl_ids,
                component_ids = owned_ids,
                match_ids = "any",
                parent_id = parent_id,
                meta = meta_filter,
                include = { meta = true, placement = true },
                order_by = { field = "created_at", direction = "DESC" },
                limit = limit,
                offset = offset,
            })
        end
        if rows_err or type(rows) ~= "table" then
            return nil, rows_err or automation_error("the automation listing returned no rows", errors.INTERNAL)
        end
        local components = rows :: { automation_types.ComponentRow }
        -- Per-impl_id public_state_schema cache: every component of one type shares
        -- the same schema, so it is resolved once, not per row. A cache value of
        -- false marks a type that declares no schema (distinct from "not yet looked
        -- up") so that too is memoized. The materialized public_state already lives
        -- in c.meta (include = meta above) -- projecting it is pure, no extra query.
        local schema_cache: { [string]: any } = {}
        local out: {automation_types.InstalledAutomation} = {}
        for _, c in ipairs(components) do
            local meta_t: Map = c.meta or {}
            local entry: automation_types.InstalledAutomation = {
                id           = c.component_id,
                type         = c.impl_id,
                title        = meta_t.title or "",
                owner_id     = meta_t.owner,
                is_owner     = opts.actor_id ~= nil and meta_t.owner == opts.actor_id,
                icon         = meta_t.icon or "",
                description  = meta_t.comment or "",
                class        = meta_t.class :: automation_types.ClassValue?,
                created_at   = c.created_at,
                updated_at   = c.updated_at,
                access_level = c.access_level or 0,
                parent_id    = c.parent_id,
            }
            local impl_id = c.impl_id
            if type(impl_id) == "string" and impl_id ~= "" then
                local cached = schema_cache[impl_id]
                if cached == nil then
                    local resolved, schema_err = P.public_state_schema_for_impl(registry, impl_id)
                    cached = { schema = resolved }
                    if schema_err then
                        local details = type(schema_err) == "userdata" and schema_err:details() or nil
                        if errors.is(schema_err, errors.UNAVAILABLE) and type(details) == "table"
                            and details.reason == "type_unavailable" then
                            cached.availability = { code = "unavailable", message = tostring(schema_err), details = details }
                        else
                            return nil, schema_err
                        end
                    end
                    schema_cache[impl_id] = cached
                end
                entry.availability = cached.availability
                if cached.schema ~= nil then
                    local projected, projection_err = project_public_state(cached.schema, meta_t)
                    if projection_err then return nil, projection_err end
                    if projected then entry.public_state = projected :: Map end
                end
            end
            out[#out + 1] = entry
        end
        -- Each row carries the drive status its status action answers, read for
        -- the whole page at once.
        local ids: { string } = {}
        for _, entry in ipairs(out) do ids[#ids + 1] = tostring(entry.id) end
        local statuses, status_err = P.drive_statuses(ids)
        if status_err or not statuses then return nil, status_err end
        for _, entry in ipairs(out) do entry.drive_status = (statuses :: Map)[tostring(entry.id)] end
        return out, nil
    end

    -- M.list_runtime enumerates installed automations with their engine-owned
    -- execution identity, for event-driven runtimes (gateway hubs/workers) that must
    -- run an automation as its installer. opts:
    --   { type_ids?, type_meta?, class?, limit?, offset?, include_state?, actor_id? }
    -- type_ids selects exact binding ids; type_meta selects them by binding meta
    -- (e.g. { provider = "discord" }); neither => all automation types.
    -- actor_id scopes the read through the access filter; omit for a trusted system
    -- read (a gateway hub). This is THE authority a hub asks -- not component meta
    -- queries, not raw private_context reads.
    function M.list_runtime(opts: any): ({automation_types.RuntimeAutomation}?, any)
        opts = type(opts) == "table" and opts or {}
        local component = dependencies.component :: automation_types.ComponentModule

        local impl_ids: {string}?, impl_err: any = nil, nil
        if type(opts.type_ids) == "table" and #(opts.type_ids :: {string}) > 0 then
            impl_ids = opts.type_ids :: {string}
        elseif type(opts.type_meta) == "table" then
            impl_ids, impl_err = P.binding_ids_by_meta(opts.type_meta)
        else
            impl_ids, impl_err = P.automation_binding_ids()
        end
        if impl_err or not impl_ids then return nil, impl_err end
        if #impl_ids == 0 then return {}, nil end

        local limit, limit_err = pagination_int(opts.limit, "limit")
        if limit_err then return nil, limit_err end
        local offset, offset_err = pagination_int(opts.offset, "offset")
        if offset_err then return nil, offset_err end

        local listed: any, listed_err: any
        if type(opts.actor_id) == "string" and opts.actor_id ~= "" then
            listed, listed_err = component.query({
                actor_id = opts.actor_id, impl_ids = impl_ids, include = { meta = true },
                order_by = { field = "created_at", direction = "DESC" }, limit = limit, offset = offset,
            })
        else
            listed, listed_err = component.list_system({
                impl_ids = impl_ids, include = { meta = true },
                order_by = { field = "created_at", direction = "DESC" }, limit = limit, offset = offset,
            })
        end
        if listed_err or type(listed) ~= "table" then
            return nil, listed_err or automation_error("the automation listing returned no rows", errors.INTERNAL)
        end
        local rows = listed :: { automation_types.ComponentRow }

        local include_state = opts.include_state == true
        local out: {automation_types.RuntimeAutomation} = {}
        for _, c in ipairs(rows) do
            local meta_t: Map = c.meta or {}
            if M.class_matches(meta_t.class, opts.class) then
                local ctx, ctx_err = component.get_private_context(c.component_id)
                if ctx_err then return nil, ctx_err end
                local identity: any = nil
                local state: any = nil
                if type(ctx) == "table" then
                    identity = (ctx :: Map)[EXECUTION_IDENTITY_KEY]
                    if include_state then state = strip_reserved_state(ctx) end
                end
                out[#out + 1] = ({
                    id = c.component_id,
                    type = c.impl_id,
                    metadata = meta_t,
                    execution_identity = identity,
                    state = state,
                } :: automation_types.RuntimeAutomation)
            end
        end
        if opts.include_drive_status == true then
            local ids: { string } = {}
            for _, item in ipairs(out) do ids[#ids + 1] = item.id end
            local statuses, status_err = P.drive_statuses(ids)
            if status_err or not statuses then return nil, status_err end
            for _, item in ipairs(out) do item.drive_status = statuses[item.id] end
        end
        return out, nil
    end

    -- M.get_runtime returns one installed automation by component id with its type,
    -- execution identity, and optional state.
    -- A component read failure answers its own typed error (infrastructure
    -- stays retriable); an automation that does not exist answers NOT_FOUND.
    function M.get_runtime(opts: any): (automation_types.RuntimeAutomation?, any)
        opts = type(opts) == "table" and opts or {}
        local id = opts.id
        if type(id) ~= "string" or id == "" then return nil, support.automation_error("automation id is required", errors.INVALID) end
        local component = dependencies.component :: automation_types.ComponentModule
        local listed, list_err = component.list_system({
            component_ids = { id :: string },
            include = { meta = true },
        })
        if list_err then return nil, list_err end
        local row = ((listed or {}) :: { automation_types.ComponentRow })[1]
        local function not_found(): error
            return (errors.new({ message = "automation " .. tostring(id) .. " not found", kind = errors.NOT_FOUND,
                retryable = false, details = { error_kind = "declaration" } }) :: error)
        end
        if not row or type(row.impl_id) ~= "string" or row.impl_id == "" then return nil, not_found() end
        local ctx, ctx_err = component.get_private_context(id :: string)
        if ctx_err then return nil, ctx_err end
        if type(ctx) ~= "table" then return nil, not_found() end
        local state: any = nil
        if opts.include_state == true then state = strip_reserved_state(ctx) end
        local drive_status: Map? = nil
        if opts.include_drive_status == true then
            local statuses, status_err = P.drive_statuses({ id :: string })
            if status_err or not statuses then return nil, status_err end
            drive_status = statuses[id :: string]
        end
        return ({
            id = id :: string,
            type = row.impl_id,
            metadata = row.meta or {},
            execution_identity = (ctx :: Map)[EXECUTION_IDENTITY_KEY],
            state = state,
            drive_status = drive_status,
        } :: automation_types.RuntimeAutomation), nil
    end

    -- read_public_state is the frontend-safe public state helper.
    -- The storage plane is component public meta: schema fields are normal meta keys
    -- so list/render/realtime all read one public component surface; private runtime
    -- state stays in private_context.
    function M.read_public_state(component_id: string): (Map?, error?)
        if type(component_id) ~= "string" or component_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "id is required" }) end
        local component = dependencies.component :: automation_types.ComponentModule
        local registry = dependencies.registry :: automation_types.RegistryModule
        local schema, row, schema_err = P.public_state_component(component, registry, component_id, component.ACCESS.READ)
        if schema_err then return nil, schema_err end
        local projected, project_err = project_public_state(schema, row and row.meta or {})
        if project_err then return nil, project_err end
        local out: Map
        if projected then
            out = (projected :: Map)
        else
            out = {}
        end
        return (out :: Map), nil
    end

    -- read_state / patch_state are runtime helpers for automation code that owns
    -- private durable state. Frontend APIs should use the public-state helpers.
    function M.read_state(component_id: string, required_access: integer?): (automation_types.AutomationPrivateContext?, error?)
        if type(component_id) ~= "string" or component_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "id is required" }) end
        local component = dependencies.component :: automation_types.ComponentModule
        local access = required_access or component.ACCESS.READ
        local ctx, err = component.get_context(component_id, access)
        if err then return nil, err end
        return copy_private_state(ctx, true), nil
    end

    -- read_config returns the FULL editable install config a reconfigurable type
    -- stores as its own private state (code/tool_ids/trigger/…) so an editor can
    -- repopulate the create view on re-open. READ-gated and limited to types that
    -- declare meta.reconfigurable, so only opt-in types expose their private config;
    -- the live component title overlays state.title so a prior rename survives edit.
    -- An exportable type also carries its verbatim install declaration under
    -- PORTABLE_INPUT_KEY: the create view speaks that shape, and it is the same
    -- declaration export_artifact ships, so an editor never reconstructs it from
    -- normalized state.
    function M.read_config(component_id: string): (Map?, error?)
        if type(component_id) ~= "string" or component_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "id is required" }) end
        local registry = dependencies.registry :: automation_types.RegistryModule
        local component = dependencies.component :: automation_types.ComponentModule

        local rows, query_err = component.query({
            component_ids = { component_id },
            include = { meta = true },
            access_mask = component.ACCESS.READ,
        })
        if query_err then return nil, query_err end
        local row = rows and rows[1]
        if not row or type(row.impl_id) ~= "string" or row.impl_id == "" then return nil, errors.new({ message = "automation not found", kind = errors.NOT_FOUND }) end

        local raw_entry, get_err = registry.get(row.impl_id :: string)
        local entry = raw_entry :: automation_types.RegistryEntry?
        if get_err or not entry or entry.kind ~= "contract.binding" then return nil, errors.new({ kind = errors.NOT_FOUND, message = "automation type not found" }) end
        local meta: Map = entry.meta or {}
        if meta.type ~= AUTOMATION_TYPE then return nil, errors.new({ kind = errors.INTERNAL, message = "binding is not an automation type" }) end
        if meta.reconfigurable ~= true then return nil, errors.new({ message = "automation type does not support reconfigure", kind = errors.INVALID }) end

        local raw_state, state_err = component.get_context(component_id, component.ACCESS.READ)
        if state_err then return nil, state_err end
        if type(raw_state) ~= "table" then return nil, errors.new({ kind = errors.NOT_FOUND, message = "automation not found" }) end
        local context = raw_state :: Map
        local out: Map = copy_private_state(context, true) :: Map
        local live_title = row.meta and (row.meta :: Map).title
        if type(live_title) == "string" and live_title ~= "" then out.title = live_title end

        if meta.exportable == true and type(context[PORTABLE_INPUT_KEY]) == "table" then
            local portable: Map = {}
            for key, value in pairs(context[PORTABLE_INPUT_KEY] :: Map) do portable[key] = value end
            if type(live_title) == "string" and live_title ~= "" then portable.title = live_title end
            out[PORTABLE_INPUT_KEY] = portable
        end
        return out, nil
    end
end

return part
