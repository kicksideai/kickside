local test = require("test")
local registry = require("registry")
local models_repo = require("models_repo")
local catalog_policy = require("catalog_policy")
local catalog_card_policy = require("catalog_card_policy")
local provider_read_model = require("provider_read_model")
local model_catalog = require("model_catalog")
local model_mapper = require("model_mapper")
local models_types = require("models_types")
local provider_registry = require("provider_registry")
local provider_openai_like = require("provider_openai_like")
local openai_compat_plain_generate = require("openai_compat_plain_generate")

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if entry[key] ~= nil then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function has_process_scope(entry: any): boolean
    local lifecycle = value(entry, "lifecycle")
    if type(lifecycle) ~= "table" or type(lifecycle.security) ~= "table" then
        return false
    end
    local groups = lifecycle.security.groups
    if type(groups) ~= "table" then
        return false
    end
    for _, group_id in ipairs(groups) do
        if group_id == "wippy.security:process" then return true end
    end
    return false
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function has(list: any, expected: string): boolean
    if type(list) ~= "table" then return false end
    for _, item in ipairs(list) do
        if item == expected then return true end
    end
    return false
end

local function allowed_class(name: string): boolean
    return name == "fast"
        or name == "nano"
        or name == "balanced"
        or name == "premium"
        or name == "embed"
end

local function fake_error_builder(): any
    local builder = {}
    function builder:classifier(_classifier: any): any return self end
    function builder:kind(kind: string): any
        self._kind = kind
        return self
    end
    function builder:message(message: string): any
        self._message = message
        return self
    end
    function builder:from(info: any): any
        self._kind = info and info.kind or self._kind or "server_error"
        self._message = info and info.message or self._message or "error"
        self._status_code = info and info.status_code or self._status_code
        return self
    end
    function builder:build(): any
        local kind = self._kind or "server_error"
        local message = self._message or "error"
        return {
            success = false,
            error = kind,
            error_message = message,
            metadata = { status_code = self._status_code },
            kind = function() return kind end,
            message = function() return message end,
        }
    end
    return builder
end

local function fake_output(streamer: any): any
    return {
        ERROR_TYPE = { INVALID_REQUEST = "invalid_request" },
        errors = {
            generate = function(_args: any): any
                return fake_error_builder()
            end,
        },
        streamer = function(pid: string, topic: string, buffer_size: number): any
            streamer.pid = pid
            streamer.topic = topic
            streamer.buffer_size = buffer_size
            return streamer
        end,
    }
end

local function fake_mapper(): any
    return {
        classify_error = function(err: any): any return err end,
        map_messages = function(_messages: any, _options: any): any
            return {
                { role = "system", content = { { type = "text", text = "sys" } } },
                { role = "user", content = { { type = "text", text = "hello" }, { content = " world" } } },
                { role = "assistant", content = { { type = "text", text = "left rich" } } },
            }
        end,
        map_options = function(options: any): any return options or {} end,
        map_tokens = function(usage: any): any return usage or {} end,
        map_finish_reason = function(reason: any): any return reason end,
        map_success_response = function(response: any, _context: any): any
            return {
                success = true,
                result = { content = response.content or "", tool_calls = {} },
                metadata = response.metadata or {},
            }
        end,
        map_tool_calls = function(calls: any, _tool_name_map: any): any
            return {
                {
                    id = calls[1].id,
                    name = calls[1]["function"].name,
                    arguments = calls[1]["function"].arguments,
                },
            }
        end,
        extract_reasoning_text = function(details: any): any return details end,
    }
end

local function with_plain_generate_mocks(client: any, mapper: any, output: any, fn: () -> ()): any
    local original_client = openai_compat_plain_generate._client
    local original_mapper = openai_compat_plain_generate._mapper
    local original_output = openai_compat_plain_generate._output

    openai_compat_plain_generate._client = client
    openai_compat_plain_generate._mapper = mapper
    openai_compat_plain_generate._output = output

    local results = { pcall(fn) }

    openai_compat_plain_generate._client = original_client
    openai_compat_plain_generate._mapper = original_mapper
    openai_compat_plain_generate._output = original_output

    if not results[1] then error(results[2]) end
    table.remove(results, 1)
    return table.unpack(results)
end

