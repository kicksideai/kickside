-- autoinit: idempotent provisioning of scoped components a module declares it wants
-- to exist automatically -- the per-user "workspace" pieces (inbox, uploads, ...) and
-- per-system singletons. A module ships ONE component-kind binding -- a
-- `contract.binding` whose meta carries a `provision` block -- that fully describes
-- the kind: its class, the lifecycle handlers (projections) it self-wires, and its
-- retention strategy. The same binding IS the component kind, so a provisioned
-- component and its declaration are one entry, never parallel. Creating the component
-- therefore brings its whole behavior with it -- the handlers and retention ride the
-- declaration, so there is no out-of-band wiring or external cleanup to maintain.
--
-- The component id is deterministic per (scope_key, class) so ensure CONVERGES: it is
-- safe to run on every login (the relay's per-user hub calls it) without ever creating
-- duplicates. The caller supplies a component_service already bound to the actor (the
-- relay binds the user's actor + scope; tests bind a scoped runner), so provisioned
-- components are owned by that actor through the normal access path.

local registry = require("registry")
local crypto = require("crypto")

local M = {}

-- A component kind is a contract.binding; the ones a module wants auto-provisioned
-- carry a `meta.provision` block. declarations() discovers kinds by this kind +
-- the presence of that block, so there is no separate registry type to maintain.
M.BINDING_KIND = "contract.binding"

-- Provisioning scopes. user => one per actor (provisioned on login). system => one
-- global singleton (provisioned at install). The default is user.
M.SCOPE = { USER = "user", SYSTEM = "system" }
M.PROJECTION_ON = { THREAD = "thread", LIFECYCLE = "lifecycle", CHILD_LIFECYCLE = "child.lifecycle" }

-- Fixed scope_key for system singletons: every system-scope component derives its
-- deterministic id from this constant, so ensure_system resolves the same singleton on
-- every boot regardless of which actor runs the provisioner.
M.SYSTEM_SCOPE_KEY = "system"

-- HMAC namespace for the deterministic component id.
local ID_NS = "kickside.autoinit"

-- An event shape a kind declares: the event type, an optional JSON schema for its
-- body, and the backing `via`. Input shapes are SINKS -- "write this shape to act on
-- the component" -- which automations target; output shapes are SOURCES automations
-- subscribe/pull. `via` is the backing URI (scheme://target?context): `thread`
-- (default, the component's own event log), `func://<entry_id>` (a function backs it),
-- or `contract://<contract_id>` (a contract method backs it). It is stored verbatim;
-- the endpoint resolver parses scheme/target/context at dispatch time.
type EventShape = {
    type: string,
    schema: { [string]: any }?,
    via: string,
}

-- Default backing when an event shape omits `via`: the component's own thread.
local DEFAULT_VIA = "thread"

type EventContract = {
    input: { EventShape },
    output: { EventShape },
}

-- A projection binding a kind self-wires. Only kind + worker_ref are required;
-- every other knob is optional and falls to the projection engine's clamped default
-- when omitted (projection_key/cursor_key -> KEY_DEFAULT, debounce -> zero).
-- worker_config is passed by reference
-- from the registry entry into the register call.
type ProjectionBinding = {
    kind: string,
    worker_ref: string,
    on: string?,
    cursor_key: string?,
    projection_key: string?,
    input_mode: string?,
    debounce_idle_ms: integer?,
    debounce_max_ms: integer?,
    worker_config: { [string]: any }?,
    events: EventContract?,
}

-- The retention strategy for a kind's thread. drain_aware floors event sweeps at the
-- slowest bound cursor so a lagging handler never loses unread events.
type Retention = {
    event_days: integer?,
    drain_aware: boolean?,
}

-- A declared additional access grant applied to the provisioned component beyond the
-- owner's implicit FULL. subject_id is a user/group/service id; subject_type is always
-- required (user, group or service) and is never defaulted: a grant that omits it
-- fails closed at the grant seam instead of silently becoming another kind's grant.
-- access_mask is the independent-bit mask (READ=1, WRITE=2, DELETE=4, ADMIN=8);
-- a WRITE-only grant lets a subject append to the thread without READ, so list_events
-- returns nothing to them.
type Grant = {
    subject_id: string,
    subject_type: string?,
    access_mask: integer,
}

-- A component-kind declaration -- everything a module's kind binding ships to make a
-- scoped component exist and carry its own lifecycle handlers, retention, and event
-- contract.
type Declaration = {
    impl_id: string,
    class: string,
    scope: string,
    title: string?,
    icon: string?,
    projections: { ProjectionBinding },
    retention: Retention?,
    events: EventContract,
    grants: { Grant },
}

-- component_id derives the stable id for a scoped component of a class. scope_key is
-- the actor id (user scope) or a fixed system key. Same inputs always resolve to the
-- same id, which is what makes ensure idempotent across logins.
function M.component_id(scope_key: string, class: string): string
    local hex = crypto.hmac.sha256(ID_NS, scope_key .. ":" .. class)
    return string.format(
        "%s-%s-%s-%s-%s",
        hex:sub(1, 8), hex:sub(9, 12), "5" .. hex:sub(14, 16), hex:sub(17, 20), hex:sub(21, 32)
    )
end

local function opt_str(v: any): string?
    return type(v) == "string" and (v :: string) or nil
end

local function opt_int(v: any): integer?
    return type(v) == "number" and (math.floor(v :: number) :: integer) or nil
end

local parse_events: (any) -> EventContract

local function parse_projections(raw: any): { ProjectionBinding }
    if type(raw) ~= "table" then return {} end
    local out: { ProjectionBinding } = table.create(#(raw :: { any }), 0)
    for _, p in ipairs(raw :: { any }) do
        local entry = p :: { [string]: any }
        if type(entry.kind) == "string" and type(entry.worker_ref) == "string" then
            out[#out + 1] = {
                kind = entry.kind :: string,
                worker_ref = entry.worker_ref :: string,
                on = opt_str(entry.on),
                cursor_key = opt_str(entry.cursor_key),
                projection_key = opt_str(entry.projection_key),
                input_mode = opt_str(entry.input_mode),
                debounce_idle_ms = opt_int(entry.debounce_idle_ms),
                debounce_max_ms = opt_int(entry.debounce_max_ms),
                worker_config = type(entry.worker_config) == "table" and (entry.worker_config :: { [string]: any }) or nil,
                events = type(entry.events) == "table" and parse_events(entry.events) or nil,
            }
        end
    end
    return out
end

local function parse_grants(raw: any): { Grant }
    if type(raw) ~= "table" then return {} end
    local out: { Grant } = table.create(#(raw :: { any }), 0)
    for _, g in ipairs(raw :: { any }) do
        local entry = g :: { [string]: any }
        local subject_id = entry.subject_id
        local access_mask = entry.access_mask
        if type(subject_id) == "string" and subject_id ~= "" and type(access_mask) == "number" then
            out[#out + 1] = {
                subject_id = subject_id :: string,
                subject_type = type(entry.subject_type) == "string" and (entry.subject_type :: string) or nil,
                access_mask = math.floor(access_mask :: number) :: integer,
            }
        end
    end
    return out
end

local function parse_retention(raw: any): Retention?
    if type(raw) ~= "table" then return nil end
    local entry = raw :: { [string]: any }
    return {
        event_days = type(entry.event_days) == "number" and math.floor(entry.event_days :: number) or nil,
        drain_aware = entry.drain_aware == true or nil,
    }
end

local function parse_event_shapes(raw: any): { EventShape }
    if type(raw) ~= "table" then return {} end
    local out: { EventShape } = table.create(#(raw :: { any }), 0)
    for _, e in ipairs(raw :: { any }) do
        local entry = e :: { [string]: any }
        if type(entry.type) == "string" and entry.type ~= "" then
            out[#out + 1] = {
                type = entry.type :: string,
                schema = type(entry.schema) == "table" and (entry.schema :: { [string]: any }) or nil,
                via = (type(entry.via) == "string" and entry.via ~= "") and (entry.via :: string) or DEFAULT_VIA,
            }
        end
    end
    return out
end

function parse_events(raw: any): EventContract
    local entry = type(raw) == "table" and (raw :: { [string]: any }) or {}
    return {
        input = parse_event_shapes(entry.input),
        output = parse_event_shapes(entry.output),
    }
end

-- first_class reads the kind's class. A component kind declares class as an array
-- (meta.class: [<class>]); the first entry is the provisioned class.
local function first_class(raw: any): string?
    if type(raw) == "table" then
        local v = (raw :: { any })[1]
        if type(v) == "string" and v ~= "" then return v :: string end
        return nil
    end
    if type(raw) == "string" and raw ~= "" then return raw :: string end
    return nil
end

M.first_class = first_class

-- declarations reads and validates the component-kind bindings that carry a
-- meta.provision block into typed records. A binding with no class or no provision
-- block is an ordinary kind (or contract), not an autoinit kind, and is skipped.
function M.declarations(): { Declaration }
    local entries = registry.find({ [".kind"] = M.BINDING_KIND }) or {}
    local out: { Declaration } = table.create(#(entries :: { any }), 0)
    for _, entry in ipairs(entries :: { any }) do
        local meta = (type((entry :: any).meta) == "table" and (entry :: any).meta or {}) :: { [string]: any }
        local provision = meta.provision
        local class = first_class(meta.class)
        if type(provision) == "table" and class ~= nil then
            local prov = provision :: { [string]: any }
            local scope = (prov.scope == M.SCOPE.SYSTEM) and M.SCOPE.SYSTEM or M.SCOPE.USER
            out[#out + 1] = {
                impl_id = tostring((entry :: any).id or ""),
                class = class :: string,
                scope = scope,
                title = type(meta.title) == "string" and (meta.title :: string) or nil,
                icon = type(meta.icon) == "string" and (meta.icon :: string) or nil,
                projections = parse_projections(meta.projections),
                retention = parse_retention(meta.retention),
                events = parse_events(meta.events),
                grants = parse_grants(prov.grants),
            }
        end
    end
    return out
end

-- projections_for_impl returns the projections a component kind declares, read
-- DIRECTLY off the kind binding the component was registered as (impl_id) -- no
-- separate declaration entry, no thread_class lookup. This is the seam the thread
-- engine uses to AUTO-APPLY a kind's declared projections when a component of that
-- kind is created: read the one binding, register what it declares. A component
-- with no impl_id, or a kind that declares none, yields {} (a plain thread, no read
-- model). Covers every kind uniformly -- provisioned (inbox) and on-demand (skills,
-- research, schemas) -- since they all carry their declaration on their own binding.
function M.projections_for_impl(impl_id: string): { ProjectionBinding }
    if type(impl_id) ~= "string" or impl_id == "" then return {} end
    local entry = registry.get(impl_id)
    if not entry then return {} end
    local meta = (type((entry :: any).meta) == "table" and (entry :: any).meta or {}) :: { [string]: any }
    if type(meta.projections) ~= "table" then return {} end
    return parse_projections(meta.projections)
end

-- parse_thread reads a binding meta.thread declaration: the kind's primary-thread
-- class, the one fact the substrate cannot invent. nil when the kind declares no
-- primary thread.
local function parse_thread(declared: any): { [string]: any }?
    if type(declared) ~= "table" then return nil end
    local class = (declared :: { [string]: any }).class
    if type(class) ~= "string" or class == "" then return nil end
    return { class = class }
end

-- thread_for_impl returns the primary-thread declaration a component kind carries
-- on its binding or descriptor (meta.thread), read off the same seam as projections, so creation
-- and convergence read one truth.
function M.thread_for_impl(impl_id: string): ({ [string]: any }?, error?)
    if type(impl_id) ~= "string" or impl_id == "" then return nil end
    local entry, lookup_err = registry.get(impl_id)
    if lookup_err then return nil, lookup_err end
    if not entry then return nil end
    local meta = (type((entry :: any).meta) == "table" and (entry :: any).meta or {}) :: { [string]: any }
    return parse_thread(meta.thread), nil
end

-- declared_kinds returns every binding or descriptor that declares a primary thread or
-- projections — the kind set a convergence pass walks. class is nil for a kind
-- that declares projections without a primary thread (its threads are created by
-- other flows; convergence can register projections but never invent a class).
-- component_impl_id names the stored component binding; impl_id names the
-- declaration to apply. Unfiltered by meta.provision: on-demand kinds own threads too.
function M.declared_kinds(): { { [string]: any } }
    local out: { { [string]: any } } = {}
    local entries = registry.find({ [".kind"] = "contract.binding" }) or {}
    -- Engine descriptors carry the primary-thread declaration while meta.impl_id
    -- names the binding stored on their components. Keep both identities so the
    -- convergence scan finds those components and applies the owning declaration.
    for _, entry in ipairs((registry.find({ [".kind"] = "registry.entry" }) or {}) :: { any }) do
        entries[#entries + 1] = entry
    end
    for _, entry in ipairs(entries :: { any }) do
        local id = tostring((entry :: any).id or "")
        local meta = (type((entry :: any).meta) == "table" and (entry :: any).meta or {}) :: { [string]: any }
        local declared = parse_thread(meta.thread)
        local projections = type(meta.projections) == "table" and parse_projections(meta.projections) or {}
        if id ~= "" and (declared or #projections > 0) then
            out[#out + 1] = {
                impl_id = id,
                component_impl_id = type(meta.impl_id) == "string" and meta.impl_id ~= "" and meta.impl_id or id,
                class = declared and (declared :: { [string]: any }).class or nil,
                projections = projections,
            }
        end
    end
    return out
end

-- retention_for_impl returns the retention a component kind declares, read off the
-- impl_id binding -- the same seam as projections, so the engine applies a kind's
-- declared retention on create (not just the default). nil when the binding declares
-- none (the thread keeps the engine default).
function M.retention_for_impl(impl_id: string): Retention?
    if type(impl_id) ~= "string" or impl_id == "" then return nil end
    local entry = registry.get(impl_id)
    if not entry then return nil end
    local meta = (type((entry :: any).meta) == "table" and (entry :: any).meta or {}) :: { [string]: any }
    return parse_retention(meta.retention)
end

-- Materializing a declaration into a real component + thread + projections + retention
-- lives in kickside.core.threads:provision, which can reach the threads + projections
-- contracts. This library stays pure (declaration parsing + deterministic id) so it
-- carries no thread dependency and can be imported anywhere.

return M
