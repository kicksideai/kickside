-- Resolve declared nav badges against live component meta.
--
-- Runs at the HTTP handler layer, AFTER nav.effective() — which stays a pure
-- registry+settings merge. The component read port is INJECTED by the handler
-- (list_nav owns the ui -> component dependency), so this library stays free of a
-- component import. Provisioned actor singletons are read by their exact addresses
-- in one batch. Other badges use one protected principal-owner query. Both reads
-- are access filtered, and a present component without the field keeps the badge
-- with no value so the client can subscribe.

local ui_types = require("ui_types")

local M = {}

local COMPONENT_META = ui_types.BADGE.SOURCE.COMPONENT_META
local SCOPE_ACTOR = ui_types.BADGE.SCOPE.ACTOR

type Row = { component_id: string, impl_id: string, principal_owner: string?, meta: { [string]: any }? }

-- active_tone is selected ONLY by a truthy boolean tone_field; a count never
-- infers urgency.
local function resolve_tone(spec: ui_types.Badge, meta: { [string]: any }): string
    if spec.tone_field and spec.active_tone then
        local flag = ui_types.coerce_field_value("boolean", meta[spec.tone_field])
        if flag == true then return spec.active_tone :: string end
    end
    return spec.base_tone
end

local function select_row(rows: { Row }?, actor_id: string?, singleton_id: string?): Row?
    local selected: Row? = nil
    for _, row in ipairs(rows or {}) do
        if (singleton_id and row.component_id == singleton_id)
            or (not singleton_id and (not actor_id or row.principal_owner == actor_id)) then
            if selected then return nil end
            selected = row
        end
    end
    return selected
end

local function resolve_one(spec: ui_types.Badge, row: Row?): ui_types.Badge?
    if not row then return nil end
    local meta = (type(row.meta) == "table" and row.meta) or {}

    local value: number? = nil
    local raw = meta[spec.field]
    if raw ~= nil then
        local coerced = ui_types.coerce_field_value(spec.field_type, raw)
        if type(coerced) == "number" then value = coerced :: number end
    end

    return {
        source = spec.source,
        impl_id = spec.impl_id,
        scope = spec.scope,
        cardinality = spec.cardinality,
        field = spec.field,
        field_type = spec.field_type,
        style = spec.style,
        hide_zero = spec.hide_zero,
        tone = resolve_tone(spec, meta),
        base_tone = spec.base_tone,
        active_tone = spec.active_tone,
        tone_field = spec.tone_field,
        value = value,
        component_id = row.component_id,
    }
end

local function query_by_impl(query_fn: any, filter: { [string]: any }): { [string]: { Row } }
    local by_impl: { [string]: { Row } } = {}
    local rows, err = query_fn(filter)
    if err or type(rows) ~= "table" then return by_impl end
    for _, row in ipairs(rows :: { Row }) do
        local iid = row.impl_id
        if type(iid) == "string" then
            local bucket = by_impl[iid]
            if not bucket then
                bucket = {}
                by_impl[iid] = bucket
            end
            bucket[#bucket + 1] = row
        end
    end
    return by_impl
end

-- resolve mutates items in place: each item.badge declaring source component_meta
-- is replaced with its resolved badge (value/tone/component_id) or removed when the
-- component is absent or unreadable.
function M.resolve(items: { any }, query_fn: any, access_read: integer?, actor_id: string?,
    singleton_id_for_impl: ((string, string) -> string?)?): ()
    local badged: { any } = {}
    local addresses: { [string]: string? } = {}
    local seen: { [string]: boolean } = {}
    local component_ids: { string } = {}
    local owned_impl_ids: { string } = {}
    local actor = actor_id ~= "" and actor_id or nil
    for _, it in ipairs(items) do
        local b = it.badge
        if type(b) == "table" and b.source == COMPONENT_META
            and type(b.impl_id) == "string" and b.impl_id ~= "" then
            badged[#badged + 1] = it
            if not seen[b.impl_id] then
                seen[b.impl_id] = true
                local id = actor and singleton_id_for_impl and singleton_id_for_impl(b.impl_id, actor)
                if id then
                    addresses[b.impl_id] = id
                    component_ids[#component_ids + 1] = id
                else
                    owned_impl_ids[#owned_impl_ids + 1] = b.impl_id
                end
            end
        end
    end
    if #badged == 0 then return end

    if type(query_fn) ~= "function" then
        for _, it in ipairs(badged) do it.badge = nil end
        return
    end

    local exact_rows: { [string]: { Row } } = {}
    if #component_ids > 0 then
        exact_rows = query_by_impl(query_fn, {
            component_ids = component_ids,
            include = { meta = true },
            access_mask = access_read,
        })
    end
    local owned_rows: { [string]: { Row } } = {}
    if #owned_impl_ids > 0 then
        owned_rows = query_by_impl(query_fn, {
            impl_ids = owned_impl_ids,
            include = { meta = true, principal_owner = true },
            access_mask = access_read,
            principal_owner = actor,
        })
    end

    for _, it in ipairs(badged) do
        local spec = it.badge :: ui_types.Badge
        local id = addresses[spec.impl_id]
        local rows = (id and exact_rows or owned_rows)[spec.impl_id]
        local owner = spec.scope == SCOPE_ACTOR and actor or nil
        it.badge = resolve_one(spec, select_row(rows, owner, id))
    end
end

return M