local function define_tests()
    test.describe("kickside.models packaging", function()
        -- The suite owns every profile and card it writes; a persistent
        -- database (postgres) must start each case without earlier rows.
        local FIXTURE_PROFILES = {
            "profile-config-scrub-test", "vertex-ambiguous-auth-test", "vertex-project-context-test",
            "event-openai-test", "vertex-topology-a", "vertex-topology-b",
            "delete-profile-cards-test", "local-test",
        }
        local FIXTURE_CARDS = { "public-scrub-test", "retry-card-normalize", "db-class-test", "disabled-db-model" }

        local function remove_fixtures()
            for _, id in ipairs(FIXTURE_PROFILES) do
                local _, err = models_repo.delete_profile(id)
                test.is_nil(err)
            end
            for _, name in ipairs(FIXTURE_CARDS) do
                local _, err = models_repo.delete_card(name)
                test.is_nil(err)
            end
        end

        test.before_all(remove_fixtures)
        test.after_each(remove_fixtures)


        test.it("keeps shipped model classes compact", function()
            local entries, err = registry.find({ ["meta.type"] = "llm.model" })
            test.is_nil(err)
            for _, entry in ipairs(entries or {}) do
                local m = meta(entry) or {}
                for _, class_name in ipairs(m.class or {}) do
                    test.is_true(allowed_class(class_name), "unexpected model class: " .. tostring(class_name))
                end
            end
        end)


        test.it("publishes provider discovery adapters behind the discovery port", function()
            for _, id in ipairs({
                "kickside.models.discovery:model_discovery",
                "kickside.models.discovery:common",
                "kickside.models.discovery:mapper",
                "kickside.models.discovery:provider.openai_like",
                "kickside.models.discovery:provider.anthropic",
                "kickside.models.discovery:provider.google_genai",
                "kickside.models.discovery:provider.bedrock",
                "kickside.models.discovery:provider_registry",
            }) do
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.not_nil(entry, id .. " is missing")
                test.eq(value(entry, "kind"), "library.lua")
            end
        end)



        test.it("publishes the model resolver binding", function()
            local entry, err = registry.get("kickside.models:model_resolver")
            test.is_nil(err)
            test.not_nil(entry)
            test.eq(value(entry, "kind"), "contract.binding")
        end)

        test.it("declares provider presets and editor web components", function()
            local presets = provider_read_model.presets()
            local by_key = {}
            for _, preset in ipairs(presets) do
                by_key[preset.key] = preset
            end
            test.not_nil(by_key["openrouter"])
            test.eq(by_key["openrouter"].provider_id, "wippy.llm.openai_compat:provider")
            test.eq(by_key["openrouter"].config.base_url, "https://openrouter.ai/api/v1")
            test.eq(by_key["openrouter"].config.api_key_env, "OPENROUTER_API_KEY")
            test.not_nil(by_key["openai-compatible-plain"])
            test.eq(by_key["openai-compatible-plain"].provider_id, "kickside.models:openai_compat_plain.provider")
            test.not_nil(by_key["anthropic"])
            test.eq(by_key["anthropic"].profile_editor_tag, "kickside-model-provider-anthropic")
            test.not_nil(by_key["google-gemini"])
            test.not_nil(by_key["google-vertex"])
            test.eq(by_key["google-vertex"].config.project_env, "GOOGLE_CLOUD_PROJECT")
            test.eq(by_key["google-vertex"].config.google_credentials_env, "GOOGLE_CREDENTIALS")
            test.not_nil(by_key["bedrock"])
            test.not_nil(by_key["groq"])
            test.not_nil(by_key["mistral"])

            local editors = provider_read_model.adapters()
            local adapter_by_provider = {}
            for _, adapter in ipairs(editors) do
                adapter_by_provider[adapter.id] = adapter
            end
            test.eq(adapter_by_provider["wippy.llm.openai:provider"].profile_editor_tag, "kickside-model-provider-openai")
            test.eq(adapter_by_provider["wippy.llm.openai:provider"].discoverable, true)
            test.eq(adapter_by_provider["kickside.models:openai_compat_plain.provider"].profile_editor_tag, "kickside-model-provider-openai-compatible")
            test.eq(adapter_by_provider["kickside.models:openai_compat_plain.provider"].discoverable, true)
            test.eq(adapter_by_provider["wippy.llm.claude:provider"].profile_editor_tag, "kickside-model-provider-anthropic")
            test.eq(adapter_by_provider["wippy.llm.claude:provider"].discoverable, true)
            test.eq(adapter_by_provider["wippy.llm.google.generative_ai:provider"].profile_editor_tag, "kickside-model-provider-google-generative-ai")
            test.eq(adapter_by_provider["wippy.llm.google.generative_ai:provider"].discoverable, true)
            test.eq(adapter_by_provider["wippy.llm.google.vertex:provider"].profile_editor_tag, "kickside-model-provider-google-vertex")
            test.eq(adapter_by_provider["wippy.llm.google.vertex:provider"].discoverable, false)
            test.eq(adapter_by_provider["wippy.llm.bedrock:provider"].profile_editor_tag, "kickside-model-provider-bedrock")
            test.eq(adapter_by_provider["wippy.llm.bedrock:provider"].discoverable, true)

            local editor_entries = registry.find({
                [".kind"] = "registry.entry",
                ["meta.type"] = "kickside.models:provider_profile_editor",
            }) or {}
            local editor_tags = {}
            for _, entry in ipairs(editor_entries) do
                local tag = value(entry, "tag_name")
                if type(tag) == "string" and tag ~= "" then editor_tags[tag] = true end
            end
            for _, preset in ipairs(presets) do
                if type(preset.profile_editor_tag) == "string" and preset.profile_editor_tag ~= "" then
                    test.is_true(editor_tags[preset.profile_editor_tag],
                        "preset profile_editor_tag must resolve as provider_profile_editor: " .. preset.profile_editor_tag)
                end
            end
            for _, adapter in ipairs(editors) do
                if type(adapter.profile_editor_tag) == "string" and adapter.profile_editor_tag ~= "" then
                    test.is_true(editor_tags[adapter.profile_editor_tag],
                        "adapter profile_editor_tag must resolve as provider_profile_editor: " .. adapter.profile_editor_tag)
                end
            end
        end)


        test.it("starts with no DB provider profiles", function()
            local profiles = models_repo.list_profiles_public()
            test.eq(#profiles, 0)
        end)


        -- Retry rides two declared surfaces: the profile's policy travels in
        -- the provider context (the llm layer's default), a card's own policy
        -- in its options (the caller override). A card's retry is normalized
        -- on write the same way a profile's is — garbage never persists.











    end)



end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
