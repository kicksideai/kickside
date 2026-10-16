local test = require("test")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local registry = require("registry")
local security = require("security")
local agent_ref = require("agent_ref")

local TOOL = "kickside.agents.traits:platform_manager_tool"
local PROC_SCOPE = "wippy.security:process"

local function executor(): any
    local actor: any = security.new_actor("platform_manager_test_user", {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function define_tests()
    test.describe("Platform manager trait", function()
        local exec: any
        local agent_id: string?
        local connection_id: string?
        local reply_provider_id: string?
        local agent_name = "pm_test_" .. uuid_v4():sub(1, 8)
        local connection_name = "pm_conn_" .. uuid_v4():sub(1, 8)
        local reply_name = "pm_reply_" .. uuid_v4():sub(1, 8)

        test.before_all(function()
            exec = executor()
        end)

        test.it("does not pull the optional Knowledge module", function()
            test.is_nil((registry.get("kickside.agents:dep.kickside.knowledge")))
            local result, err = exec:call(TOOL, { action = "list_knowledge_bases" })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(tostring(err), "unknown action")
        end)

        test.after_all(function()
            if exec and agent_id then
                exec:call(TOOL, { action = "delete_agent", component_id = agent_id })
            end
            if exec and connection_id then
                exec:call(TOOL, { action = "delete_connection", component_id = connection_id })
            end
            if exec and reply_provider_id then
                exec:call(TOOL, { action = "delete_reply_provider", component_id = reply_provider_id })
            end
        end)

        test.it("lists public traits including itself", function()
            local result, err = exec:call(TOOL, { action = "list_traits", q = "platform", limit = 10 })
            test.is_nil(err)
            local seen = false
            for _, row in ipairs(result.traits or {}) do
                if row.id == "kickside.agents.traits:platform_manager" then seen = true end
            end
            test.is_true(seen, "platform manager trait missing from trait catalog")
        end)

        test.it("lists public tools as compact rows and returns schemas only when requested", function()
            local result, err = exec:call(TOOL, { action = "list_tools", namespace = "app", q = "Public tool probe" })
            test.is_nil(err)
            local probe_seen = false
            local platform_seen = false
            for _, row in ipairs(result.tools or {}) do
                if row.id == "app:public_tool_probe" then
                    probe_seen = true
                    test.eq(row.title, "Public tool probe")
                    test.is_nil(row.input_schema)
                    test.is_nil(row.output_schema)
                    test.is_nil(row.modules)
                end
                if row.id == TOOL then platform_seen = true end
            end
            test.is_true(probe_seen, "public tool missing from catalog")
            test.is_false(platform_seen, "control tool leaked into catalog")

            local detailed, detailed_err = exec:call(TOOL, {
                action = "list_tools",
                namespace = "app",
                q = "Public tool probe",
                fields = { "input_schema", "output_schema", "modules" },
            })
            test.is_nil(detailed_err)
            test.eq(#detailed.tools, 1)
            test.eq(type(detailed.tools[1].input_schema), "table")
            test.eq(type(detailed.tools[1].modules), "table")
        end)

        test.it("pages public tools in id order with a cursor", function()
            local seen: { string } = {}
            local cursor: string? = nil
            repeat
                local page, err = exec:call(TOOL, { action = "list_tools", namespace = "app", limit = 1, cursor = cursor })
                test.is_nil(err)
                test.is_true(#page.tools <= 1)
                for _, row in ipairs(page.tools) do seen[#seen + 1] = row.id end
                cursor = page.next_cursor
            until cursor == nil
            test.is_true(#seen >= 1)
            for index = 2, #seen do test.is_true(seen[index] > seen[index - 1]) end
            local _, invalid_err = exec:call(TOOL, { action = "list_tools", limit = 0 })
            test.not_nil(invalid_err)
        end)

        test.it("pages registry-backed catalogs in id order with a cursor", function()
            for _, spec in ipairs({
                { action = "list_traits", key = "traits" },
                { action = "list_component_kinds", key = "component_kinds" },
                { action = "list_connection_providers", key = "connection_providers" },
            }) do
                local whole, whole_err = exec:call(TOOL, { action = spec.action, limit = 100 })
                test.is_nil(whole_err)
                test.is_nil(whole.next_cursor, spec.action .. " fits one page of 100")
                local seen: { string } = {}
                local cursor: string? = nil
                repeat
                    local page, err = exec:call(TOOL, { action = spec.action, limit = 1, cursor = cursor })
                    test.is_nil(err)
                    test.is_true(#page[spec.key] <= 1)
                    for _, row in ipairs(page[spec.key]) do seen[#seen + 1] = row.id end
                    cursor = page.next_cursor
                until cursor == nil
                test.eq(#seen, #whole[spec.key], spec.action .. " pages cover the whole catalog")
                for index = 2, #seen do test.is_true(seen[index] > seen[index - 1]) end
            end
        end)

        test.it("lists registry-declared component kinds without schemas by default", function()
            local result, err = exec:call(TOOL, { action = "list_component_kinds", q = "User Agent", limit = 20 })
            test.is_nil(err)
            local seen = false
            for _, row in ipairs(result.component_kinds or {}) do
                if row.id == "kickside.agents:user_agent" then
                    seen = true
                    test.eq(type(row.contracts), "table")
                    test.is_nil(row.component)
                    test.is_nil(row.ports)
                end
            end
            test.is_true(seen, "user_agent component kind missing from component kind catalog")

            local detailed, detailed_err = exec:call(TOOL, {
                action = "list_component_kinds",
                q = "User Agent",
                limit = 20,
                fields = { "component" },
            })
            test.is_nil(detailed_err)
            test.eq(type(detailed.component_kinds[1].component), "table")
        end)

        test.it("upserts a user agent through the canonical agents registry", function()
            local result, err = exec:call(TOOL, {
                action = "upsert_agent",
                name = agent_name,
                model = "class:fast",
                prompt = "You are a platform-manager-created test agent.",
                traits = { "kickside.agents.traits:time_aware" },
            })
            test.is_nil(err)
            test.is_nil(result.success)
            test.is_true(result.created)
            agent_id = result.agent.component_id
            test.not_nil(agent_id)
        end)

        test.it("upsert is idempotent on the agent name", function()
            local result, err = exec:call(TOOL, {
                action = "upsert_agent",
                name = agent_name,
            })
            test.is_nil(err)
            test.eq(result.created, false)
            test.eq(result.agent.component_id, agent_id)
        end)

        -- component_id_from delegates to agent_ref for id extraction. Exercise it
        -- through the real agent created above with both the prefixed ref and the
        -- bare component id; both forms must resolve identically.
        test.it("resolves the same agent from the prefixed and bare agent_id form", function()
            local prefixed = agent_ref.user(agent_id :: string)

            local via_prefixed, perr = exec:call(TOOL, {
                action = "update_agent", agent_id = prefixed, description = "via prefixed ref",
            })
            test.is_nil(perr)
            test.eq(via_prefixed.component_id, agent_id)

            local via_bare, berr = exec:call(TOOL, {
                action = "update_agent", agent_id = agent_id, description = "via bare component id",
            })
            test.is_nil(berr)
            test.eq(via_bare.component_id, agent_id)
        end)

        test.it("lists agents with compact rows and the canonical user_agent: ref", function()
            local result, err = exec:call(TOOL, { action = "list_agents", q = agent_name })
            test.is_nil(err)
            local seen = false
            for _, row in ipairs(result.agents or {}) do
                if row.component_id == agent_id then
                    seen = true
                    test.eq(row.agent_id, agent_ref.user(agent_id :: string))
                    test.is_nil(row.description)
                end
            end
            test.is_true(seen, "created agent missing from list_agents")

            local detailed, detailed_err = exec:call(TOOL, {
                action = "list_agents", q = agent_name, fields = { "description" },
            })
            test.is_nil(detailed_err)
            test.eq(type(detailed.agents[1].description), "string")
        end)

        test.it("lists visible components as summaries unless fields request metadata", function()
            local result, err = exec:call(TOOL, { action = "list_components", class = "agent", q = agent_name, limit = 20 })
            test.is_nil(err)
            local seen = false
            for _, row in ipairs(result.components or {}) do
                if row.component_id == agent_id then
                    seen = true
                    test.eq(row.class, "agent")
                    test.is_nil(row.meta)
                end
            end
            test.is_true(seen, "created agent missing from component read port")

            local detailed, detailed_err = exec:call(TOOL, {
                action = "list_components", class = "agent", q = agent_name, limit = 20, fields = { "meta" },
            })
            test.is_nil(detailed_err)
            test.eq(type(detailed.components[1].meta), "table")
        end)

        test.it("filters agents and components by q in the query and pages them with next_offset", function()
            local second, second_err = exec:call(TOOL, { action = "upsert_agent", name = agent_name .. "_second", model = "class:fast" })
            test.is_nil(second_err)
            local second_id = second.agent.component_id
            for _, spec in ipairs({
                { action = "list_agents", key = "agents" },
                { action = "list_components", key = "components", class = "agent" },
            }) do
                local first, first_err = exec:call(TOOL, { action = spec.action, class = spec.class, q = string.upper(agent_name), limit = 1 })
                test.is_nil(first_err)
                test.eq(#first[spec.key], 1)
                test.eq(first.next_offset, 1, spec.action)
                local rest, rest_err = exec:call(TOOL, { action = spec.action, class = spec.class, q = agent_name, limit = 1, offset = first.next_offset })
                test.is_nil(rest_err)
                test.eq(#rest[spec.key], 1)
                test.is_nil(rest.next_offset, spec.action)
                local ids = { first[spec.key][1].component_id, rest[spec.key][1].component_id }
                table.sort(ids)
                local expected = { agent_id, second_id }
                table.sort(expected)
                test.eq(table.concat(ids, ","), table.concat(expected, ","), spec.action)
            end
            exec:call(TOOL, { action = "delete_agent", component_id = second_id })
        end)

        test.it("manages connections through the connection registry contract", function()
            local providers, provider_err = exec:call(TOOL, { action = "list_connection_providers", q = "jira" })
            test.is_nil(provider_err)
            local provider_seen = false
            for _, row in ipairs(providers.connection_providers or {}) do
                if row.provider == "jira" then
                    provider_seen = true
                    test.eq(type(row.contracts), "table")
                end
            end
            test.is_true(provider_seen, "jira provider missing from registry-driven provider list")

            local created, create_err = exec:call(TOOL, {
                action = "upsert_connection",
                provider = "jira",
                name = connection_name,
                auth = { token = "test-token" },
                validate = true,
            })
            test.is_nil(create_err)
            test.is_true(created.created)
            connection_id = created.connection.component_id
            test.not_nil(connection_id)

            local validated, validate_err = exec:call(TOOL, { action = "validate_connection", component_id = connection_id })
            test.is_nil(validate_err)
            test.is_true(validated.ok)

            local listed, list_err = exec:call(TOOL, { action = "list_connections", provider = "jira", q = connection_name })
            test.is_nil(list_err)
            test.eq(type(listed.connections), "table")
            test.eq(#listed.connections, 1)
            test.eq(listed.connections[1].component_id, connection_id)
            test.is_nil(listed.next_offset)
        end)

        test.it("manages reply providers through the reply-provider registry contract", function()
            local kinds, kind_err = exec:call(TOOL, { action = "list_reply_provider_kinds", q = "discord" })
            test.is_nil(kind_err)
            local kind_seen = false
            for _, row in ipairs(kinds.reply_provider_kinds or {}) do
                if row.provider == "discord" then kind_seen = true end
            end
            test.is_true(kind_seen, "discord reply provider kind missing")

            local created, create_err = exec:call(TOOL, {
                action = "upsert_reply_provider",
                provider = "discord",
                name = reply_name,
                auth = { token = "test-token" },
            })
            test.is_nil(create_err)
            test.is_true(created.created)
            reply_provider_id = created.reply_provider.component_id
            test.not_nil(reply_provider_id)

            local listed, list_err = exec:call(TOOL, { action = "list_reply_providers", provider = "discord", q = reply_name })
            test.is_nil(list_err)
            test.eq(type(listed.reply_providers), "table")
            test.eq(#listed.reply_providers, 1)
            test.eq(listed.reply_providers[1].component_id, reply_provider_id)
            test.is_nil(listed.next_offset)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
