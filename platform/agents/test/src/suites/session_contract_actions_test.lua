local test = require("test")
local message_handlers = require("message_handlers")
local lifecycle_runtime = require("lifecycle_runtime")
local tool_caller = require("tool_caller")
local funcs = require("funcs")
local security = require("security")

local function fake_reader()
    return {
        state = function()
            return {
                meta = {},
                config = {
                    agent_id = "agent:a",
                    model = "model:a",
                },
            }
        end,
        get_full_context = function()
            return {
                workspace_id = "workspace:one",
            }, nil
        end,
        get_context = function()
            return nil
        end,
        messages = function()
            return {
                from_checkpoint = function(self)
                    return self
                end,
                all = function()
                    return {}, nil
                end,
            }
        end,
        contexts = function()
            return {
                all = function()
                    return {}, nil
                end,
            }
        end,
    }
end

local function fake_writer()
    local captured = {
        added = {},
        meta_updates = {},
        message_meta_updates = {},
    }

    local writer = {
        add_message = function(self, message_type, data, metadata)
            local id = "msg:" .. tostring(#captured.added + 1)
            table.insert(captured.added, {
                id = id,
                type = message_type,
                data = data,
                metadata = metadata,
            })
            return id, nil
        end,
        update_meta = function(self, meta)
            table.insert(captured.meta_updates, meta)
            return true, nil
        end,
        update_message_meta = function(self, message_id, meta)
            table.insert(captured.message_meta_updates, {
                message_id = message_id,
                meta = meta,
            })
            return true, nil
        end,
        add_response = function(self, content, metadata, intents)
            local message_id = "response:" .. tostring(#captured.added + 1)
            table.insert(captured.added, {
                id = message_id,
                type = "assistant",
                data = content,
                metadata = metadata,
            })
            local call_message_ids = {}
            for _, intent in ipairs(intents or {}) do
                local call_message_id = "call:" .. tostring(intent.id)
                call_message_ids[intent.id] = call_message_id
                table.insert(captured.added, {
                    id = call_message_id,
                    type = intent.type,
                    data = intent.arguments,
                    metadata = { name = intent.name, registry_id = intent.registry_id },
                })
            end
            return message_id, call_message_ids, nil
        end,
    }

    return writer, captured
end

local function fake_upstream()
    return {
        conn_pid = nil,
        response_beginning = function() end,
        message_error = function() end,
        send_message_update = function() end,
        invalidate_message = function() end,
    }
end

local function lifecycle_contract(calls)
    local function opener_for(binding_context)
        return {
            open = function(self, binding)
                return {
                    apply = function(self, payload)
                        table.insert(calls, {
                            binding = binding,
                            context = binding_context or {},
                            payload = payload,
                        })
                        if payload.phase == lifecycle_runtime.PHASE.BEFORE_STEP then
                            return {
                                messages = {
                                    {
                                        role = "developer",
                                        content = "lifecycle prompt",
                                    },
                                },
                            }, nil
                        end
                        return {}, nil
                    end,
                }, nil
            end,
        }
    end

    return {
        get = function(contract_id)
            if contract_id ~= lifecycle_runtime.CONTRACT_ID then
                return nil, "unexpected contract"
            end
            return {
                with_context = function(self, binding_context)
                    return opener_for(binding_context)
                end,
                open = function(self, binding)
                    return opener_for({}):open(binding)
                end,
            }, nil
        end,
    }
end

local function make_agent(agent_id, model, step_result, captured)
    return {
        id = agent_id,
        model = model,
        bindings = {
            lifecycle = {
                {
                    id = "session_lifecycle",
                    binding = "session_lifecycle_binding",
                    phases = {
                        lifecycle_runtime.PHASE.ACTIVATE,
                        lifecycle_runtime.PHASE.BEFORE_STEP,
                        lifecycle_runtime.PHASE.AFTER_STEP,
                        lifecycle_runtime.PHASE.DEACTIVATE,
                    },
                    context = {
                        trait_id = "trait:session-memory",
                    },
                },
            },
        },
        tool_wrappers = {
            {
                id = "session_tool_wrapper",
                binding = "session_tool_wrapper_binding",
                phases = {
                    tool_caller.PHASE.BEFORE_EXECUTE,
                    tool_caller.PHASE.AFTER_EXECUTE,
                },
                context = {
                    trait_id = "trait:session-audit",
                },
            },
        },
        agent_options = {},
        step = function(self, builder, runtime_options)
            captured.step_context = runtime_options.context
            return step_result, nil
        end,
    }
end

local function make_ctx(agent_loader, step_result)
    local writer, writer_capture = fake_writer()
    local captured = {
        writer = writer_capture,
        step_context = nil,
    }
    local default_agent = make_agent("agent:a", "model:a", step_result or {
        result = "done",
        tokens = {
            prompt_tokens = 1,
        },
    }, captured)

    local ctx = {
        session_id = "session:one",
        user_id = "user:one",
        reader = fake_reader(),
        writer = writer,
        upstream = fake_upstream(),
        config = {
            agent_id = "agent:a",
            model = "model:a",
        },
        lifecycle_state = {},
        agent_ctx = {
            load_agent = function(self, agent_id, options)
                if agent_loader then
                    return agent_loader(agent_id, options, captured), nil
                end
                return default_agent, nil
            end,
            get_current_agent = function()
                return nil
            end,
        },
    }
    return ctx, captured
end

local function tool_contract(calls)
    local function opener_for(binding_context)
        return {
            open = function(self, binding)
                return {
                    apply = function(self, payload)
                        table.insert(calls, {
                            binding = binding,
                            context = binding_context or {},
                            payload = payload,
                        })
                        return {
                            tool_calls = payload.tool_calls,
                        }, nil
                    end,
                }, nil
            end,
        }
    end

    return {
        get = function(contract_id)
            if contract_id ~= "wippy.agent:tool_wrapper" then
                return nil, "unexpected contract"
            end
            return {
                with_context = function(self, binding_context)
                    return opener_for(binding_context)
                end,
                open = function(self, binding)
                    return opener_for({}):open(binding)
                end,
            }, nil
        end,
    }
end

local function install_tool_mocks(wrapper_calls)
    tool_caller._contract = tool_contract(wrapper_calls)
    tool_caller._tools = {
        get_tool_schema = function(registry_id)
            return {
                id = registry_id,
                name = "lookup",
                meta = {},
            }, nil
        end,
    }
    tool_caller._funcs = {
        new = function()
            local executor = {}
            function executor:with_actor(actor)
                return self
            end
            function executor:with_scope(scope)
                return self
            end
            function executor:with_context(context)
                return {
                    async = function(self, registry_id, args)
                        return {
                            response = function()
                                return {
                                    receive = function()
                                        return {}, true
                                    end,
                                }
                            end,
                            is_canceled = function()
                                return false
                            end,
                            result = function()
                                return {
                                    data = function()
                                        return {
                                            ok = true,
                                            workspace_id = context.workspace_id,
                                        }
                                    end,
                                }, nil
                            end,
                        }
                    end,
                }
            end
            return executor
        end,
    }
end

local function reset_mocks()
    lifecycle_runtime._contract = nil
    tool_caller._contract = nil
    tool_caller._tools = nil
    tool_caller._funcs = nil
end

local function phases(calls)
    local out = {}
    for _, call in ipairs(calls) do
        out[#out + 1] = call.payload.phase
    end
    return table.concat(out, ",")
end

local function at(list, index): any
    return (list :: any)[index]
end

local function define_tests()
    test.describe("session agent contract actions", function()
        test.after_each(reset_mocks)

        test.it("applies lifecycle phases around a session agent step", function()
            local lifecycle_calls = {}
            lifecycle_runtime._contract = lifecycle_contract(lifecycle_calls)
            local ctx, captured = make_ctx()

            local result, err = message_handlers.agent_step(ctx, {
                message_id = "user:message",
                request_id = "request:one",
                from_user = true,
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(phases(lifecycle_calls), "activate,before_step,after_step")
            local first_call = at(lifecycle_calls, 1)
            local step_context = (captured :: any).step_context
            test.eq(first_call.payload.host.kind, "session")
            test.eq(first_call.payload.host.session_id, "session:one")
            test.eq(first_call.payload.agent.id, "agent:a")
            test.eq(first_call.payload.run_context.contract, "wippy.agent:run_context")
            test.eq(first_call.payload.run_context.binding, "wippy.session.run_context:binding")
            test.eq(step_context.agent_run.host.kind, "session")
            test.eq(step_context.agent_run.run_context.binding, "wippy.session.run_context:binding")
        end)

        test.it("deactivates the previous session agent before activating a replacement", function()
            local lifecycle_calls = {}
            lifecycle_runtime._contract = lifecycle_contract(lifecycle_calls)
            local agents = {}
            local ctx = make_ctx(function(agent_id, options, cap)
                agents[agent_id] = agents[agent_id] or make_agent(agent_id, options and options.model or "model", {
                    result = "done",
                    tokens = {
                        prompt_tokens = 1,
                    },
                }, cap)
                return agents[agent_id]
            end)

            local _, first_err = message_handlers.agent_step(ctx, {
                message_id = "user:one",
                request_id = "request:one",
                from_user = true,
            })
            test.is_nil(first_err)

            ctx.config.agent_id = "agent:b"
            ctx.config.model = "model:b"
            local _, second_err = message_handlers.agent_step(ctx, {
                message_id = "user:two",
                request_id = "request:two",
                from_user = true,
            })

            test.is_nil(second_err)
            test.eq(phases(lifecycle_calls), "activate,before_step,after_step,deactivate,activate,before_step,after_step")
            test.eq(at(lifecycle_calls, 4).payload.agent.id, "agent:a")
            test.eq(at(lifecycle_calls, 5).payload.agent.id, "agent:b")
        end)

        test.it("passes session host and run context to tool wrapper contracts", function()
            local wrapper_calls = {}
            install_tool_mocks(wrapper_calls)
            local ctx = make_ctx()
            local tool_calls = {
                {
                    id = "call:one",
                    name = "lookup",
                    registry_id = "test:lookup",
                    arguments = {
                        query = "needle",
                    },
                },
            }
            local host = { kind = "session", session_id = "session:one" }
            local agent = { id = "agent:a", model = "model:a" }
            local run_context = {
                contract = "wippy.agent:run_context",
                binding = "wippy.session.run_context:binding",
                host = host,
                agent = agent,
            }
            local caller = tool_caller.new()
            caller:set_tool_wrappers({
                {
                    id = "audit",
                    binding = "session_tool_wrapper_binding",
                    phases = {
                        tool_caller.PHASE.BEFORE_EXECUTE,
                        tool_caller.PHASE.AFTER_EXECUTE,
                    },
                    context = { trait_id = "trait:session-audit" },
                },
            })
            caller:set_wrapper_context({ host = host, agent = agent, run_context = run_context })
            local validated_tools, validation_err = caller:validate(tool_calls)
            test.is_nil(validation_err)

            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = caller:get_last_tool_calls(),
                call_message_ids = { ["call:one"] = "message:call:one" },
                caller = caller,
                validated_tools = validated_tools,
                tool_wrappers = {
                    {
                        id = "audit",
                        binding = "session_tool_wrapper_binding",
                        phases = {
                            tool_caller.PHASE.BEFORE_EXECUTE,
                            tool_caller.PHASE.AFTER_EXECUTE,
                        },
                        context = {
                            trait_id = "trait:session-audit",
                        },
                    },
                },
                agent = agent,
                message_id = "user:message",
                request_id = "request:one",
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(#wrapper_calls, 2)
            local before_call = at(wrapper_calls, 1)
            local after_call = at(wrapper_calls, 2)
            test.eq(before_call.payload.phase, tool_caller.PHASE.BEFORE_EXECUTE)
            test.eq(after_call.payload.phase, tool_caller.PHASE.AFTER_EXECUTE)
            test.eq(before_call.payload.host.kind, "session")
            test.eq(before_call.payload.host.session_id, "session:one")
            test.eq(before_call.payload.agent.id, "agent:a")
            test.eq(before_call.payload.run_context.binding, "wippy.session.run_context:binding")
            test.eq(before_call.context.trait_id, "trait:session-audit")
        end)

        test.it("executes session tools under the ambient actor and scope", function()
            local actor: any = security.new_actor("user:one", {})
            local scope: any = security.named_scope("wippy.security:process")
            local result, err = funcs.new()
                :with_actor(actor)
                :with_scope(scope)
                :call("app:session_tool_runtime_capture", {})

            test.is_nil(err, "session_tool_runtime_capture: " .. tostring(err))
            test.not_nil(result)
            test.eq(result.completed, false)
            test.eq(result.tool_actor_id, "user:one")
            test.eq(result.tool_workspace_id, "workspace:one")
            test.eq(result.tool_host_kind, "session")
            test.eq(result.tool_call_id, "call:one")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
