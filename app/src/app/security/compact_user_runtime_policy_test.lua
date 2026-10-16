local test = require("test")
local registry = require("registry")
local security = require("security")
local json = require("json")
local coverage = require("policy_coverage")
local errors = require("errors")

local LEGACY = assert(json.decode([==[{"app.security:user.self_service":{"resources":["kickside.users.api:me.endpoint","kickside.users.api:update_me.endpoint","kickside.users.api:logout.endpoint","kickside.users.api:get_profile.endpoint","kickside.users.api:put_profile.endpoint"],"actions":"access","effect":"allow"},"app.security:user.profile_runtime":{"resources":["kickside.users.profile:*","kickside.users:profile_view"],"actions":["registry.get","registry.find","contract.get","contract.open","contract.call","contract.implementations","contract.security","funcs.call","funcs.security"],"effect":"allow"},"app.security:user.profile_env":{"resources":"kickside.users.env:database_resource","actions":"env.get","effect":"allow"},"app.security:user.app_shell_access":{"resources":["app.api.websocket:ws_endpoint.endpoint","userspace.dataflow.api:*","wippy.session.api:*"],"actions":"access","effect":"allow"},"app.security:user.view_registry_access":{"resources":["wippy.views.api:list_pages.endpoint","wippy.views.api:list_components.endpoint","wippy.views.api:find_by_tag.endpoint","wippy.views.api:render.endpoint","wippy.views.api:public_url.endpoint","wippy.views.api:list_routes.endpoint"],"actions":"access","effect":"allow"},"app.security:user.dataflow_state_view":{"resources":"page:userspace.dataflow.session.views:state","actions":"view","effect":"allow"},"app.security:user.dataflow_state_template":{"resources":"userspace.dataflow.session.views:templates","actions":"template.get","effect":"allow"},"app.security:user.dataflow_view_origin":{"resources":"userspace.dataflow.env:web_host_origin","actions":"env.get","effect":"allow"},"app.security:user.events_bus_access":{"resources":["keeper.events:bus"],"actions":"pg.open","effect":"allow"},"app.security:user.runtime_data_access":{"resources":["app:db","app:uploads","kickside.models:cache","app:cache"],"actions":["db.get","fs.get","store.get","store.info","store.key.get","store.key.list","store.key.set","store.key.delete","store.key.has"],"effect":"allow"},"app.security:user.runtime_registry_read":{"resources":["userspace.dataflow:*","userspace.dataflow.*","wippy.views:*","wippy.session:*","wippy.session.*","wippy.agent:*","wippy.agent.*","wippy.llm:*","wippy.llm.*","app.api.websocket:*","app.env:*"],"actions":["registry.get","registry.find"],"effect":"allow","conditions":[{"field":"resource","operator":"nin","value":["kickside.hub.instruments:recommender","kickside.hub.instruments:requirement_resolver"]}]},"app.security:user.navigation_registry":{"resources":["app.ui:*"],"actions":["registry.get","registry.find"],"effect":"allow"},"app.security:user.default_membership_registry":{"resources":["app.composition:default_member_enrollment","app.composition:core_member_enrollment"],"actions":["registry.get","registry.find"],"effect":"allow"},"app.security:user.documentation_registry":{"resources":["app:definition","app:documentation","app:documentation.*"],"actions":["registry.get","registry.find"],"effect":"allow"},"app.security:user.documentation_tool":{"resources":["app:documentation"],"actions":["funcs.call","funcs.security"],"effect":"allow"},"app.security:user.identity_resolution":{"resources":["kickside.users:scope_resolver_binding","kickside.users.binding:scope_resolver_func"],"actions":["contract.get","contract.open","funcs.call"],"effect":"allow"},"app.security:user.runtime_contracts":{"resources":["chestor.workspace:file_reap_stage","userspace.dataflow:*","userspace.dataflow.*","wippy.session:*","wippy.session.*","wippy.agent:*","wippy.agent.*","wippy.llm:*","wippy.llm.*","security"],"actions":["contract.get","contract.open","contract.call","contract.implementations","contract.security","funcs.call","funcs.security"],"effect":"allow"},"app.security:user.runtime_contract_methods":{"resources":"*","actions":["contract.call"],"effect":"allow"},"app.security:user.runtime_contract_context":{"resources":["context"],"actions":["contract.context"],"effect":"allow"},"app.security:user.runtime_function_context":{"resources":["context"],"actions":["funcs.context"],"effect":"allow"},"app.security:user.runtime_actor_delegation":{"resources":["system:knowledge.injection"],"actions":["security.actor.create"],"effect":"allow"},"app.security:user.runtime_process_context":{"resources":["context","security"],"actions":["process.context","process.security"],"effect":"allow"},"app.security:user.runtime_process_notifications":{"resources":["*"],"actions":["process.send"],"effect":"allow"},"app.security:user.runtime_session_spawn":{"resources":["wippy.session.process:plugin","wippy.session.process:session"],"actions":["process.spawn","process.spawn.monitored","process.spawn.linked"],"effect":"allow"},"app.security:user.runtime_session_access":{"resources":["session:*"],"actions":["read","write"],"effect":"allow"},"app.security:user.runtime_session_registry":{"resources":["session.*"],"actions":["process.registry.register","process.registry.unregister"],"effect":"allow"},"app.security:user.runtime_oauth_spawn":{"resources":["kickside.oauth.service:connection_negotiator"],"actions":["process.spawn"],"effect":"allow"},"app.security:user.runtime_process_host":{"resources":["app:processes"],"actions":["process.host"],"effect":"allow"},"app.security:user.runtime_oauth_registry":{"resources":["kickside.oauth.service:connection_negotiator:*"],"actions":["process.registry.register.consistent","process.registry.unregister.consistent"],"effect":"allow"},"app.security:user.runtime_env_read":{"resources":["PUBLIC_API_URL","ENCRYPTION_KEY","KICKSIDE_COMPONENT_DB_ID","KICKSIDE_THREAD_HYDRATION_DB_ID","KICKSIDE_THREADS_DB_ID","KICKSIDE_CORE_JOB_DB_ID","KICKSIDE_PROJECTION_DB_ID","KICKSIDE_PROJECTION_PROC_HOST","wippy.session.env:*","wippy.llm.openai:*","wippy.llm.openai_compat:*","wippy.llm.claude:*","wippy.llm.google.env:*","wippy.llm.bedrock:*","OPENAI_API_KEY","OPENAI_BASE_URL","OPENAI_ORGANIZATION","OPENAI_TIMEOUT","OPENAI_COMPAT_API_KEY","OPENAI_COMPAT_BASE_URL","OPENAI_COMPAT_ORGANIZATION","OPENAI_COMPAT_TIMEOUT","ANTHROPIC_API_KEY","ANTHROPIC_API_VERSION","ANTHROPIC_BASE_URL","ANTHROPIC_TIMEOUT","GEMINI_API_KEY","GOOGLE_CREDENTIALS","GOOGLE_CLOUD_PROJECT","AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","AWS_SESSION_TOKEN","AWS_REGION","AWS_DEFAULT_REGION","AWS_CONTAINER_CREDENTIALS_FULL_URI","AWS_CONTAINER_CREDENTIALS_RELATIVE_URI","AWS_CONTAINER_AUTHORIZATION_TOKEN","BEDROCK_BASE_URL","BEDROCK_TIMEOUT","OPENROUTER_API_KEY","TOGETHER_API_KEY","GROQ_API_KEY","FIREWORKS_API_KEY","MISTRAL_API_KEY","DEEPINFRA_API_KEY","XAI_API_KEY","CEREBRAS_API_KEY","kickside.users.env:baseline_group_id","kickside.users.env:default_group_id","kickside.users.env:admin_group_id","kickside.users.env:database_resource","APP_CACHE"],"actions":["env.get"],"effect":"allow"},"app.security:user.runtime_http_client":{"resources":["https://*","http://*"],"actions":["http_client.request"],"effect":"allow"},"app.security:user.runtime_http_private_ip":{"resources":"*","actions":["http_client.private_ip"],"effect":"allow"},"app.security:user.runtime_dataflow_registry":{"resources":["dataflow.*"],"actions":["process.registry.register","process.registry.unregister"],"effect":"allow","conditions":[{"field":"resource","operator":"matches","value":"^dataflow[.][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"}]},"app.security:user.runtime_dataflow_node_spawn":{"resources":["userspace.dataflow.node.agent:node","userspace.dataflow.node.cycle:cycle","userspace.dataflow.node.func:node","userspace.dataflow.node.parallel:parallel","userspace.dataflow.node.signal:node","userspace.dataflow.node.state:state"],"actions":["process.spawn","process.spawn.monitored","process.spawn.linked"],"effect":"allow"}}]==]))

