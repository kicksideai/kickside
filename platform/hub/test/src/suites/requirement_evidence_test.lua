local test = require("test")
local evidence = require("evidence")

local function define_tests()
    test.describe("Install requirement evidence", function()
        test.it("opens only the requested exact module version and closes the artifact", function()
            local opened_component = ""
            local opened_version = ""
            local closed = false
            local previous = evidence._hub
            evidence._hub = {
                versions = {
                    open = function(component, ref)
                        opened_component = tostring(component or "")
                        opened_version = tostring(ref.version or "")
                        return {
                            entries = function() return { { id = "acme.tools:serve", kind = "function.lua", source = "return true" } }, nil end,
                            metadata = function() return { description = "fixture" }, nil end,
                            close = function() closed = true end,
                        }, nil
                    end,
                },
            }
            local result, err = evidence.inspect_module({ component = "acme/tools", version = "1.2.3", limit = 1 })
            evidence._hub = previous
            test.is_nil(err)
            test.eq(opened_component, "acme/tools")
            test.eq(opened_version, "1.2.3")
            test.is_true(closed)
            test.eq((result :: any).entries[1].id, "acme.tools:serve")
            test.is_nil((result :: any).entries[1].source)
            test.is_nil((result :: any).entries[1].data)
            test.is_nil((result :: any).metadata)
            test.is_false((result :: any).truncated)
            test.is_nil((result :: any).next_cursor)
        end)

        for _, operation in ipairs({ "entries", "metadata", "close" }) do
            test.it("propagates artifact " .. operation .. " failures and closes it", function()
                local failure = errors.new({ kind = errors.UNAVAILABLE, message = "artifact unavailable" })
                local closed = false
                local previous = evidence._hub
                evidence._hub = { versions = { open = function() return {
                    entries = function() return {}, operation == "entries" and failure or nil end,
                    metadata = function() return {}, operation == "metadata" and failure or nil end,
                    close = function() closed = true; return nil, operation == "close" and failure or nil end,
                }, nil end } }
                local request = { component = "acme/tools", version = "1.2.3" }
                if operation == "metadata" then request.entry_id = "acme.tools:serve" end
                local result, err = evidence.inspect_module(request)
                evidence._hub = previous
                test.is_nil(result)
                test.eq(err, failure)
                test.is_true(closed)
            end)
        end

        test.it("fails invalid requests and missing artifacts with typed errors", function()
            local _, invalid = evidence.inspect_module({ component = "not a component", version = "1.2.3" })
            test.is_true(errors.is(invalid, errors.INVALID))
            local _, unversioned = evidence.inspect_module({ component = "acme/tools" })
            test.is_true(errors.is(unversioned, errors.INVALID))

            local previous = evidence._hub
            evidence._hub = { versions = { open = function() return nil, nil end } }
            local _, missing = evidence.inspect_module({ component = "acme/tools", version = "1.2.3" })
            evidence._hub = { versions = { open = function() return {
                entries = function() return nil, nil end,
                metadata = function() return {}, nil end,
                close = function() end,
            }, nil end } }
            local _, empty = evidence.inspect_module({ component = "acme/tools", version = "1.2.3" })
            evidence._hub = previous
            test.is_true(errors.is(missing, errors.NOT_FOUND))
            test.is_true(errors.is(empty, errors.INTERNAL))

            local _, no_ids = evidence.inspect_registry({})
            test.is_true(errors.is(no_ids, errors.INVALID))
        end)

        test.it("reads unique exact registry ids and rejects free-form values", function()
            local previous = evidence._registry
            evidence._registry = {
                get = function(id) return { id = id, kind = "http.router" }, nil end,
            }
            local result, err = evidence.inspect_registry({ ids = { "app:api", "not-an-id", "app:api", "app:api.public" } })
            evidence._registry = previous
            test.is_nil(err)
            test.eq(#(result :: any).entries, 2)
            test.eq((result :: any).entries[1].id, "app:api")
            test.eq((result :: any).entries[2].id, "app:api.public")
        end)

        test.it("reads every requested id", function()
            local previous = evidence._registry
            evidence._registry = {
                get = function(id) return { id = id, kind = "http.router" }, nil end,
            }
            local ids = {}
            for i = 1, 60 do ids[i] = "app:candidate_" .. i end
            local result, err = evidence.inspect_registry({ ids = ids })
            evidence._registry = previous
            test.is_nil(err)
            test.eq(#(result :: any).entries, 60)
            test.eq((result :: any).entries[60].id, "app:candidate_60")
        end)

        test.it("returns one exact artifact entry whole", function()
            local long_source = string.rep("é", 40000)
            local long_description = string.rep("m", 20000)
            local previous = evidence._hub
            evidence._hub = { versions = { open = function() return {
                entries = function() return { { id = "acme.tools:serve", kind = "function.lua",
                    meta = { comment = "serve", tags = { "a", "b" } },
                    data = { method = "run", source = long_source, nested = { deep = { value = 7 } } },
                    imports = { helper = "acme.tools:helper" }, security = { required = "read" } } }, nil end,
                metadata = function() return { description = long_description }, nil end, close = function() end,
            }, nil end } }
            local result, err = evidence.inspect_module({ component = "acme/tools", version = "1.2.3", entry_id = "acme.tools:serve" })
            evidence._hub = previous
            test.is_nil(err)
            local entry = (result :: any).entry
            test.eq(entry.meta.tags[2], "b")
            test.eq(entry.data.nested.deep.value, 7)
            test.eq(entry.source, long_source)
            test.eq(entry.imports.helper, "acme.tools:helper")
            test.eq(entry.security.required, "read")
            test.eq((result :: any).metadata.description, long_description)
        end)

        test.it("pages artifact entries in id order with a cursor", function()
            local previous = evidence._hub
            evidence._hub = { versions = { open = function() return {
                entries = function() return {
                    { id = "acme.tools:c", kind = "function.lua" },
                    { id = "acme.tools:a", kind = "function.lua" },
                    { id = "acme.tools:b", kind = "function.lua" },
                }, nil end,
                metadata = function() return {}, nil end, close = function() end,
            }, nil end } }
            local first, first_err = evidence.inspect_module({ component = "acme/tools", version = "1.2.3", limit = 2 })
            test.is_nil(first_err)
            test.eq((first :: any).entries[1].id, "acme.tools:a")
            test.eq((first :: any).entries[2].id, "acme.tools:b")
            test.is_true((first :: any).truncated)
            local second, second_err = evidence.inspect_module({ component = "acme/tools", version = "1.2.3", limit = 2,
                cursor = (first :: any).next_cursor })
            evidence._hub = previous
            test.is_nil(second_err)
            test.eq(#(second :: any).entries, 1)
            test.eq((second :: any).entries[1].id, "acme.tools:c")
            test.is_false((second :: any).truncated)
            test.is_nil((second :: any).next_cursor)
        end)

        test.it("returns whole live registry entries", function()
            local previous = evidence._registry
            local long_text = string.rep("x", 10000)
            evidence._registry = {
                get = function(id) return { id = id, kind = "http.router", meta = { comment = long_text },
                    data = { prefix = "/api", options = { nested = { flag = true } } } }, nil end,
            }
            local result, err = evidence.inspect_registry({ ids = { "app:api" } })
            evidence._registry = previous
            test.is_nil(err)
            local entry = (result :: any).entries[1]
            test.eq(entry.meta.comment, long_text)
            test.is_true(entry.data.options.nested.flag)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
