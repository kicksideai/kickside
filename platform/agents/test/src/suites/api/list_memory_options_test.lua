local test = require("test")
local memory_options = require("list_memory_options")

local function define_tests()
    test.describe("agent memory options", function()
        test.it("lists provider targets under the caller actor and scope", function()
            local actor = { id = function() return "memory_user" end }
            local scope = { name = "memory_scope" }
            local calls = {}
            local deps = {
                registry = {
                    find = function(query)
                        calls.query = query
                        return {
                            {
                                id = "app:memory_provider",
                                meta = {
                                    type = "agent.memory_provider",
                                    title = "Memory",
                                    implementation_id = "app:memory",
                                    list_targets = "app:list_memory_targets",
                                    order = 1,
                                },
                            },
                            {
                                id = "app:private_provider",
                                meta = {
                                    type = "agent.memory_provider",
                                    private = true,
                                    implementation_id = "app:private_memory",
                                    list_targets = "app:list_private_memory_targets",
                                },
                            },
                        }, nil
                    end,
                },
                funcs = {
                    new = function()
                        local executor = {}
                        function executor:with_actor(value)
                            calls.actor = value
                            return self
                        end
                        function executor:with_scope(value)
                            calls.scope = value
                            return self
                        end
                        function executor:call(target, args)
                            calls.target = target
                            calls.args = args
                            return {
                                success = true,
                                items = {
                                    { id = "kb-1", title = "KB One", description = "Readable KB", kb_type = "knowledge_base" },
                                    { id = "", title = "invalid" },
                                },
                            }, nil
                        end
                        return executor, nil
                    end,
                },
            }

            local payload, err = memory_options.list_options(actor, scope, deps)

            test.is_nil(err)
            test.not_nil(payload)
            local query = (calls :: any).query
            test.eq(query["meta.type"], "agent.memory_provider")
            test.eq(calls.actor, actor)
            test.eq(calls.scope, scope)
            test.eq(calls.target, "app:list_memory_targets")
            test.eq(#calls.args, 0)
            test.eq(#payload.providers, 1)
            test.eq(payload.providers[1].id, "app:memory_provider")
            test.eq(#payload.items, 1)
            test.eq(payload.items[1].id, "kb-1")
            test.eq(payload.items[1].provider_id, "app:memory_provider")
            test.eq(payload.items[1].kind, "knowledge_base")
        end)

        test.it("requires scope before consulting providers", function()
            local called = false
            local payload, err = memory_options.list_options({}, nil, {
                registry = {
                    find = function()
                        called = true
                        return {}, nil
                    end,
                },
            })

            test.is_nil(payload)
            test.contains(err, "scope")
            test.is_false(called)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
