-- Component lifecycle for workflows. A workflow is a component of class `workflow`
-- (its component id IS the workflow id); the definition plane lives in the module's
-- own tables keyed by that id. create/list/delete all route through the component
-- service so identity, access grants, and deletable teardown are canonical. Access
-- checks gate the definition-plane reads/writes.

local contract = require("contract")
local security = require("security")
local hash = require("hash")
local component = require("component")
local types = require("types")
local store = require("store")
local envelope = require("envelope")
local automation = require("automation")
local workflow = require("workflow")
local schema_validate = require("schema_validate")

local M = {}
type Map = { [string]: any }
local LIST_PAGE = 25

M.ACCESS = component.ACCESS
M._get_workflow_context = function(workflow_id: string): (any?, string?)
    local read_access = tonumber(component.ACCESS.READ)
    if read_access == nil then return nil, "component READ access mask is unavailable" end
    return component.get_context(workflow_id, math.floor(read_access))
end
-- Kept injectable for location projection tests. Both calls below remain under the
-- ambient actor/scope, so a parent that is not readable cannot leak its title.
M._component_query = component.query

local function open_service(): (any?, error?)
    local actor = security.actor()
    if not actor then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "no authenticated actor" }) end
    local def, def_err = contract.get(types.COMPONENT_SERVICE)
    if def_err then return nil, errors.wrap(def_err, "component service unavailable") end
    local svc, open_err = (def :: any):with_actor(actor):with_scope(security.scope()):open()
    if open_err then return nil, errors.wrap(open_err, "component service open failed") end
    return svc, nil
end

M._open_service = open_service

local function display_title(title: any): string
    if type(title) == "string" and title ~= "" then return title end
    return "Untitled workflow"
end

local function idempotency_key(value: any): (string?, error?)
    if value == nil then return nil, nil end
    if type(value) ~= "string" then return nil, errors.new({ kind = errors.INVALID, message = "idempotency_key must be a string" }) end
    local key = (value :: string):gsub("^%s+", ""):gsub("%s+$", "")
    if key == "" then return nil, errors.new({ kind = errors.INVALID, message = "idempotency_key must not be blank" }) end
    if #key > 255 then return nil, errors.new({ kind = errors.INVALID, message = "idempotency_key must be at most 255 characters" }) end
    return key, nil
end

local function actor_id(): string?
    local actor = security.actor()
    if not actor then return nil end
    local id = actor:id()
    if type(id) == "string" and id ~= "" then return id end
    return nil
end

local function idempotent_component_id(actor: string, key: string): (string?, error?)
    local digest = ""
    local ok = pcall(function() digest = tostring(hash.sha256(actor .. "\0" .. key) or "") end)
    if not ok or not digest:match("^[0-9a-fA-F]+$") or #digest < 32 then
        return nil, errors.new({ kind = errors.INTERNAL, message = "workflow idempotency hash unavailable" })
    end

    -- Component IDs are UUIDs on PostgreSQL. Derive a stable UUID-shaped value
    -- from the actor-scoped key so retries address the same component on every
    -- supported database.
    local hex = digest:lower():sub(1, 32)
    hex = hex:sub(1, 12) .. "5" .. hex:sub(14, 16) .. "8" .. hex:sub(18)
    return table.concat({
        hex:sub(1, 8),
        hex:sub(9, 12),
        hex:sub(13, 16),
        hex:sub(17, 20),
        hex:sub(21, 32),
    }, "-"), nil
end

local function existing_idempotent_workflow(component_id: string): (any?, error?)
    local query = M._component_query or component.query
    local rows, err = query({
        component_ids = { component_id },
        impl_ids = { types.WORKFLOW_IMPL },
        include = { meta = true },
        limit = 1,
    })
    if err then return nil, errors.wrap(err, "workflow idempotency lookup failed") end
    local row = type(rows) == "table" and rows[1] or nil
    if type(row) ~= "table" or tostring((row :: Map).component_id or "") ~= component_id then return nil, nil end
    local meta = type((row :: Map).meta) == "table" and (row :: Map).meta or {}
    return { id = component_id, title = display_title((meta :: Map).title), replayed = true }, nil
end

