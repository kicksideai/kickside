local ui_types = require("ui_types")
local nav = require("nav")
local error_envelope = require("error_envelope")

local M = {}

type Binding = { id: string, priority: number }
type Attempt = { id: string, future: any?, response: any?, start_error: any?, cancel_error: any?, resolved: boolean?, result: any?, result_error: any? }
type Collected = {
    items: { nav.Item },
    categories: { nav.CategorySpec },
    dropped: { [string]: number },
    diagnostics: { { provider: string, code: string } },
}

local function by_priority(bindings: { Binding }): { Binding }
    local out: { Binding } = {}
    for _, b in ipairs(bindings) do
        out[#out + 1] = { id = tostring(b.id or ""), priority = tonumber(b.priority) or 0 }
    end
    table.sort(out, function(a: Binding, b: Binding): boolean
        -- The registry binding is the canonical source of declarations. Pin it
        -- ahead of arbitrary extension priorities: otherwise a provider could set
        -- priority > 1000 and win first-wins route/path de-duplication.
        local a_registry = a.id == ui_types.CONTRACT.REGISTRY_NAV_PROVIDER_BINDING
        local b_registry = b.id == ui_types.CONTRACT.REGISTRY_NAV_PROVIDER_BINDING
        if a_registry ~= b_registry then return a_registry end
        if a.priority ~= b.priority then return a.priority > b.priority end
        return a.id < b.id
    end)
    return out
end

local function count_dropped(dropped: { [string]: number }, binding_id: string, n: integer): ()
    if n <= 0 then return end
    dropped[binding_id] = (dropped[binding_id] or 0) + n
end

local function take_items(out: { nav.Item }, raw_items: any, binding_id: string): integer
    if type(raw_items) ~= "table" then return 0 end
    local cap = ui_types.NAV_LIMITS.ITEMS_PER_PROVIDER
    local taken = 0
    local dropped = 0
    for _, raw in ipairs(raw_items :: { any }) do
        if taken >= cap then
            dropped = dropped + 1
        else
            local source = binding_id == ui_types.CONTRACT.REGISTRY_NAV_PROVIDER_BINDING
                and "declared" or "provider"
            local item = nav.normalize_provided(raw, binding_id, source)
            if item then
                out[#out + 1] = item
                taken = taken + 1
            else
                dropped = dropped + 1
            end
        end
    end
    return dropped
end

local function take_categories(out: { nav.CategorySpec }, raw_cats: any, binding_id: string): integer
    if type(raw_cats) ~= "table" then return 0 end
    local cap = ui_types.NAV_LIMITS.CATEGORIES_PER_PROVIDER
    local taken = 0
    local dropped = 0
    for _, raw in ipairs(raw_cats :: { any }) do
        if taken >= cap then
            dropped = dropped + 1
        else
            local spec = nav.normalize_category(raw)
            if spec then
                out[#out + 1] = spec
                taken = taken + 1
            else
                dropped = dropped + 1
            end
        end
    end
    return dropped
end

-- Start all calls through the contract's native async method, then apply their
-- results in deterministic binding order. A future owns the underlying invocation:
-- the deadline cancels unresolved futures instead of leaving a waiting coroutine
-- behind after the request returns.
local function call_all(port: any, bindings: { Binding }, args: any): ({ [integer]: Attempt }?, any?)
    local attempts: { [integer]: Attempt } = {}
    local timeout_ms = ui_types.NAV_LIMITS.PROVIDER_TIMEOUT_MS
    local cases: { any } = {}
    local active = 0

    for index, binding in ipairs(bindings) do
        local id = binding.id
        local call_args: { [string]: any } = {}
        for k, v in pairs(type(args) == "table" and args or {}) do call_args[k] = v end
        call_args.timeout_ms = timeout_ms
        attempts[index] = { id = id }

        -- The contract edge can raise before it returns a Future. Retain the
        -- original failure and cancel all already-started work before returning it.
        local started, future, start_err = pcall(port.start, id, call_args, timeout_ms)
        if not started then
            attempts[index].start_error = future
        elseif future == nil then
            attempts[index].start_error = start_err or errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = "nav provider did not start", details = {code = "nav_provider_start"}})
        else
            -- Retain a started Future before inspecting its response channel: a
            -- malformed/raising response() must still be cancelled during cleanup.
            attempts[index].future = future
            local response_ok, response = pcall(function() return (future :: any):response() end)
            if not response_ok or response == nil then
                attempts[index].start_error = response or errors.new({kind = errors.UNAVAILABLE, retryable = true,
                    message = "nav provider response unavailable", details = {code = "nav_provider_response_channel"}})
            else
                local case_ok, receive_case = pcall(function() return (response :: any):case_receive() end)
                if not case_ok then
                    attempts[index].start_error = receive_case
                else
                    attempts[index].response = response
                    cases[#cases + 1] = receive_case
                    active = active + 1
                end
            end
        end
    end

    local deadline = require("time").after(tostring(timeout_ms) .. "ms")
    local deadline_case = deadline:case_receive()
    cases[#cases + 1] = deadline_case
    local select_error: any = nil
    while active > 0 do
        local selected_ok, selected = pcall(channel.select, cases)
        if not selected_ok then
            select_error = selected
            break
        end
        if selected.channel == deadline then break end
        for _, attempt in ipairs(attempts) do
            if attempt.response == selected.channel and attempt.resolved ~= true then
                local payload: any = selected.value
                local result_ok, result, result_err = pcall(function() return payload:data() end)
                attempt.resolved = true
                if result_ok then
                    attempt.result = result
                    attempt.result_error = result_err
                else
                    attempt.result_error = result
                end
                active = active - 1
                break
            end
        end
    end

    local primary: any = select_error
    if primary == nil then
        for _, attempt in ipairs(attempts) do
            if attempt.start_error then
                primary = attempt.start_error
                break
            elseif attempt.resolved ~= true then
                primary = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                    message = "nav provider deadline exceeded", details = {code = "nav_provider_timeout"}})
                break
            elseif attempt.result_error ~= nil then
                primary = attempt.result_error
                break
            elseif type(attempt.result) ~= "table" then
                primary = errors.new({kind = errors.INVALID, retryable = false,
                    message = "nav provider returned " .. type(attempt.result), details = {code = "nav_provider_response"}})
                break
            end
        end
    end

    -- Native cancellation bounds this request's wait and releases cancellable work.
    -- It is best-effort by runtime contract: installed in-process code that never
    -- yields cannot be force-preempted here.
    for _, attempt in ipairs(attempts) do
        if attempt.future and attempt.resolved ~= true then
            local cancel_ok, cancel_value, cancel_err = pcall(function()
                return (attempt.future :: any):cancel()
            end)
            if not cancel_ok then
                attempt.cancel_error = cancel_value
            elseif cancel_value == false then
                attempt.cancel_error = cancel_err or errors.new({kind = errors.UNAVAILABLE, retryable = true,
                    message = "nav provider cancellation returned false", details = {code = "nav_provider_cancel"}})
            elseif cancel_err ~= nil then
                attempt.cancel_error = cancel_err
            end
        end
    end

    for _, attempt in ipairs(attempts) do
        if attempt.cancel_error then
            primary = error_envelope.cleanup(function(): (any, error?)
                return nil, attempt.cancel_error
            end, primary, "nav provider cancellation failed")
        end
    end

    if primary ~= nil then return nil, primary end

    return attempts, nil
end

-- Calls run together beneath one bounded request-path deadline; timeout_ms is
-- also passed to each provider as its cooperative budget. Provider failures are
-- returned to the caller instead of being converted into a partial menu.
function M.collect(port: any, args: any): (Collected?, any?)
    if type(port) ~= "table" then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "nav provider port unavailable", details = {code = "nav_provider_port"}})
    end
    local p = port :: { bindings: any, start: any }

    local bindings_ok, bindings, berr = pcall(p.bindings)
    if not bindings_ok then
        return nil, bindings
    end
    if berr or type(bindings) ~= "table" then
        return nil, berr or errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "nav providers returned no bindings", details = {code = "nav_provider_bindings"}})
    end

    local items: { nav.Item } = {}
    local categories: { nav.CategorySpec } = {}
    local dropped: { [string]: number } = {}
    local diagnostics: { { provider: string, code: string } } = {}

    local ordered = by_priority(bindings :: { Binding })
    local selected: { Binding } = {}
    for index, binding in ipairs(ordered) do
        if index > ui_types.NAV_LIMITS.PROVIDERS then
            diagnostics[#diagnostics + 1] = { provider = "nav_providers", code = "provider_limit" }
            break
        end
        local id = tostring(binding.id or "")
        if id == "" then
            diagnostics[#diagnostics + 1] = { provider = "nav_providers", code = "invalid_binding" }
        else
            selected[#selected + 1] = { id = id, priority = binding.priority }
        end
    end

    local attempts, call_err = call_all(p, selected, args)
    if call_err then return nil, call_err end
    for _, attempt in ipairs(attempts) do
        if type(attempt.result) == "table" then
                local r = attempt.result :: { items: any, categories: any }
                local id = attempt.id :: string
                count_dropped(dropped, id, take_items(items, r.items, id))
                count_dropped(dropped, id, take_categories(categories, r.categories, id))
        end
    end

    return { items = items, categories = categories, dropped = dropped, diagnostics = diagnostics }, nil
end

M.Collected = Collected

return M
