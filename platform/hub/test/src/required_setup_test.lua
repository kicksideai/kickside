local setup = require("setup")

local function descriptor(overrides: any?): any
    local entry = {
        kind = "registry.entry",
        meta = {
            type = "kickside.hub.required_setup",
            version = "1",
            title = "Module setup",
            pending_label = "Running setup",
            ready_label = "Setup ready",
        },
        data = {
            contract = "example:v1",
            status_func = "example.setup:required_setup_status",
            apply_func = "example.setup:required_setup_apply",
        },
    }
    for key, value in pairs(overrides or {}) do
        if entry.data[key] ~= nil then entry.data[key] = value else entry[key] = value end
    end
    return entry
end

local test = require("test")

local function define_tests()
    test.describe("Hub required setup dispatcher", function()

        test.it("reports a request-body read error before decoding", function()
            local decoded = false
            local response: { status: number, body: { error: string }? } = { status = 0, body = nil }
            function response:set_content_type(_value: any): () end
            function response:set_status(value: number): () self.status = value end
            function response:write_json(value: any): () self.body = value end
            setup._http = {
                request = function() return { body = function() return nil, "body read fails" end } end,
                response = function() return response end,
                CONTENT = { JSON = "application/json" },
                STATUS = { BAD_REQUEST = 400, UNAUTHORIZED = 401 },
            }
            setup._json = { decode = function() decoded = true; return {} end }
            setup._security = { actor = function() return {} end }
            setup.apply()
            setup._http = nil
            setup._json = nil
            setup._security = nil
            test.eq(decoded, false)
            test.eq(response.status, 400)
            test.is_true(response.body ~= nil)
            if response.body == nil then error("setup error response is absent") end
            test.eq(response.body.error, "body read fails")
        end)

        test.it("rejects descriptors outside the registry entry envelope", function()
            local entry = descriptor()
            local flattened = { kind = entry.kind, meta = entry.meta, contract = entry.data.contract,
                status_func = entry.data.status_func, apply_func = entry.data.apply_func }
            for _, invalid in ipairs({ flattened, { data = flattened } }) do
                local result, err = setup.resolve_descriptor("example.setup:required_setup_contract", {
                    get = function() return invalid, nil end,
                })
                test.is_nil(result)
                test.eq(err.code, "INVALID_SETUP_DESCRIPTOR")
            end
        end)

        test.it("rejects an unknown action without dispatch", function()
            local invoked = false
            local result, err = setup.invoke("example.setup:required_setup_contract", "delete", {
                registry = { get = function() return descriptor(), nil end },
                funcs = { call = function() invoked = true end },
            })
            test.is_nil(result)
            test.eq(err.code, "INVALID_SETUP_ACTION")
            test.eq(invoked, false)
        end)

        test.it("preserves a failed status result", function()
            local result, err = setup.invoke("example.setup:required_setup_contract", "status", {
                registry = { get = function() return descriptor(), nil end },
                funcs = { call = function()
                    return { contract = "example:v1", success = false, error = "status fails" }, nil
                end },
            })
            test.is_nil(result)
            test.eq(err.error, "status fails")
        end)
        test.it("invokes only a same-namespace versioned descriptor", function()
            local called: { id: string, args: { contract: string } }? = nil
            local result, err = setup.invoke("example.setup:required_setup_contract", "status", {
                registry = { get = function() return descriptor(), nil end },
                funcs = { call = function(id: string, args: any)
                    called = { id = id, args = args }
                    return { contract = "example:v1", ready = true, status = "ready" }, nil
                end },
            })
            test.is_nil(err)
            test.eq(result.ready, true)
            test.eq(result.descriptor, "example.setup:required_setup_contract")
            test.is_true(called ~= nil)
            if called == nil then error("setup action is not invoked") end
            test.eq(called.id, "example.setup:required_setup_status")
            test.eq(called.args.contract, "example:v1")
        end)

        test.it("rejects a cross-namespace action before invocation", function()
            local invoked = false
            local result, err = setup.invoke("example.setup:required_setup_contract", "apply", {
                registry = { get = function()
                    return descriptor({ apply_func = "other.module:dangerous" }), nil
                end },
                funcs = { call = function() invoked = true end },
            })
            test.is_nil(result)
            test.eq(err.code, "INVALID_SETUP_DESCRIPTOR")
            test.eq(invoked, false)
        end)

        test.it("rejects an unsupported descriptor type", function()
            local result, err = setup.resolve_descriptor("example.setup:required_setup_contract", {
                get = function()
                    local entry = descriptor()
                    entry.meta.type = "something.else"
                    return entry, nil
                end,
            })
            test.is_nil(result)
            test.eq(err.code, "INVALID_SETUP_DESCRIPTOR")
        end)

        test.it("fails closed when an action returns the wrong contract", function()
            local result, err = setup.invoke("example.setup:required_setup_contract", "apply", {
                registry = { get = function() return descriptor(), nil end },
                funcs = { call = function()
                    return { contract = "other:v1", success = true, ready = true }, nil
                end },
            })
            test.is_nil(result)
            test.eq(err.code, "SETUP_CONTRACT_MISMATCH")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