-- Resolve immediate parents in one actor-scoped batch. Placement already lives on
-- the component tree row; this turns the parent id into display data without the
-- list's former per-workflow browse/read loop. `breadcrumb` is intentionally the
-- immediate, server-resolved location until the tree API exposes full ancestry
-- names in the same access-checked batch.
function M.enrich_locations(rows: { any }): (boolean, error?)
    local wanted: { [string]: boolean } = {}
    local parent_ids: { string } = {}
    for _, item in ipairs(rows or {}) do
        local parent_id = type((item :: any).parent_id) == "string" and (item :: any).parent_id or ""
        if parent_id ~= "" and not wanted[parent_id] then
            wanted[parent_id] = true
            parent_ids[#parent_ids + 1] = parent_id
        end
    end
    if #parent_ids == 0 then return true, nil end

    local query = M._component_query or component.query
    local parents, parent_err = query({
        component_ids = parent_ids,
        include = { meta = true },
        limit = #parent_ids,
    })
    if parent_err then return false, parent_err end

    local names: { [string]: string } = {}
    for _, parent in ipairs(parents or {}) do
        local row: any = parent
        local id = tostring(row.component_id or "")
        local meta = type(row.meta) == "table" and row.meta or {}
        local title = type(meta.title) == "string" and meta.title or ""
        if id ~= "" then names[id] = title ~= "" and title or id end
    end
    for _, item in ipairs(rows or {}) do
        local target: any = item
        local name = names[tostring(target.parent_id or "")]
        if name then
            target.parent_name = name
            target.breadcrumb = name
        end
    end
    return true, nil
end

local function enrich_rows(rows: { any }): (boolean, error?)
    if #rows == 0 then return true, nil end
    local db, db_err = store.open_db()
    if not db then return false, db_err end
    for _, item in ipairs(rows) do
        local target: any = item
        local id = tostring(target.id or "")
        if id ~= "" then
            local current, cerr = store.params_and_head(db, id)
            if cerr then db:release(); return false, cerr end
            local published, perr = store.latest_published_interface(db, id)
            if perr then db:release(); return false, perr end
            local last_run, rerr = store.latest_run_summary(db, id)
            if rerr then db:release(); return false, rerr end

            local cur = type(current) == "table" and current or {}
            local pub = type(published) == "table" and published or {}
            local iface = (cur :: any).interface
            local pub_iface = (pub :: any).interface
            local pub_version = tonumber((pub :: any).version) or nil
            local pub_def_seq = tonumber((pub :: any).def_seq) or nil
            local head_seq = tonumber((cur :: any).head_seq) or 0
            local definition_edit_seq = tonumber((cur :: any).definition_edit_seq) or 0

            target.head_seq = head_seq
            target.labels = type((cur :: any).labels) == "table" and (cur :: any).labels or {}
            target.interface = iface
            target.published_version = pub_version
            target.published_def_seq = pub_def_seq
            target.published_interface = pub_iface
            target.has_draft_changes = pub_def_seq ~= nil and definition_edit_seq > pub_def_seq
            if last_run then target.last_run = last_run end
            if target.status == nil then
                target.status = pub_version and pub_version > 0 and "published" or "draft"
            end
        end
    end
    db:release()
    return true, nil
end

-- create(title, parent_id?, idempotency_key?, source_context?) -> ({ id, title, replayed? }, err).
-- A caller-supplied key is scoped to its actor and deterministically identifies one
-- component, so duplicate POSTs replay the original draft instead of minting one.
function M.create(title: any, parent_id: any?, supplied_key: any?, source_context: any?): (any?, error?)
    local input_schema: any = nil
    if source_context ~= nil then
        local context_err = schema_validate.validate({
            type = "object", required = {"source"}, additionalProperties = false,
            properties = {
                source = {type = "string", minLength = 1},
                config = {type = "object"},
                filter = {type = "object", required = {"expr"}, additionalProperties = false,
                    properties = {expr = {type = "string", minLength = 1}}},
            },
        }, source_context, "source_context")
        if context_err then return nil, errors.new({kind = errors.INVALID, message = tostring(context_err)}) end
        local schema_err
        input_schema, schema_err = automation.source_schema(source_context.source, source_context.config or {})
        if schema_err then return nil, schema_err end
        if type(input_schema) ~= "table" or input_schema.type ~= "object" then
            return nil, errors.new({kind = errors.INVALID, message = "source must declare an object output_schema"})
        end
    end
    local key, key_err = idempotency_key(supplied_key)
    if key_err then return nil, key_err end
    local component_id: string? = nil
    if key then
        local aid = actor_id()
        if not aid then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "no authenticated actor" }) end
        local id, id_err = idempotent_component_id(aid, key)
        if id_err or not id then return nil, id_err end
        component_id = id
        local existing, existing_err = existing_idempotent_workflow(component_id)
        if existing_err then return nil, existing_err end
        if existing then return existing, nil end
    end

    local svc, err = M._open_service()
    if not svc then return nil, err end
    local name = display_title(title)
    local res, reg_err = (svc :: any):register({
        impl_id = types.WORKFLOW_IMPL,
        meta = { title = name, icon = "tabler:route" },
        private_context = {},
        parent_id = (type(parent_id) == "string" and parent_id ~= "") and parent_id or nil,
        component_id = component_id,
    })
    if reg_err or not res or (res :: any).success == false then
        if component_id then
            local existing, existing_err = existing_idempotent_workflow(component_id)
            if existing_err then return nil, existing_err end
            if existing then return existing, nil end
        end
        if reg_err then return nil, errors.wrap(reg_err, "workflow create failed") end
        local response_error = type(res) == "table" and (res :: any).error or nil
        return nil, errors.new({ kind = errors.INTERNAL, message = "workflow create failed: " .. tostring(response_error or "no response") })
    end
    if type(res) ~= "table" or not res.component_id then
        if component_id then
            local existing, existing_err = existing_idempotent_workflow(component_id)
            if existing_err then return nil, existing_err end
            if existing then return existing, nil end
        end
        return nil, errors.new({ kind = errors.INTERNAL, message = "workflow create returned no id" })
    end
    local id = tostring(res.component_id)
    if input_schema then
        local _, seed_err = workflow.apply(id, {
            {type = "node.add", body = {id = "start", kind = "start", title = "Start", config = {input_schema = input_schema}}},
            {type = "node.add", body = {id = "finish", kind = "finish", title = "Finish", config = {output_schema = {type = "object"}}}},
            {type = "layout.set-position", body = {node_id = "start", x = 240, y = 80}},
            {type = "layout.set-position", body = {node_id = "finish", x = 240, y = 340}},
        }, actor_id())
        if seed_err then return nil, seed_err end
    end
    return { id = id, title = name }, nil
