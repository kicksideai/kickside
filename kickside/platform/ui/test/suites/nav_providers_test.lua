local test = require("test")
local nav_providers = require("nav_providers")
local ui_types = require("ui_types")

-- Stub port: the fan-out is driven entirely through injected native-future shaped
-- calls, so the library is exercised without a contract, registry, or HTTP request.
-- `calls` records the order providers were started in.
local function stub_port(bindings, responses, calls, bindings_err)
    return {
        bindings = function()
            if bindings_err then return nil, bindings_err end
            return bindings, nil
        end,
        start = function(binding_id, args, timeout_ms)
            if calls then calls[#calls + 1] = binding_id end
            local reply = responses[binding_id]
            if reply == nil then return nil, "no stub reply" end
            local response = channel.new(1)
            local future: any = { cancelled = false }
            future.response = function()
                if type(reply) == "table" and reply.response_error then error(reply.response_error) end
                return response
            end
            future.cancel = function()
                future.cancelled = true
                if type(reply) == "table" then reply.cancelled = true end
                if type(reply) == "table" and reply.cancel_error then return nil, reply.cancel_error end
                return true, nil
            end
            if type(reply) == "table" and reply.pending == true then
                future.result = function() return nil, "cancelled" end
                return future, nil
            end
            -- An extension can raise before it yields a Future; collect() returns
            -- that failure after cancelling any already-started work.
            local result, err
            if type(reply) == "function" then
                result, err = reply(args, timeout_ms)
            else
                result = reply
            end
            future.result = function() return result, err end
            response:send({ data = function() return result, err end })
            return future, nil
        end,
    }
end

local function item(id, path, extra)
    local out = { id = id, title = id, path = path, route_name = id }
    for k, v in pairs(extra or {}) do out[k] = v end
    return out
end

local function define_tests()
    test.describe("KickSide Nav Providers", function()
        test.it("asks providers by priority desc, then binding id", function()
            local calls = {}
            local port = stub_port({
                { id = "z:low", priority = 10 },
                { id = "a:high", priority = 1000 },
                { id = "b:same", priority = 10 },
            }, {
                ["z:low"] = { items = {} },
                ["a:high"] = { items = {} },
                ["b:same"] = { items = {} },
            }, calls)
            local collected, err = nav_providers.collect(port, {})
            test.is_nil(err)
            test.not_nil(collected)
            test.eq(calls[1], "a:high")
            test.eq(calls[2], "b:same")
            test.eq(calls[3], "z:low")
        end)

        test.it("pins the registry binding before an untrusted higher priority", function()
            local registry_id = ui_types.CONTRACT.REGISTRY_NAV_PROVIDER_BINDING
            local port = stub_port({
                { id = "dynamic", priority = 999999 },
                { id = registry_id, priority = 1000 },
            }, {
                [registry_id] = { items = { item("declared", "/shared") } },
                dynamic = { items = { item("dynamic", "/shared") } },
            })
            local collected = nav_providers.collect(port, {})
            test.eq(collected.items[1].provider, registry_id)
            test.eq(collected.items[1].source, "declared")
            -- The canonical item is processed first, so first-wins de-duplication
            -- cannot be shadowed by an extension-controlled priority.
            test.eq(collected.items[2].provider, "dynamic")
        end)

        test.it("keeps contribution order across providers so dedupe can favour the first", function()
            local port = stub_port({
                { id = "registry", priority = 1000 },
                { id = "objects", priority = 500 },
            }, {
                registry = { items = { item("system", "/system") } },
                objects = { items = { item("kind.product", "/product") } },
            })
            local collected = nav_providers.collect(port, {})
            test.eq(#collected.items, 2)
            test.eq(collected.items[1].id, "system")
            test.eq(collected.items[2].id, "kind.product")
            test.eq(collected.items[2].provider, "objects")
        end)

        test.it("derives declaration provenance from the registry binding alone", function()
            local registry_id = ui_types.CONTRACT.REGISTRY_NAV_PROVIDER_BINDING
            local port = stub_port({
                { id = registry_id, priority = 1000 },
                { id = "dynamic", priority = 1 },
            }, {
                [registry_id] = { items = { item("declared", "/declared", { source = "provider" }) } },
                dynamic = { items = { item("dynamic", "/dynamic", { source = "declared" }) } },
            })
            local collected = nav_providers.collect(port, {})
            test.eq(collected.items[1].source, "declared")
            test.eq(collected.items[2].source, "provider")
        end)

        test.it("passes caller locale and the bounded deadline to every provider", function()
            local seen = {}
            local port = stub_port({ { id = "p", priority = 0 } }, {
                p = function(args, timeout_ms)
                    seen = args
                    seen.call_timeout_ms = timeout_ms
                    return { items = {} }, nil
                end,
            })
            nav_providers.collect(port, { locale = "ru-RU", manage = true })
            test.eq(seen.locale, "ru-RU")
            test.eq(seen.manage, true)
            test.eq(seen.timeout_ms, ui_types.NAV_LIMITS.PROVIDER_TIMEOUT_MS)
            test.eq(seen.call_timeout_ms, ui_types.NAV_LIMITS.PROVIDER_TIMEOUT_MS)
        end)

        test.it("drops invalid contributions and reports the count", function()
            local port = stub_port({ { id = "p", priority = 0 } }, {
                p = { items = {
                    item("ok", "/ok"),
                    item("evil", "//evil.test"),  -- path the sanitizer would rewrite
                    { title = "no id", path = "/x" },
                    "not a table",
                }, categories = { { key = "good", title = "Good" }, { key = "bad key" } } },
            })
            local collected = nav_providers.collect(port, {})
            test.eq(#collected.items, 1)
            test.eq(collected.items[1].id, "ok")
            test.eq(#collected.categories, 1)
            test.eq(collected.categories[1].key, "good")
            -- 3 bad items + 1 bad category, all accounted for, never silently gone.
            test.eq(collected.dropped["p"], 4)
        end)

        test.it("caps one provider's items and counts the overflow", function()
            local cap = ui_types.NAV_LIMITS.ITEMS_PER_PROVIDER
            local many = {}
            for i = 1, cap + 5 do many[i] = item("i" .. tostring(i), "/i" .. tostring(i)) end
            local port = stub_port({ { id = "flood", priority = 0 } }, { flood = { items = many } })
            local collected = nav_providers.collect(port, {})
            test.eq(#collected.items, cap)
            test.eq(collected.dropped["flood"], 5)
        end)

        test.it("returns a provider's native failure instead of a partial menu", function()
            local port = stub_port({
                { id = "registry", priority = 1000 },
                { id = "broken", priority = 500 },
            }, {
                registry = { items = { item("system", "/system") } },
                broken = function() return nil, "db is down" end,
            })
            local collected, err = nav_providers.collect(port, {})
            test.is_nil(collected)
            test.eq(err, "db is down")
        end)

        test.it("returns a raised provider error instead of recording a stale diagnostic", function()
            local port = stub_port({
                { id = "registry", priority = 1000 },
                { id = "raised", priority = 0 },
            }, {
                registry = { items = { item("system", "/system") } },
                raised = function() error("database password: secret") end,
            })
            local collected, err = nav_providers.collect(port, {})
            test.is_nil(collected)
            test.is_true(tostring(err):find("database password: secret", 1, true) ~= nil)
        end)

        test.it("returns malformed and timed-out provider failures", function()
            local port = stub_port({ { id = "weird", priority = 0 } }, { weird = function() return "nope", nil end })
            local collected, err = nav_providers.collect(port, {})
            test.is_nil(collected)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:details().code, "nav_provider_response")

            local timeout = stub_port({ { id = "slow", priority = 0 } }, { slow = function() return nil, "timeout" end })
            local timed, timeout_err = nav_providers.collect(timeout, {})
            test.is_nil(timed)
            test.eq(timeout_err, "timeout")
        end)

        test.it("classifies missing native future channels", function()
            local no_future = {
                bindings = function() return { { id = "missing", priority = 0 } }, nil end,
                start = function() return nil, nil end,
            }
            local collected, err = nav_providers.collect(no_future, {})
            test.is_nil(collected)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:details().code, "nav_provider_start")

            local no_response = {
                bindings = function() return { { id = "missing", priority = 0 } }, nil end,
                start = function()
                    return {
                        response = function() return nil end,
                        cancel = function() return true, nil end,
                    }, nil
                end,
            }
            collected, err = nav_providers.collect(no_response, {})
            test.is_nil(collected)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:details().code, "nav_provider_response_channel")
        end)

        test.it("cancels a pending native future at the shared deadline", function()
            local slow = { pending = true }
            local port = stub_port({
                { id = "slow", priority = 100 },
                { id = "healthy", priority = 0 },
            }, {
                -- A never-resolving future models an extension that ignores the
                -- cooperative hint. It is cancelled rather than left running.
                slow = slow,
                healthy = { items = { item("ready", "/ready") } },
            })
            local collected, err = nav_providers.collect(port, {})
            test.is_nil(collected)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:details().code, "nav_provider_timeout")
            test.is_true((slow :: any).cancelled)
        end)

        test.it("cancels a started future before returning its response setup failure", function()
            local primary = errors.new({kind = errors.INVALID, retryable = false,
                message = "response channel exploded", details = {code = "response_channel"}})
            local cleanup = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = "cancel transport failed", details = {code = "cancel_transport"}})
            local broken = { response_error = primary, cancel_error = cleanup }
            local port = stub_port({ { id = "broken", priority = 0 } }, { broken = broken })
            local collected, err = nav_providers.collect(port, {})
            test.is_nil(collected)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:details().code, "cancel_transport")
            test.eq(err:details().cause.details.code, "cancel_transport")
            test.eq(err:details().operation_error.kind, errors.INVALID)
            test.eq(err:details().operation_error.message, "response channel exploded")
            test.eq(err:details().operation_error.details.code, "response_channel")
            test.is_true((broken :: any).cancelled)
        end)

        test.it("bounds provider fan-out deterministically", function()
            local bindings, replies, calls = {}, {}, {}
            for i = 1, ui_types.NAV_LIMITS.PROVIDERS + 3 do
                local id = string.format("p%02d", i)
                bindings[#bindings + 1] = { id = id, priority = 0 }
                replies[id] = { items = { item(id, "/" .. id) } }
            end
            local collected, err = nav_providers.collect(stub_port(bindings, replies, calls), {})
            test.is_nil(err)
            test.eq(#calls, ui_types.NAV_LIMITS.PROVIDERS)
            test.eq(#collected.items, ui_types.NAV_LIMITS.PROVIDERS)
            test.eq(collected.diagnostics[1].code, "provider_limit")
        end)

        test.it("an unlistable or absent port is an error", function()
            local collected, err = nav_providers.collect(stub_port({}, {}, nil, "contract unavailable"), {})
            test.is_nil(collected)
            test.eq(err, "contract unavailable")

            local no_port, perr = nav_providers.collect(nil, {})
            test.is_nil(no_port)
            test.is_true(errors.is(perr, errors.UNAVAILABLE))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
