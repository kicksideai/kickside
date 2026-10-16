local test = require("test")
local component = require("component")

local function client(result: any, transport: error?, stage: string?): any
    local function invoke() return result, transport end
    local service = {register = invoke, get_access_context = invoke, list = invoke,
        set_meta = invoke, update = invoke, set_placement = invoke, grant_subtree = invoke, delete = invoke}
    local definition = {
        with_actor = function(self) return self end,
        with_scope = function(self) return self end,
        open = function()
            if stage == "open" then return nil, transport end
            return service, nil
        end,
    }
    return component.new({
        contract = {get = function()
            if stage == "get" then return nil, transport end
            return definition, nil
        end},
        security = {actor = function() return {} end, scope = function() return {} end},
    })
end

local function calls(port): table
    return {
        function() return port.register({}) end,
        function() return port.access_level("component") end,
        function() return port.impl_id("component") end,
        function() return port.list_thread_components({}, 1, 1) end,
        function() return port.ensure_thread_type("component", "class") end,
        function() return port.update("component", {}) end,
        function() return port.set_placement("component", {}) end,
        function() return port.grant_subtree("component", {}) end,
        function() return port.remove("component") end,
    }
end

return {run = test.run_cases(function()
    test.describe("Core component native failures", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{retryable = false}, {retryable = true}}) do
                test.it("rehydrates native reap warnings/" .. kind .. "/" .. tostring(policy.retryable), function()
                    local result = {success = true, warning = "thread reap refusal", kind = kind,
                        retryable = policy.retryable, cleanup_pending = false,
                        details = {code = "reap_failure", nested = {marker = "kept"}}}
                    local ok, err = client(result, nil).remove("component")
                    test.is_false(ok)
                    test.is_true(errors.is(err, kind))
                    test.eq(err:retryable(), policy.retryable)
                    test.eq(err:details().code, "reap_failure")
                    test.eq(err:details().nested.marker, "kept")
                    test.is_false(err:details().cleanup_pending)
                    test.eq(result.details.code, "reap_failure")
                    test.is_nil(result.details.cleanup_pending)
                end)
            end
        end
        test.it("retains warning behavior when optional native fields are absent", function()
            local ok, err = client({success = true, warning = "thread reap refusal",
                thread_discarded = {events = 1}}, nil).remove("component")
            test.is_false(ok)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.is_false(err:retryable())
            test.is_false(err:details().cleanup_pending)
            test.eq(err:details().discarded.events, 1)
        end)
        test.it("retains accepted work in progress with its native warning fields", function()
            local result = {success = true, warning = "thread cleanup continues", cleanup_pending = true,
                in_progress = true, kind = errors.CONFLICT, retryable = true,
                details = {cleanup_pending = true, code = "cleanup_page"}}
            local ok, err, remaining = client(result, nil).remove("component")
            test.is_true(ok)
            test.is_nil(err)
            test.eq(remaining, result)
        end)
        test.it("uses the envelope kind instead of its human text for every service consumer", function()
            for _, kind in ipairs({errors.INVALID, errors.ALREADY_EXISTS, errors.CONFLICT,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.TIMEOUT, errors.RATE_LIMITED}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    local result = {success = false, error = "not found: duplicate key required permission",
                        kind = kind, retryable = policy.retryable,
                        details = {code = "component_failure", nested = {marker = "kept"}}}
                    for _, invoke in ipairs(calls(client(result, nil))) do
                        local _, err = invoke()
                        test.is_true(errors.is(err, kind), "service preserves kind " .. kind)
                        test.eq(err:retryable(), policy.retryable)
                        test.eq(err:details().code, "component_failure")
                        test.eq(err:details().nested.marker, "kept")
                    end
                end
            end
        end)

        test.it("handles only native NotFound as an idempotent delete", function()
            local ok, err = client({success = false, kind = errors.NOT_FOUND,
                error = "resource absent", retryable = false}, nil).remove("component")
            test.is_true(ok)
            test.is_nil(err)
        end)

        test.it("retains transport failure metadata at get open and method dispatch", function()
            for _, kind in ipairs({errors.INVALID, errors.PERMISSION_DENIED, errors.CONFLICT,
                errors.NOT_FOUND, errors.UNAVAILABLE, errors.TIMEOUT}) do
                for _, stage in ipairs({"get", "open", "call"}) do
                    local source = errors.new({kind = kind, message = "native service failure", retryable = false,
                        details = {code = "transport_failure", nested = {marker = "kept"}}})
                    for _, invoke in ipairs(calls(client(nil, source, stage))) do
                        local _, err = invoke()
                        test.is_true(errors.is(err, kind), stage .. " preserves kind " .. kind)
                        test.eq(err:retryable(), false)
                        test.eq(err:details().code, "transport_failure")
                        test.eq(err:details().nested.marker, "kept")
                    end
                end
            end
        end)
    end)
end)}
