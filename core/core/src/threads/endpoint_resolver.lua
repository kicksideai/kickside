-- endpoint_resolver: dispatch a component-kind event ENDPOINT to its backing.
--
-- A component KIND declares event endpoints in meta.events.input/output.
-- Each
-- endpoint carries a `via` URI naming its backing. M.write dispatches an INPUT
-- endpoint (a sink) by writing to the backing; M.read dispatches an OUTPUT
-- endpoint (a source) by pulling a page from the backing. Both resolve the same
-- `via` schemes:
--
--   thread                              the component's own event log (default)
--   func://<entry_id>?k=v&...           a plain function backs it
--   contract://<contract_id>[@<bind>]?k=v&...  a contract method backs it
--
-- `thread` is shorthand for thread://{self}. The query-string carries DOMAIN
-- context only -- the contract's context_required params (e.g. component_id,
-- kb_id) -- never identity. The resolver substitutes the placeholder {self}
-- (the owning component id) into both target and context, then dispatches.
--
-- The acting actor + scope are inherited AMBIENTLY: opening the contract / calling
-- the function under the current security frame propagates security.actor() /
-- security.scope() automatically (and across a process boundary the actor
-- transitions with its scope). The resolver therefore plumbs no identity -- only
-- the domain context the backing declares it requires.

local M = {}

local function invalid(message: string, code: string): error
    return errors.new({kind = errors.INVALID, message = message, retryable = false,
        details = {code = code}})
end

local function backing_failure(err: error?, message: string): error
    if err then return errors.wrap(err, message) end
    return errors.new({kind = errors.INTERNAL, message = message, retryable = false,
        details = {code = "endpoint_backing_missing"}})
end

-- funcs/contract are resolved per dispatch through this seam so a test can inject a
-- stub (M._modules.funcs / .contract) without a live backing; production resolves
-- the real module via require.
M._modules = {} :: { [string]: any }

local function mod(name: string): any
    local override = M._modules[name]
    if override ~= nil then return override end
    return require(name)
end

-- Canonical threads contract + the append seam an endpoint's thread backing writes
-- through. write = append the event to the component's own thread.
local THREADS_CONTRACT = "kickside.core:threads"

M.SCHEME = { THREAD = "thread", FUNC = "func", CONTRACT = "contract" }

-- url_decode resolves percent-escapes and '+' in a query-string token.
local function url_decode(s: string): string
    s = s:gsub("+", " ")
    s = s:gsub("%%(%x%x)", function(hex: string): string
        return string.char(math.floor(tonumber(hex, 16) :: number) :: integer)
    end)
    return s
end

-- substitute replaces the placeholder {self} with the owning component id. Unknown
-- placeholders pass through literally -- a backing may declare context the resolver
-- does not own.
local function substitute(value: string, self_id: string): string
    return (value:gsub("{self}", self_id))
end

-- parse_query splits a query-string into a context table, url-decoding and
-- substituting {self} in each value. Empty / nil query yields an empty table.
local function parse_query(query: string?, self_id: string): { [string]: any }
    local out: { [string]: any } = {}
    if type(query) ~= "string" or query == "" then return out end
    for pair in (query :: string):gmatch("[^&]+") do
        local key, value = pair:match("^([^=]+)=?(.*)$")
        if type(key) == "string" and key ~= "" then
            out[url_decode(key)] = substitute(url_decode(value or ""), self_id)
        end
    end
    return out
end

-- owning_component_id reads the id the endpoint binds to. Accepts a component id
-- string or a component row / descriptor carrying component_id|id.
local function owning_component_id(owning: any): string?
    if type(owning) == "string" and owning ~= "" then return owning :: string end
    if type(owning) == "table" then
        local row = owning :: { [string]: any }
        local id = row.component_id or row.id
        if type(id) == "string" and id ~= "" then return id :: string end
    end
    return nil
end

-- resolve parses an endpoint's `via` into { scheme, target, context } with {self}
-- substituted to the owning component id. `thread` (or empty) resolves to
-- thread://{self}. A `contract://` target may carry an @<binding> suffix, split off
-- into `binding`. Returns (descriptor, err).
function M.resolve(endpoint: any, owning: any): (any?, error?)
    local self_id = owning_component_id(owning)
    if not self_id then return nil, invalid("endpoint resolver: owning component id is required", "endpoint_owner_required") end

    local via = (type(endpoint) == "table" and type((endpoint :: any).via) == "string")
        and ((endpoint :: any).via :: string) or "thread"

    -- `thread` shorthand: the component's own event log.
    if via == "" or via == M.SCHEME.THREAD then
        return { scheme = M.SCHEME.THREAD, target = self_id :: string, binding = nil, context = {} }, nil
    end

    local scheme, rest = via:match("^(%a[%w]*)://(.*)$")
    if not scheme then
        -- A bare target with no scheme is the component's own thread under that key.
        if via == M.SCHEME.THREAD then
            return { scheme = M.SCHEME.THREAD, target = self_id :: string, binding = nil, context = {} }, nil
        end
        return nil, invalid("endpoint resolver: malformed via '" .. via .. "'", "endpoint_via_invalid")
    end

    local target_part, query = (rest :: string):match("^([^?]*)%??(.*)$")
    local target = substitute(target_part or "", self_id :: string)
    if target == "" and scheme == M.SCHEME.THREAD then target = self_id :: string end

    -- A contract target may name a specific binding via target@binding.
    local binding: string? = nil
    if scheme == M.SCHEME.CONTRACT then
        local c, b = target:match("^([^@]+)@(.+)$")
        if c then target = c; binding = b end
    end

    return {
        scheme = scheme :: string,
        target = target,
        binding = binding,
        context = parse_query(query, self_id :: string),
    }, nil