local RETIRED = {
    ["app.security:user.self_service"] = true,
    ["app.security:user.profile_env"] = true,
    ["app.security:user.app_shell_access"] = true,
    ["app.security:user.view_registry_access"] = true,
    ["app.security:user.dataflow_view_origin"] = true,
    ["app.security:user.navigation_registry"] = true,
    ["app.security:user.default_membership_registry"] = true,
    ["app.security:user.documentation_registry"] = true,
    ["app.security:user.runtime_contract_methods"] = true,
    ["app.security:user.runtime_contract_context"] = true,
    ["app.security:user.runtime_function_context"] = true,
    ["app.security:user.runtime_process_notifications"] = true,
    ["app.security:user.runtime_session_spawn"] = true,
    ["app.security:user.runtime_env_read"] = true,
    ["app.security:user.runtime_http_private_ip"] = true,
    ["app.security:user.runtime_dataflow_node_spawn"] = true,
}

return {run = test.run_cases(function()
    test.describe("compact application runtime grants", function()
        test.it("preserves every legacy policy rule and every effective decision with fewer group grants", function()
            local previous, current, before_rules, after_rules = {}, {}, {}, {}
            local actions, resources = {}, { ["unrelated:item"] = true,
                ["kickside.hub.instruments:recommender"] = true,
                ["kickside.hub.instruments:requirement_resolver"] = true,
                ["dataflow.12345678-1234-1234-1234-123456789abc"] = true }
            local oracle_ids = {}
            local changes = assert(registry.snapshot()):changes()
            for id, rule in pairs(LEGACY) do
                if RETIRED[id] then
                    local entry, err = registry.get(id)
                    test.is_nil(entry, "retired policy remains declared: " .. id)
                    test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
                    local oracle_id = "app.security:legacy_runtime_oracle:" .. id:sub(#"app.security:" + 1)
                    oracle_ids[#oracle_ids + 1] = oracle_id
                    changes:create({id = oracle_id, kind = "security.policy", data = {policy = rule}})
                else
                    local entry, err = registry.get(id)
                    test.is_nil(err, tostring(err))
                    test.not_nil(entry, "active policy is missing: " .. id)
                    test.eq(assert(coverage.fingerprint(entry.data.policy)).digest, assert(coverage.fingerprint(rule)).digest,
                        "active policy changed: " .. id)
                    previous[#previous + 1] = assert(security.policy(id))
                end
                before_rules[#before_rules + 1] = rule
            end
            test.is_nil(select(2, changes:apply()))
            for _, oracle_id in ipairs(oracle_ids) do
                previous[#previous + 1] = assert(security.policy(oracle_id))
            end
            for _, entry in ipairs(assert(registry.find({[".kind"] = "security.policy"}))) do
                if tostring(entry.id):sub(1, 13) == "app.security:" then
                    for _, group in ipairs(entry.data.groups or {}) do
                        if group == "app.security:user" then
                            current[#current + 1] = assert(security.policy(tostring(entry.id)))
                            after_rules[#after_rules + 1] = entry.data.policy
                        end
                    end
                end
            end
            test.is_true(#current < #previous, "application still expresses duplicate runtime grants separately")
            test.is_false(assert(coverage.compare_rules(before_rules, after_rules)).reduced)
            test.is_false(assert(coverage.compare_rules(after_rules, before_rules)).reduced)
            for _, rule in ipairs(before_rules) do
                local aa = type(rule.actions) == "table" and rule.actions or {rule.actions}
                local rr = type(rule.resources) == "table" and rule.resources or {rule.resources}
                for _, value in ipairs(aa) do actions[value] = true end
                for _, value in ipairs(rr) do
                    resources[value] = true
                    if value:sub(-1) == "*" then
                        resources[value:sub(1, -2) .. "probe"] = true
                        resources[value:sub(1, -2) .. "adjacent:probe"] = true
                    end
                end
            end
            local before, after = assert(security.new_scope(previous)), assert(security.new_scope(current))
            for _, actor_id in ipairs({"member", "administrator", "system:knowledge.injection"}) do
                local actor = assert(security.new_actor(actor_id, {}))
                for action in pairs(actions) do
                    for resource in pairs(resources) do
                        test.eq(after:evaluate(actor, action, resource), before:evaluate(actor, action, resource),
                            actor_id .. " " .. action .. " " .. resource)
                    end
                end
            end
            changes = assert(registry.snapshot()):changes()
            for _, oracle_id in ipairs(oracle_ids) do changes:delete(oracle_id) end
            test.is_nil(select(2, changes:apply()))
        end)
    end)
end)}