end

-- list(options?) -> ({ workflow }, err). `published_only` is the picker-facing
-- projection: it is applied after the definition-plane published summary is read.
function M.list(options: any?): (any?, error?, integer?)
    local aid = actor_id()
    if not aid then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "no authenticated actor" }) end
    local query = M._component_query or component.query
    local opts: Map = type(options) == "table" and options or {}
    local limit = opts.limit == nil and LIST_PAGE or opts.limit
    local offset = opts.offset == nil and 0 or opts.offset
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 100 then
        return nil, errors.new({ kind = errors.INVALID, message = "limit must be an integer in [1,100]" })
    end
    if type(offset) ~= "number" or offset ~= math.floor(offset) or offset < 0 then
        return nil, errors.new({ kind = errors.INVALID, message = "offset must be a non-negative integer" })
    end
    local component_ids: { string } = {}
    if type(opts.id) == "string" then component_ids[#component_ids + 1] = opts.id :: string end
    local rows, err = query({
        impl_ids = { types.WORKFLOW_IMPL },
        component_ids = component_ids,
        include = { meta = true, placement = true },
        order_by = { field = "created_at", direction = "DESC" },
        limit = (limit + 1) :: integer,
        offset = offset :: integer,
    })
    if err then return nil, errors.wrap(err, "workflow list failed") end
    local batch: { any } = rows or {}
    local next_offset = #batch > limit and (offset + limit) :: integer or nil
    if #batch > limit then table.remove(batch) end
    local out: { any } = {}
    for _, row in ipairs(batch) do
        local r: any = row
        local meta = type(r.meta) == "table" and r.meta or {}
        local id = tostring(r.component_id or "")
        if id ~= "" then
            local item = {
                id = id,
                title = display_title(meta.title),
                created_at = r.created_at,
                updated_at = r.updated_at,
                node_count = 0,
                run_count = 0,
            }
            if type(r.parent_id) == "string" and r.parent_id ~= "" then
                item.parent_id = r.parent_id
            end
            out[#out + 1] = item
        end
    end

    local located, location_err = M.enrich_locations(out)
    if not located then return nil, errors.wrap(location_err :: error, "workflow location summary failed") end
    local enriched, enrich_err = enrich_rows(out)
    if not enriched then return nil, errors.wrap(enrich_err :: error, "workflow interface summary failed") end

    if type(options) == "table" and (options :: any).published_only == true then
        local published: { any } = {}
        for _, item in ipairs(out) do
            if (tonumber((item :: any).published_version) or 0) > 0 then
                published[#published + 1] = item
            end
        end
        out = published
    end

    return out, nil, next_offset
end

-- delete(workflow_id) -> (ok, err). Routes through the component service so DELETE
-- access is enforced and the deletable binding purges the definition tables.
function M.delete(workflow_id: any): (boolean, error?)
    if type(workflow_id) ~= "string" or workflow_id == "" then
        return false, (errors.new({ message = "workflow id required", kind = errors.INVALID }) :: error)
    end
    local svc, err = open_service()
    if not svc then return false, envelope.call_error(err, "workflow delete") end
    local res, del_err = (svc :: any):delete({ component_id = workflow_id })
    if del_err then return false, envelope.call_error(del_err, "workflow delete") end
    if type(res) ~= "table" then
        return false, (errors.new({ message = "workflow delete returned no result", kind = errors.INTERNAL }) :: error)
    end
    local result_err = envelope.error_of(res, "workflow delete")
    if result_err then return false, result_err end
    return true, nil
end

-- require_access(workflow_id, mask) -> err?. nil when the actor holds the access bit.
M._validate_access = component.validate_access

function M.require_access(workflow_id: any, mask: number): any?
    if type(workflow_id) ~= "string" or workflow_id == "" then return errors.new({ message = "workflow id required", kind = errors.INVALID }) end
    local _, err = M._validate_access(workflow_id, math.floor(mask))
    if err then return err end
    return nil
end

return M
