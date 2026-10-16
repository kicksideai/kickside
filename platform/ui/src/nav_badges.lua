-- Resolve declared nav badges against live component meta.
--
-- Runs at the HTTP handler layer, AFTER nav.effective() — which stays a pure
-- registry+settings merge. The component read port is INJECTED by the handler
-- (list_nav owns the ui -> component dependency), so this library stays free of a
-- component import and is unit-testable with a stub query. It issues one query for
-- all badged impl_ids, regardless of badge count.
--
-- scope=actor + cardinality=singleton means the badge resolves to the ACTOR'S OWN
-- component for a badge's impl_id. The access-filtered read may return several rows
-- (an admin can READ other users' components of the same impl_id); the actor's own
-- row is selected by matching the owner meta. Zero owned rows fails closed (the badge
-- is omitted, never an arbitrary pick). An unreadable/absent component omits the
-- badge; access is never surfaced on a nav item. A present component whose field is
-- absent keeps the badge (so the client can subscribe) with no value.

local ui_types = require("ui_types")

local M = {}

local COMPONENT_META = ui_types.BADGE.SOURCE.COMPONENT_META
local OWNER_META_KEY = ui_types.COMPONENT_OWNER_META_KEY
local SCOPE_ACTOR = ui_types.BADGE.SCOPE.ACTOR

type Row = { component_id: string, impl_id: string, meta: { [string]: any }? }

-- active_tone is selected ONLY by a truthy boolean tone_field; a count never
-- infers urgency.
local function resolve_tone(spec: ui_types.Badge, meta: { [string]: any }): string
    if spec.tone_field and spec.active_tone then
        local flag = ui_types.coerce_field_value("boolean", meta[spec.tone_field])
        if flag == true then return spec.active_tone :: string end
    end
    return spec.base_tone
end

local function row_owner(row: Row): string?
    local meta = row.meta
    if type(meta) ~= "table" then return nil end
    local owner = (meta :: { [string]: any })[OWNER_META_KEY]
    return type(owner) == "string" and owner :: string or nil
end

-- Select the one row a singleton badge resolves against. For scope=actor with a
-- known actor, this is the actor's OWN component (matched by owner meta): the
-- access-filtered read may return other users' rows, which are never picked. Without
-- an actor (e.g. the standalone nav harness) it falls back to the sole readable row.
-- Zero or ambiguous matches fail closed.
local function select_row(spec: ui_types.Badge, rows: { Row }, owner_id: string?): Row?
    if spec.scope == SCOPE_ACTOR and owner_id and owner_id ~= "" then
        local owned: Row? = nil
        for _, row in ipairs(rows) do
            if row_owner(row) == owner_id then
                if owned then return nil end
                owned = row
            end
        end
        return owned
    end
    if #rows ~= 1 then return nil end
    return rows[1]
end

local function resolve_one(spec: ui_types.Badge, rows: { Row }?, owner_id: string?): ui_types.Badge?
    if type(rows) ~= "table" then return nil end
    local row = select_row(spec, rows, owner_id)
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

-- resolve mutates items in place: each item.badge declaring source component_meta
-- is replaced with its resolved badge (value/tone/component_id) or removed when the
-- component is absent/unreadable. query_fn is the injected component read port (list_nav
-- supplies component.query); access_read is the READ access mask; owner_id is the
-- request actor's id, which scope=actor badges resolve against (their OWN component).
-- Without a read port there is nothing to resolve against, so declared badges are dropped.
function M.resolve(items: { any }, query_fn: any, access_read: integer?, owner_id: string?): ()
    local badged: { any } = {}
    local impl_seen: { [string]: boolean } = {}
    local impl_ids: { string } = {}
    for _, it in ipairs(items) do
        local b = it.badge
        if type(b) == "table" and b.source == COMPONENT_META
            and type(b.impl_id) == "string" and b.impl_id ~= "" then
            badged[#badged + 1] = it
            if not impl_seen[b.impl_id] then
                impl_seen[b.impl_id] = true
                impl_ids[#impl_ids + 1] = b.impl_id
            end
        end
    end
    if #impl_ids == 0 then return end

    if type(query_fn) ~= "function" then
        for _, it in ipairs(badged) do it.badge = nil end
        return
    end

    -- Single access-filtered read for every badged impl_id. Every declared badge is
    -- scope=actor, so when the actor is known the read is narrowed to the actor's own
    -- components by owner meta (mirroring how the inbox list scopes to the owner); the
    -- per-row owner match below still fences a widened read that ignores the filter.
    local filter: { [string]: any } = {
        impl_ids = impl_ids,
        include = { meta = true },
        access_mask = access_read,
    }
    if owner_id and owner_id ~= "" then
        filter.meta = { [OWNER_META_KEY] = owner_id }
    end
    local rows, err = query_fn(filter)
    if err or type(rows) ~= "table" then
        -- Read failed: drop declared badges rather than surface an error on the nav.
        for _, it in ipairs(badged) do it.badge = nil end
        return
    end

    local by_impl: { [string]: { Row } } = {}
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

    for _, it in ipairs(badged) do
        local spec = it.badge :: ui_types.Badge
        it.badge = resolve_one(spec, by_impl[spec.impl_id], owner_id)
    end
end

return M
