-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local json = require("json")
local repo = require("repo")
local discovery = require("discovery")
local http_fixture = require("http_fixture")
local fake_http = require("fake_http")
local discover_handler = require("discover_handler")
local test_handler = require("test_handler")
local openai = require("openai")
local bedrock = require("bedrock")
local bedrock_credentials = require("bedrock_credentials")
local adapters = {openai, require("anthropic"), require("google"), bedrock}
local sentinel = "provider-body-credential-sentinel"

local function profile()
    return {provider_id = "wippy.llm.openai_compat:provider", config = {base_url = "https://example.invalid"},
        secret_config = {api_key = "test-key", access_key = "test-access", secret_key = "test-secret"}}
end

local function check(message, diagnostics, kind, retryable, status)
    test.eq(type(message), "string")
    test.not_nil(diagnostics)
    test.eq(diagnostics.kind, kind)
    test.eq(diagnostics.retryable, retryable)
    test.eq(diagnostics.status_code, status)
    test.is_nil(diagnostics.message)
    test.is_nil(diagnostics.details)
    test.contains(message, kind)
    if status then test.contains(message, "HTTP " .. tostring(status)) end
    test.is_nil((assert(json.encode({message, diagnostics})):find(sentinel, 1, true)))
end

return {run = test.run_cases(function()
    test.describe("Bedrock discovery credentials", function()
        local function prepare()
            bedrock_credentials.prepare({
                access_key = "role-access", secret_key = "role-secret", session_token = "role-session",
            })
            http_fixture.prepare({ status_code = 200, body = '{"modelSummaries":[]}' }, nil)
        end

        test.it("signs the discovery request with temporary credentials for a role-only profile", function()
            prepare()
            assert(bedrock.fetch({ config = { region = "us-west-2" } }))
            local request = assert(http_fixture.last_get())
            test.eq(request.url, "https://bedrock.us-west-2.amazonaws.com/foundation-models")
            test.eq(request.headers["x-amz-security-token"], "role-session")
            test.contains(request.headers.Authorization, "Credential=role-access/")
            test.contains(request.headers.Authorization, "/us-west-2/bedrock/aws4_request")
            test.eq(bedrock_credentials.calls(), 1)
        end)

        test.it("keeps explicit credentials and the configured endpoint", function()
            prepare()
            local configured = profile()
            configured.secret_config.session_token = "profile-session"
            assert(bedrock.fetch(configured))
            local request = assert(http_fixture.last_get())
            test.eq(request.url, "https://example.invalid/foundation-models")
            test.eq(request.headers["x-amz-security-token"], "profile-session")
            test.contains(request.headers.Authorization, "Credential=test-access/")
            test.eq(bedrock_credentials.calls(), 0)
        end)

        test.it("reports incomplete and unavailable credentials without contacting Bedrock", function()
            prepare()
            local rows, _, diagnostics = bedrock.fetch({ config = {}, secret_config = { access_key = "profile-access" } })
            test.is_nil(rows)
            test.eq(diagnostics.code, "aws_credentials_incomplete")
            test.eq(bedrock_credentials.calls(), 0)
            test.is_nil(http_fixture.last_get())

            bedrock_credentials.prepare(nil)
            rows, _, diagnostics = bedrock.fetch({ config = {} })
            test.is_nil(rows)
            test.eq(diagnostics.code, "aws_credentials_unavailable")
            test.eq(bedrock_credentials.calls(), 1)
            test.is_nil(http_fixture.last_get())
        end)

        test.it("does not sign a custom destination with the host role", function()
            prepare()
            local rows, _, diagnostics = bedrock.fetch({ config = { base_url = "https://example.invalid" } })
            test.is_nil(rows)
            test.eq(diagnostics.code, "aws_role_endpoint_required")
            test.eq(bedrock_credentials.calls(), 0)
            test.is_nil(http_fixture.last_get())
        end)
    end)

    test.describe("provider discovery references", function()
        test.it("fails a discovery whose api_key_env names a variable that does not resolve, naming the reference", function()
            local saved = assert(repo.create_profile({name = "Provider discovery unresolved key",
                provider_id = "wippy.llm.openai_compat:provider",
                config = {base_url = "https://example.invalid", api_key_env = "MODELS_UNDECLARED_KEY"}}))
            local original = discovery.adapter_for
            discovery.adapter_for = function() return openai end
            local ok, err = pcall(function()
                http_fixture.prepare({status_code = 200, body = '{"data":[]}'}, nil)
                local result, failure = discovery.discover(saved.id)
                test.is_nil(result)
                test.contains(tostring(failure), "model discovery failed: api_key_env MODELS_UNDECLARED_KEY does not resolve")
                test.eq(assert(repo.get_profile(saved.id)).status, "unhealthy")
            end)
            discovery.adapter_for = original
            assert(repo.delete_profile(saved.id))
            if not ok then error(err, 0) end
        end)
    end)

    test.describe("provider discovery timeout", function()
        test.it("uses saved timeout strings and environment durations for discovery and connection probes", function()
            local saved = assert(repo.create_profile({name = "Provider discovery timeout",
                provider_id = "wippy.llm.openai_compat:provider", api_key = "test-key",
                config = {timeout = "60.25", timeout_env = "MODELS_DISCOVERY_TIMEOUT"}}))
            local original = discovery.adapter_for
            discovery.adapter_for = function() return openai end
            local ok, err = pcall(function()
                local function check_requests(expected)
                    http_fixture.prepare({status_code = 200, body = '{"data":[]}'}, nil)
                    assert(discovery.discover(saved.id))
                    test.eq(http_fixture.timeout(), expected)
                    http_fixture.prepare({status_code = 200, body = "{}"}, nil)
                    assert(discovery.test(saved.id, {model = "test-model"}))
                    test.eq(http_fixture.timeout(), expected)
                end

                check_requests("60250ms")
                assert(repo.update_profile(saved.id, {timeout = ""}))
                check_requests("1500ms")
                assert(repo.update_profile(saved.id, {config = {timeout_env = "MODELS_VERTEX_CREDS_A"}}))
                check_requests("30000ms")
            end)
            discovery.adapter_for = original
            assert(repo.delete_profile(saved.id))
            if not ok then error(err, 0) end
        end)
    end)

    test.describe("OpenAI profile generation probe", function()
        local function prepare_models(ids)
            local items = {}
            for _, id in ipairs(ids) do table.insert(items, { id = id }) end
            http_fixture.prepare_probe(assert(json.encode({ data = items })))
        end

        local function first_party()
            local value = profile()
            value.provider_id = "wippy.llm.openai:provider"
            return value
        end

        test.it("selects a model for Responses past completions-only, embedding, and image entries", function()
            prepare_models({ "babbage-002", "gpt-3.5-turbo-instruct", "text-embedding-3-small", "gpt-image-2", "gpt-4o-mini" })
            local result = assert(openai.test(first_party(), {}))
            test.eq(result.model, "gpt-4o-mini")
            test.eq(result.mode, "responses")
            local request = assert(http_fixture.probe())
            test.eq(request.url, "https://example.invalid/responses")
            local body = assert(json.decode(request.body))
            test.eq(body.model, "gpt-4o-mini")
        end)

        test.it("reports the authenticated model list when no generation model is available", function()
            prepare_models({ "text-embedding-3-small", "davinci-002", "gpt-4o-search-preview",
                "gpt-4o-mini-search-preview-2025-03-11" })
            local result = assert(openai.test(first_party(), {}))
            test.eq(result.mode, "models")
            test.eq(result.count, 4)
            test.is_nil(http_fixture.probe())
        end)

        test.it("can probe a reasoning model that is only available through Responses", function()
            prepare_models({ "text-embedding-3-small", "o3-pro" })
            local result = assert(openai.test(first_party(), {}))
            test.eq(result.model, "o3-pro")
            local request = assert(http_fixture.probe())
            test.eq(request.url, "https://example.invalid/responses")
            local body = assert(json.decode(request.body))
            test.eq(body.input, "ping")
            test.eq(body.max_output_tokens, 16)
            test.eq(body.store, false)
            test.is_nil(body.temperature)
        end)

        test.it("keeps configured overrides and does not apply OpenAI naming rules to compatible providers", function()
            prepare_models({ "babbage-002" })
            local result = assert(openai.test(profile(), {}))
            test.eq(result.model, "babbage-002")
            test.eq(result.mode, "chat_completions")
            test.eq(assert(http_fixture.probe()).url, "https://example.invalid/chat/completions")

            local explicit = first_party()
            explicit.config.test_model = "configured-chat-model"
            result = assert(openai.test(explicit, {}))
            test.eq(result.model, "configured-chat-model")
            result = assert(openai.test(explicit, { model = "requested-chat-model" }))
            test.eq(result.model, "requested-chat-model")
        end)
    end)

    test.describe("provider error classification", function()
        local anthropic, google = adapters[2], adapters[3]
        local cases = {
            {"HTTP 401", openai, 401, "{}", "invalid_key"},
            {"HTTP 403", openai, 403, "{}", "invalid_key"},
            {"HTTP 402", openai, 402, "{}", "insufficient_credits"},
            {"Anthropic 400 low credit balance", anthropic, 400,
                '{"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low to access the Anthropic API."}}',
                "insufficient_credits"},
            {"OpenAI 429 insufficient_quota", openai, 429,
                '{"error":{"message":"You exceeded your current quota.","type":"insufficient_quota","code":"insufficient_quota"}}',
                "insufficient_credits"},
            {"plain 429", openai, 429, '{"error":{"message":"Rate limit reached","type":"requests"}}', "rate_limited"},
            {"Google 400 invalid key", google, 400,
                '{"error":{"code":400,"message":"API key not valid.","status":"INVALID_ARGUMENT","details":[{"reason":"API_KEY_INVALID"}]}}',
                "invalid_key"},
            {"other 400", anthropic, 400, '{"error":{"type":"invalid_request_error","message":"max_tokens"}}', nil},
        }
        for _, row in ipairs(cases) do
            test.it("classifies " .. row[1], function()
                http_fixture.prepare({status_code = row[3], body = row[4]}, nil)
                local probe = row[2].test_generation or row[2].test
                local result, message, diagnostics = probe(profile(), {model = "probe-model"})
                test.is_nil(result)
                test.not_nil(diagnostics)
                test.eq(diagnostics.status_code, row[3])
                test.eq(diagnostics.error_type, row[5])
                test.is_nil((assert(json.encode({message, diagnostics})):find("credit balance is too low", 1, true)))
            end)
        end

        test.it("does not return the provider body", function()
            http_fixture.prepare({status_code = 402, body = sentinel}, nil)
            local _, message, diagnostics = openai.test(profile(), {model = "probe-model"})
            test.eq(diagnostics.error_type, "insufficient_credits")
            test.is_nil((assert(json.encode({message, diagnostics})):find(sentinel, 1, true)))
        end)

        test.it("keeps ordinary connection checks list-only for Anthropic and Google", function()
            local saved = assert(repo.create_profile({name = "List-only connection check",
                provider_id = "wippy.llm.openai_compat:provider", api_key = "test-key",
                config = {base_url = "https://example.invalid"}}))
            local original = discovery.adapter_for
            local ok, err = pcall(function()
                for _, adapter in ipairs({anthropic, google}) do
                    discovery.adapter_for = function() return adapter end
                    http_fixture.prepare_probe('{"models":[{"id":"sample","supportedActions":["generateContent"]}]}')
                    test.eq(assert(discovery.test(saved.id, {})).mode, "models")
                    test.is_nil(http_fixture.probe())
                    assert(discovery.test(saved.id, {generation = true}))
                    test.not_nil(http_fixture.probe())
                end
            end)
            discovery.adapter_for = original
            assert(repo.delete_profile(saved.id))
            if not ok then error(err, 0) end
        end)

        test.it("probes Anthropic and Google with one generated token", function()
            http_fixture.prepare_probe('{"data":[{"id":"claude-opus-x"},{"id":"claude-haiku-x"}]}')
            local result = assert(anthropic.test_generation(profile(), {}))
            test.eq(result.model, "claude-haiku-x")
            local request = assert(http_fixture.probe())
            test.eq(request.url, "https://example.invalid/v1/messages")
            test.eq(assert(json.decode(request.body)).max_tokens, 1)

            http_fixture.prepare_probe('{"models":[{"name":"models/text-embedding-004","supportedActions":["embedContent"]},'
                .. '{"name":"models/gemini-pro-x","supportedActions":["generateContent"]},'
                .. '{"name":"models/gemini-flash-x","supportedActions":["generateContent"]}]}')
            result = assert(google.test_generation(profile(), {}))
            test.eq(result.model, "gemini-flash-x")
            request = assert(http_fixture.probe())
            test.eq(request.url, "https://example.invalid/models/gemini-flash-x:generateContent")
            test.eq(assert(json.decode(request.body)).generationConfig.maxOutputTokens, 1)
        end)
    end)

    test.describe("safe discovery diagnostics", function()
        for _, row in ipairs({{401, errors.PERMISSION_DENIED, false}, {429, errors.RATE_LIMITED, true},
            {503, errors.UNAVAILABLE, true}}) do
            test.it("preserves typed HTTP " .. tostring(row[1]) .. " diagnostics across adapters and HTTP handlers", function()
                http_fixture.prepare({status_code = row[1], body = sentinel}, nil)
                for _, adapter in ipairs(adapters) do
                    local result, message, diagnostics = adapter.fetch(profile())
                    test.is_nil(result)
                    check(message, diagnostics, row[2], row[3], row[1])
                end
                local result, message, diagnostics = openai.test(profile(), {model = "test-model"})
                test.is_nil(result)
                check(message, diagnostics, row[2], row[3], row[1])

                local saved = assert(repo.create_profile({name = "Diagnostic profile",
                    provider_id = "wippy.llm.openai_compat:provider", api_key = "test-key"}))
                local original = discovery.adapter_for
                discovery.adapter_for = function() return openai end
                local ok, err = pcall(function()
                    for _, operation in ipairs({
                        function() return discovery.discover(saved.id) end,
                        function() return discovery.test(saved.id, {}) end,
                        function() return discovery.test(saved.id, {model = "test-model"}) end,
                    }) do
                        local value, failure, diagnostic = operation()
                        test.is_nil(value)
                        check(failure, diagnostic, row[2], row[3], row[1])
                        local public = assert(repo.get_profile_public(saved.id))
                        test.eq(public.status, "unhealthy")
                        test.contains(public.message, "HTTP " .. tostring(row[1]))
                    end
                    for _, handler in ipairs({discover_handler, test_handler}) do
                        fake_http.prepare("{}", {id = saved.id})
                        handler.handler()
                        local payload = fake_http.payload()
                        test.eq(fake_http.status(), 400)
                        test.eq(payload.success, false)
                        check(payload.error, payload.diagnostics, row[2], row[3], row[1])
                    end
                    repo.set_profile_status(saved.id, "healthy", "prior state", nil)
                    discovery.test(saved.id, {model = "test-model"})
                    test.eq(assert(repo.get_profile_public(saved.id)).message, "prior state")
                end)
                discovery.adapter_for = original
                assert(repo.delete_profile(saved.id))
                if not ok then error(err, 0) end
            end)
        end

        test.it("projects native error kinds and retryability without exposing messages or details", function()
            for _, row in ipairs({{errors.INTERNAL, true}, {errors.TIMEOUT, false}, {errors.UNAVAILABLE, true}}) do
                http_fixture.prepare(nil, errors.new({kind = row[1], retryable = row[2], message = sentinel,
                    details = {credential = sentinel, status_code = 401}}))
                for _, adapter in ipairs(adapters) do
                    local value, message, diagnostics = adapter.fetch(profile())
                    test.is_nil(value)
                    check(message, diagnostics, row[1], row[2], nil)
                end
                local value, message, diagnostics = openai.test(profile(), {model = "test-model"})
                test.is_nil(value)
                check(message, diagnostics, row[1], row[2], nil)
            end
        end)

        test.it("does not infer transport categories from untyped message text", function()
            http_fixture.prepare(nil, "timeout connection refused " .. sentinel)
            for _, adapter in ipairs(adapters) do
                local value, message, diagnostics = adapter.fetch(profile())
                test.is_nil(value)
                test.is_nil(diagnostics)
                test.eq(message, "provider request failed")
            end
        end)

        test.it("retains response status for invalid model-list JSON without exposing its body", function()
            http_fixture.prepare({status_code = 200, body = sentinel}, nil)
            local value, message, diagnostics = openai.fetch(profile())
            test.is_nil(value)
            test.not_nil(diagnostics)
            test.eq(diagnostics.status_code, 200)
            test.is_nil((assert(json.encode({message, diagnostics})):find(sentinel, 1, true)))
        end)
    end)
end)}