end

local function call_func(target: string, context: { [string]: any }, body: any): (any?, error?)
    local executor, err = mod("funcs").new()
    if err or not executor then return nil, backing_failure(err, "funcs.new failed") end
    local result, call_err = executor:with_context(context):call(target, body)
    if call_err then return nil, call_err end
    return result, nil
end

local function call_contract(method: string, contract_id: string, binding: string?,
    context: { [string]: any }?, body: any): (any?, error?)
    local def, def_err = mod("contract").get(contract_id)
    if def_err or not def then return nil, backing_failure(def_err, "contract unavailable") end
    if context then def = def:with_context(context) end
    local instance, open_err
    if type(binding) == "string" and binding ~= "" then
        instance, open_err = def:open(binding)
    else
        instance, open_err = def:open()
    end
    if open_err or not instance then return nil, backing_failure(open_err, "open contract failed") end
    local result, call_err = instance[method](instance, body)
    if call_err then return nil, call_err end
    return result, nil
end

-- write dispatches an INPUT endpoint (a sink): act on the component by writing
-- `body` to the endpoint's backing. owning is the component id (or row) the
-- endpoint belongs to. Returns (result, err).
function M.write(endpoint: any, body: any, owning: any): (any?, error?)
    local descriptor, resolve_err = M.resolve(endpoint, owning)
    if resolve_err or not descriptor then return nil, resolve_err end
    local d = descriptor :: { scheme: string, target: string, binding: string?, context: { [string]: any } }

    if d.scheme == M.SCHEME.THREAD then
        local event_type = type(endpoint) == "table" and (endpoint :: any).type or nil
        if type(event_type) ~= "string" or event_type == "" then
            return nil, invalid("endpoint resolver: thread endpoint requires an event type", "endpoint_event_type_required")
        end
        return call_contract("append_event", THREADS_CONTRACT, nil, nil,
            {thread_id = d.target, type = event_type, body = body})
    elseif d.scheme == M.SCHEME.FUNC then
        return call_func(d.target, d.context, body)
    elseif d.scheme == M.SCHEME.CONTRACT then
        return call_contract("write", d.target, d.binding, d.context, body)
    end
    return nil, invalid("endpoint resolver: unsupported via scheme '" .. d.scheme .. "'", "endpoint_scheme_unsupported")
end

-- ─── read/pull side (the dual of write) ────────────────────────────────
-- An OUTPUT endpoint (a source) is read by pulling a page on schedule. The READ
-- backing is the dual of the WRITE backing:
--   func://<entry>?<ctx>       call the function with the pull request body.
--   contract://<id>[@<bind>]?<ctx>  open the contract/binding and call :pull.
--   thread                     the component's event stream (TRIGGERED, phase 2b
--                              — not subscribed here).
-- `body` is the pull request ({ cursor, config, limit }); the function/contract
-- reads the domain context the same way the write side does.

-- read dispatches an OUTPUT endpoint (a source): pull a page from the endpoint's
-- backing. `body` is the pull request ({ cursor, config, limit }). owning is the
-- component id (or row) the endpoint belongs to. A `thread` source is TRIGGERED
-- (phase 2b): not subscribed here, signalled by (nil, scheme error) so the caller
-- can skip it without crashing the poll loop. Returns (page, err).
function M.read(endpoint: any, body: any, owning: any): (any?, error?)
    local descriptor, resolve_err = M.resolve(endpoint, owning)
    if resolve_err or not descriptor then return nil, resolve_err end
    local d = descriptor :: { scheme: string, target: string, binding: string?, context: { [string]: any } }

    if d.scheme == M.SCHEME.FUNC then
        return call_func(d.target, d.context, body)
    elseif d.scheme == M.SCHEME.CONTRACT then
        return call_contract("pull", d.target, d.binding, d.context, body)
    elseif d.scheme == M.SCHEME.THREAD then
        return nil, invalid("endpoint resolver: thread sources are event-driven, not pulled", "endpoint_source_event_driven")
    end
    return nil, invalid("endpoint resolver: unsupported via scheme '" .. d.scheme .. "'", "endpoint_scheme_unsupported")
end

return M
