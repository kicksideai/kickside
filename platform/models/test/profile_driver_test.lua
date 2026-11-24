-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local models_repo = require("models_repo")
local driver = require("driver")
local fixture = require("fixture")
local registry_models = require("registry_models")
local resolver = require("resolver")
local context = require("context")
local base64 = require("base64")
local json = require("json")

local function define_tests()
    test.describe("Cached profile execution", function()
        for _, boundary in ipairs({"open string", "open details", "method string", "method details", "response metadata"}) do
            test.it("redacts injected credentials from " .. boundary, function()
                local secret = "fixture-cache-secret.%+[value]?"
                local profile = assert(models_repo.create_profile({id = "cached-profile", name = "Cached profile",
                    provider_id = "wippy.llm.openai_compat:provider", base_url = "https://provider.example.test/v1",
                    api_key = secret}))
                assert(models_repo.upsert_card({name = "cached-profile-model", provider_profile_id = profile.id,
                    provider_id = profile.provider_id, provider_model = "wire-model", capabilities = {"generate"},
                    max_tokens = 8192, output_tokens = 1024, enabled = true}))
                local original_key = fixture.api_key
                fixture.api_key = secret
                local message = "HTTP 401: " .. secret .. "; Bearer " .. secret .. "; " .. base64.encode(secret)
                local details = {status = 401, nested = {message = message, values = {secret, "Bearer " .. secret,
                    base64.encode(secret)}, [secret] = "credential key"}, retryable = false}
                local failure = errors.new({kind = errors.PERMISSION_DENIED, message = message,
                    retryable = false, details = details})
                if boundary == "open string" then fixture.open_error = message
                elseif boundary == "open details" then fixture.open_error = failure
                elseif boundary == "method string" then fixture.failure = message
                elseif boundary == "method details" then fixture.failure = failure
                else
                    local data = assert(json.decode('{"empty_array":[],"empty_object":{},"rows":[{"book":null},{"page":"7"}]}'))
                    fixture.response = {success = true, result = {content = "ok", data = data}, metadata = details}
                end
                local ok, err = pcall(function()
                    for _, method in ipairs({"status", "generate", "embed", "structured_output", "evaluate"}) do
                        local response, call_err = driver[method]({})
                        local diagnostic
                        if boundary == "response metadata" then
                            test.is_nil(call_err)
                            test.eq(response.result.content, "ok")
                            local data = response.result.data
                            test.eq(json.encode(data.empty_array), "[]")
                            test.eq(json.encode(data.empty_object), "{}")
                            test.eq(json.encode(data.rows[1]), "{}")
                            test.eq(data.rows[2].page, "7")
                            test.eq(response.metadata.status, 401)
                            test.eq(response.metadata.retryable, false)
                            diagnostic = json.encode(response)
                        else
                            test.is_nil(response)
                            test.eq(type(call_err), type(boundary:find("string", 1, true) and message or failure))
                            diagnostic = tostring(call_err)
                            if not boundary:find("string", 1, true) then
                                test.eq(call_err:kind(), failure:kind())
                                test.eq(call_err:retryable(), failure:retryable())
                                test.eq(call_err:details().status, 401)
                                diagnostic = diagnostic .. json.encode(call_err:details())
                            end
                        end
                        test.is_nil(diagnostic:find(secret, 1, true), "Caller receives injected secret")
                        test.is_nil(diagnostic:find(base64.encode(secret), 1, true), "Caller receives encoded secret")
                        test.not_nil(diagnostic:find("401", 1, true), "Non-secret diagnostics disappear")
                    end
                    test.eq(details.nested.values[1], secret, "Driver-owned metadata changes")
                end)
                fixture.api_key = original_key
                fixture.open_error, fixture.failure, fixture.response = nil, nil, nil
                local _, delete_err = models_repo.delete_profile(profile.id)
                test.is_nil(delete_err, tostring(delete_err))
                assert(ok, tostring(err))
            end)
        end
        test.it("keeps legacy inline provider routes unchanged", function()
            local get_all = registry_models.get_all
            local route = {id = "wippy.llm.openai_compat:provider", provider_model = "wire-model",
                context = {api_key = "fixture-inline-secret", base_url = "https://inline.example.test/v1",
                    headers = {["X-Saved"] = "retained"}}, options = {temperature = 0.5}, sampling = false}
            registry_models.get_all = function() return {{name = "inline-model", providers = {route}}} end
            local ok, err = pcall(function()
                local card, resolve_err = resolver.resolve({model = "inline-model"})
                test.is_nil(resolve_err, tostring(resolve_err))
                test.eq(card.providers[1].id, route.id)
                test.eq(card.providers[1].provider_model, route.provider_model)
                test.eq(card.providers[1].context, route.context)
                test.eq(card.providers[1].options, route.options)
                test.eq(card.providers[1].sampling, false)
            end)
            registry_models.get_all = get_all
            assert(ok, tostring(err))
        end)
        test.it("keeps native driver route capabilities on saved profiles", function()
            for _, case in ipairs({
                {provider = "wippy.llm.openai:provider", reasoning = true, sampling = false, thinking = "adaptive"},
                {provider = "wippy.llm.openai:provider", reasoning = false},
                {provider = "wippy.llm.openai_compat:provider", reasoning = true, sampling = false, thinking = "adaptive"},
                {provider = "wippy.llm.claude:provider", reasoning = true},
            }) do
                local profile = assert(models_repo.create_profile({id = "route-capability-profile", name = "Route capability",
                    provider_id = case.provider, api_key = "fixture-cache-secret"}))
                assert(models_repo.upsert_card({name = "route-capability-model", provider_profile_id = profile.id,
                    provider_id = case.provider, provider_model = "wire-model", capabilities = {"generate"},
                    class = {"fast"}, options = {reasoning_model_request = case.reasoning}, enabled = true}))
                local card, err = resolver.resolve({model = "class:fast"})
                local _, delete_err = models_repo.delete_profile(profile.id)
                test.is_nil(delete_err, tostring(delete_err))
                test.is_nil(err, tostring(err))
                for _, candidate in ipairs({card, card.candidates[1]}) do
                    local route = candidate.providers[1]
                    test.eq(route.id, "kickside.models:provider")
                    test.eq(route.sampling, case.sampling)
                    test.eq(route.thinking, case.thinking)
                    test.eq(route.options.reasoning_model_request, case.reasoning)
                    test.is_nil(route.context.api_key)
                end
            end
        end)
        test.it("executes merged registry options with saved overrides", function()
            local profile = assert(models_repo.create_profile({id = "cached-profile", name = "Cached profile",
                provider_id = "wippy.llm.openai_compat:provider", base_url = "https://provider.example.test/v1",
                api_key = "fixture-cache-secret", organization = "profile-organization"}))
            assert(models_repo.upsert_card({name = "cached-profile-model", provider_profile_id = profile.id,
                provider_id = profile.provider_id, provider_model = "wire-model", capabilities = {"generate"},
                options = {timeout = 88}, max_tokens = 8192, output_tokens = 1024, enabled = true}))
            local get_all = registry_models.get_all
            registry_models.get_all = function() return {{name = "cached-profile-model", providers = {{
                id = profile.provider_id, provider_model = "wire-model", sampling = false,
                options = {organization = "registry-organization", timeout = 77}}}}} end
            local ok, err = pcall(function()
                local card, resolve_err = resolver.resolve({model = "cached-profile-model"})
                test.is_nil(resolve_err, tostring(resolve_err))
                test.eq(card.providers[1].id, "kickside.models:provider")
                test.eq(card.providers[1].context.card, "cached-profile-model")
                test.is_nil(card.providers[1].context.api_key)
                test.eq(card.providers[1].sampling, false)
                local response, call_err = driver.generate({})
                test.is_nil(call_err, tostring(call_err))
                test.is_true(response.success)
                test.eq(fixture.context.organization, "registry-organization")
                test.eq(fixture.context.timeout, 88)
            end)
            registry_models.get_all = get_all
            local _, delete_err = models_repo.delete_profile(profile.id)
            test.is_nil(delete_err, tostring(delete_err))
            assert(ok, tostring(err))
        end)
        test.it("calls the route a resolved call pins among a card's profile routes", function()
            local first = assert(models_repo.create_profile({id = "route-first", name = "Route first",
                provider_id = "wippy.llm.openai_compat:provider", base_url = "https://provider.example.test/v1",
                api_key = "fixture-cache-secret"}))
            local second = assert(models_repo.create_profile({id = "route-second", name = "Route second",
                provider_id = "wippy.llm.openai_compat:provider", base_url = "https://provider.example.test/v1",
                api_key = "fixture-cache-secret"}))
            local get_all, model = registry_models.get_all, fixture.model
            registry_models.get_all = function() return {{name = "pinned-route-model", providers = {
                {id = first.provider_id, provider_model = "first-wire", provider_profile_id = first.id},
                {id = second.provider_id, provider_model = "second-wire", provider_profile_id = second.id}}}} end
            local original_context = context.context
            local ok, err = pcall(function()
                local card, resolve_err = resolver.resolve({model = "pinned-route-model"})
                test.is_nil(resolve_err, tostring(resolve_err))
                test.eq(#card.providers, 2)
                for index, wire in ipairs({"first-wire", "second-wire"}) do
                    context.context = card.providers[index].context
                    fixture.model = wire
                    local response, call_err = driver.generate({})
                    test.is_nil(call_err, tostring(call_err))
                    test.is_true(response.success, "route " .. index .. " calls " .. wire)
                end
            end)
            context.context, registry_models.get_all, fixture.model = original_context, get_all, model
            for _, id in ipairs({first.id, second.id}) do
                local _, delete_err = models_repo.delete_profile(id)
                test.is_nil(delete_err, tostring(delete_err))
            end
            assert(ok, tostring(err))
        end)
        test.it("keeps distinct route options when profile route identities repeat", function()
            local profile = assert(models_repo.create_profile({id = "same-route-profile", name = "Same route",
                provider_id = "wippy.llm.openai_compat:provider", base_url = "https://provider.example.test/v1",
                api_key = "fixture-cache-secret"}))
            local get_all, model = registry_models.get_all, fixture.model
            registry_models.get_all = function() return {{name = "same-route-model", providers = {
                {id = profile.provider_id, provider_model = "same-wire", provider_profile_id = profile.id,
                    options = {timeout = 11}},
                {id = profile.provider_id, provider_model = "same-wire", provider_profile_id = profile.id,
                    options = {timeout = 22}}}}} end
            local original_context = context.context
            local ok, err = pcall(function()
                local card, resolve_err = resolver.resolve({model = "same-route-model"})
                test.is_nil(resolve_err, tostring(resolve_err))
                fixture.model = "same-wire"
                for index, expected_timeout in ipairs({11, 22}) do
                    context.context = card.providers[index].context
                    local response, call_err = driver.generate({})
                    test.is_nil(call_err, tostring(call_err))
                    test.is_true(response.success)
                    test.eq(fixture.context.timeout, expected_timeout)
                end
                local stale = card.providers[1].context
                stale.provider_route_index = 2
                context.context = stale
                local result, call_err = driver.generate({})
                test.is_nil(call_err, tostring(call_err))
                test.is_true(result.success)
                test.eq(fixture.context.timeout, 22)
            end)
            context.context, registry_models.get_all, fixture.model = original_context, get_all, model
            local _, delete_err = models_repo.delete_profile(profile.id)
            test.is_nil(delete_err, tostring(delete_err))
            assert(ok, tostring(err))
        end)
        test.it("runs a plain chat profile on the upstream driver with string text content", function()
            local profile = assert(models_repo.create_profile({id = "plain-profile", name = "Plain profile",
                provider_id = "kickside.models:openai_compat_plain.provider", base_url = "https://provider.example.test/v1",
                api_key = "fixture-cache-secret"}))
            assert(models_repo.upsert_card({name = "cached-profile-model", provider_profile_id = profile.id,
                provider_id = profile.provider_id, provider_model = "wire-model", capabilities = {"generate"},
                max_tokens = 8192, output_tokens = 1024, enabled = true}))
            fixture.provider_id = profile.provider_id
            local ok, err = pcall(function()
                local response, call_err = driver.generate({})
                test.is_nil(call_err, tostring(call_err))
                test.is_true(response.success)
                test.eq(fixture.context.text_content, "string")
                test.eq(fixture.context.base_url_env, "wippy.llm.openai_compat:base_url")
            end)
            fixture.provider_id = "wippy.llm.openai_compat:provider"
            local _, delete_err = models_repo.delete_profile(profile.id)
            test.is_nil(delete_err, tostring(delete_err))
            assert(ok, tostring(err))
        end)
        test.it("invalidates decoded routes and profiles on publication", function()
            local profile = assert(models_repo.create_profile({id = "cached-profile", name = "Cached profile",
                provider_id = "wippy.llm.openai_compat:provider", base_url = "https://provider.example.test/v1",
                api_key = "fixture-cache-secret"}))
            assert(models_repo.upsert_card({name = "cached-profile-model", provider_profile_id = profile.id,
                provider_id = profile.provider_id, provider_model = "wire-model", capabilities = {"generate"},
                max_tokens = 8192, output_tokens = 1024, enabled = true}))
            local ok, err = pcall(function()
                local before = assert(driver.generate({})).metadata.managed_dispatch.revision
                assert(models_repo.update_profile(profile.id, {api_key = "fixture-updated-secret"}))
                fixture.api_key = "fixture-updated-secret"
                local changed = assert(driver.generate({})).metadata.managed_dispatch.revision
                test.is_true(changed ~= before)
                test.eq(fixture.context.api_key, "fixture-updated-secret")
                assert(models_repo.upsert_card({name = "cached-profile-model", provider_model = "updated-model"}))
                fixture.model = "updated-model"
                test.is_true(assert(driver.generate({})).metadata.managed_dispatch.revision ~= changed)
                assert(models_repo.delete_card("cached-profile-model"))
                local result, call_err = driver.generate({})
                test.is_nil(result)
                test.not_nil(call_err)
            end)
            fixture.api_key, fixture.model = "fixture-cache-secret", "wire-model"
            local _, delete_err = models_repo.delete_profile(profile.id)
            test.is_nil(delete_err, tostring(delete_err))
            assert(ok, tostring(err))
        end)
        test.it("identifies the actual managed dispatch through generate and embed", function()
            local llm = require("llm")
            local models_cache = require("models_cache")
            local provider = "kickside.models.providers:fixture_provider"
            local id = "dispatch-profile"
            local profile = assert(models_repo.create_profile({id = id, name = "Dispatch", provider_id = provider,
                api_key = "fixture-provider-secret", base_url = "https://first.example.test/v1"}))
            for _, row in ipairs({{"dispatch-first", 20}, {"dispatch-second", 10}}) do
                assert(models_repo.upsert_card({name = row[1], provider_profile_id = id, provider_id = provider,
                    provider_model = row[1], class = {"dispatch"}, priority = row[2],
                    capabilities = {"generate", "embed"}, dimensions = 2, max_tokens = 8192}))
            end
            local function receipt(response, card)
                test.eq(response.metadata.route.provider_id, "kickside.models:provider")
                test.eq(response.metadata.route.model, card)
                local dispatch = response.metadata.managed_dispatch
                test.eq(dispatch.model, card)
                test.eq(dispatch.provider_id, provider)
                test.eq(dispatch.provider_model, card)
                test.eq(#dispatch.revision, 64)
                test.is_nil(dispatch.revision:find("[^0-9a-f]"))
                return dispatch.revision
            end
            local ok, failure = pcall(function()
                local opts = {model = "class:dispatch", dimensions = 2}
                local a: any = assert(llm.embed({"same"}, opts))
                local first = receipt(a, "dispatch-first")
                test.eq(a.result[1][1], 1)
                test.eq(receipt(assert(llm.embed({"different"}, opts)), "dispatch-first"), first)
                assert(models_repo.update_profile(id, {base_url = "https://second.example.test/v1"}))
                -- Hold the public timestamp constant, even if the clock ticks during the test.
                local db = assert(require("sql").get("app:db"))
                local _, err = db:execute("UPDATE kickside_model_provider_profiles SET updated_at=$1 WHERE id=$2",
                    {profile.updated_at, id})
                db:release()
                assert(not err, tostring(err))
                assert(models_repo.reload())
                local b: any = assert(llm.embed({"same"}, opts))
                test.eq(b.result[1][2], 1)
                local second = receipt(b, "dispatch-first")
                test.is_true(first ~= second)
                models_cache.clear()
                test.eq(receipt(assert(llm.embed({"same"}, opts)), "dispatch-first"), second)
                local fallback = assert(llm.generate("hello", {model = "class:dispatch"}))
                local winner = receipt(fallback, "dispatch-second")
                test.eq(fallback.metadata.fallbacks[1].model, "dispatch-first")
                test.eq(receipt(assert(llm.generate("hello", {model = "dispatch-second"})), "dispatch-second"), winner)
                assert(models_repo.upsert_card({name = "dispatch-second", class = {}}))
                local rejected, reason = llm.generate("hello", {model = "class:dispatch"})
                test.is_nil(rejected)
                test.not_nil(reason)
                test.eq(receipt(assert(llm.generate("hello", {model = "dispatch-second"})), "dispatch-second"), winner)
            end)
            assert(models_repo.delete_profile(id))
            assert(ok, tostring(failure))
        end)
        test.it("adds zero SQL opens, full decodes or catalog traversals across warm provider calls", function()
            local profile = assert(models_repo.create_profile({id = "cached-profile", name = "Cached profile",
                provider_id = "wippy.llm.openai_compat:provider", base_url = "https://provider.example.test/v1",
                api_key = "fixture-cache-secret"}))
            assert(models_repo.upsert_card({name = "cached-profile-model", provider_profile_id = profile.id,
                provider_id = profile.provider_id, provider_model = "wire-model", capabilities = {"generate"},
                max_tokens = 8192, output_tokens = 1024, enabled = true}))
            assert(driver.generate({}))
            local get_all, traversals = registry_models.get_all, 0
            registry_models.get_all = function()
                traversals = traversals + 1
                return get_all()
            end
            fixture.reads, fixture.calls, fixture.decodes = 0, 0, 0
            local ok, err = pcall(function()
                for _ = 1, 20 do
                    for _, method in ipairs({"status", "generate", "embed", "structured_output", "evaluate"}) do
                        local result, call_err = driver[method]({model = "caller-model"})
                        test.is_nil(call_err, tostring(call_err))
                        test.is_true(result.success)
                    end
                end
                test.eq(fixture.context.deadline_at, 12345, "Request deadline disappears")
                context.context.timeout = 7
                assert(driver.generate({}))
                test.eq(fixture.context.timeout, 7, "Request timeout disappears")
                context.context.timeout = nil
                test.eq(fixture.calls, 101)
                test.eq(fixture.reads, 0, "Warm provider calls open SQL")
                test.eq(fixture.decodes, 0, "Warm provider calls decode the full snapshot")
                test.eq(traversals, 0, "Warm provider calls traverse the catalog")
            end)
            registry_models.get_all = get_all
            local _, delete_err = models_repo.delete_profile(profile.id)
            test.is_nil(delete_err, tostring(delete_err))
            assert(ok, tostring(err))
        end)
    end)
end
return {run = test.run_cases(define_tests)}
