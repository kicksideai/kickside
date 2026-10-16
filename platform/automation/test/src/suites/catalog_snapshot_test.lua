-- The port catalog snapshot: point resolution must not rebuild the catalog per
-- call. One registry version earns exactly one build (one ports find + one
-- bindings find); every later resolution at that version is a map hit. This is
-- the incident invariant — resolve_source ran per delivered event batch and
-- each call materialized every contract.binding in the registry.

local test = require("test")
local registry = require("registry")
local harness = require("engine_harness")

type Map = { [string]: any }

local function counting_registry(): (any, () -> number, () -> ())
    local finds = 0
    local token_override: string? = nil
    local wrapper: Map = {}
    setmetatable(wrapper, { __index = registry :: any })
    wrapper.find = function(query: any): (any?, any)
        finds = finds + 1
        return (registry :: any).find(query)
    end
    wrapper.current_version = function(): (any, any)
        if token_override then return { id = function() return token_override end }, nil end
        return (registry :: any).current_version()
    end
    return wrapper, function(): number return finds end,
        function(): () token_override = "catalog-version-changed" end
end

local function define_tests()
    test.describe("automation catalog snapshot", function()
        test.it("the runtime serves the registry version token the snapshot gates on", function()
            local version, err = (registry :: any).current_version()
            test.is_nil(err)
            test.not_nil(version)
            local token = (version :: any):id()
            test.not_nil(token)
            local again, err2 = (registry :: any).current_version()
            test.is_nil(err2)
            test.eq((again :: any):id(), token, "an unchanged registry answers one stable token")
        end)

        test.it("builds the catalog once per registry version across repeated resolutions", function()
            local counting, finds = counting_registry()
            local engine = harness.new({ registry = counting })
            for _ = 1, 5 do
                local _, _ = (engine :: any).resolve_source("ns:no-such-port")
                local _, _ = (engine :: any).resolve_sink("ns:no-such-port")
            end
            test.eq(finds(), 2,
                "ten point resolutions must cost one catalog build (ports find + bindings find), got " .. tostring(finds()))
        end)

        test.it("a registry version change rebuilds exactly once more", function()
            local counting, finds, advance_version = counting_registry()
            local engine = harness.new({ registry = counting })
            ;(engine :: any).resolve_source("ns:no-such-port")
            test.eq(finds(), 2)
            advance_version()
            ;(engine :: any).resolve_source("ns:no-such-port")
            ;(engine :: any).resolve_source("ns:no-such-port")
            test.eq(finds(), 4, "one rebuild after version change, then map hits again")
        end)

        test.it("human-facing listings still answer from the held snapshot", function()
            local counting, finds = counting_registry()
            local engine = harness.new({ registry = counting })
            local sources, serr = (engine :: any).list_sources()
            test.is_nil(serr)
            test.not_nil(sources)
            ;(engine :: any).list_sinks()
            ;(engine :: any).list_sources()
            test.eq(finds(), 2, "listings share the snapshot rather than rebuilding per call")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
