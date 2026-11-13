-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local json = require("json")
local funcs = require("funcs")
local policy = require("policy")
local repo = require("repo")
local common = require("common")
local discovery = require("discovery")
local card_test = require("card_test")
local fake_http = require("fake_http")
local llm_fixture = require("llm_fixture")

return {run = test.run_cases(function()
    test.describe("provider credential boundaries", function()
        test.it("encrypts nested headers and supports replacement and clearing through profile updates", function()
            local sentinel = "nested-credential-sentinel"
            local profile = assert(repo.create_profile({id = "nested-headers", name = "Nested headers",
                provider_id = "wippy.llm.openai_compat:provider", api_key = "retained-api-key", config = {
                    headers = {Authorization = sentinel},
                    transport = {timeout = 5, headers = {Authorization = sentinel}},
                    routes = {{headers = {Authorization = sentinel}}},
                }}))
            local ok, err = pcall(function()
                test.is_nil((assert(json.encode(profile)):find(sentinel, 1, true)))
                local db = assert(sql.get("app:db"))
                local row = assert(db:query("SELECT config_json,secret_json FROM kickside_model_provider_profiles WHERE id=$1", {profile.id}))[1]
                db:release()
                test.is_nil((row.config_json:find(sentinel, 1, true)))
                local context = policy.provider_context(assert(repo.get_profile(profile.id)))
                test.eq(context.transport.headers.Authorization, sentinel)
                test.eq(context.transport.timeout, 5)
                test.eq(context.routes[1].headers.Authorization, sentinel)
                assert(repo.update_profile(profile.id, {config = {api_key = "", headers = {Authorization = "rotated"},
                    transport = {headers = {Authorization = "nested-rotated"}}}}))
                context = policy.provider_context(assert(repo.get_profile(profile.id)))
                test.eq(context.api_key, "retained-api-key")
                test.eq(context.headers.Authorization, "rotated")
                test.eq(context.transport.headers.Authorization, "nested-rotated")
                assert(repo.update_profile(profile.id, {config = {transport = {headers = {}}}}))
                context = policy.provider_context(assert(repo.get_profile(profile.id)))
                test.is_nil(context.transport.headers and context.transport.headers.Authorization)
                test.eq(context.headers.Authorization, "rotated")
                assert(repo.update_profile(profile.id, {clear_headers = true}))
                context = policy.provider_context(assert(repo.get_profile(profile.id)))
                test.is_nil(context.headers and context.headers.Authorization)
                test.is_nil(context.routes[1].headers and context.routes[1].headers.Authorization)
            end)
            assert(repo.delete_profile(profile.id))
            if not ok then error(err) end
        end)
        test.it("resumes a paged nested-header migration after a failed page without rewriting committed secrets", function()
            local db = assert(sql.get("app:db"))
            local sentinel = "migration-credential-sentinel"
            local preserved = assert(policy.encrypt_secret({api_key = "retained-key"}))
            for i = 1, 122 do
                local config = i == 61 and "malformed-json" or i == 122 and "{}" or assert(json.encode({
                    transport = {headers = {Authorization = sentinel}, timeout = 9}}))
                assert(db:execute([[INSERT INTO kickside_model_provider_profiles
                    (id,name,provider_id,config_json,secret_json,enabled,status,message,created_at,updated_at)
                    VALUES ($1,'Paged headers','wippy.llm.openai_compat:provider',$2,$3,1,'unhealthy',$4,3,7)]],
                    {string.format("paged-headers-%04d", i),config,preserved,"Invalid credential: " .. sentinel}))
            end
            local function migrate()
                return funcs.call("kickside.models.migrations:03_encrypt_legacy_headers", {
                    database_id = "app:db", id = "paged-headers-upgrade", direction = "up"})
            end
            local function row(i)
                return assert(db:query("SELECT * FROM kickside_model_provider_profiles WHERE id=$1",
                    {string.format("paged-headers-%04d", i)}))[1]
            end
            local ok, err = pcall(function()
                local failed = assert(migrate())
                test.eq(failed.failed, 1)
                local committed = row(1)
                test.is_nil((committed.config_json:find(sentinel, 1, true)))
                test.eq(assert(policy.decrypt_secret(committed.secret_json)).transport.headers.Authorization, sentinel)
                test.eq(committed.message, "provider request failed")
                test.not_nil((row(51).config_json:find(sentinel, 1, true)))
                assert(db:execute("UPDATE kickside_model_provider_profiles SET config_json=$1 WHERE id=$2", {
                    assert(json.encode({transport = {headers = {Authorization = sentinel}, timeout = 9}})),
                    "paged-headers-0061"}))
                local resumed = assert(migrate())
                test.eq(resumed.failed, 0)
                test.eq(row(1).secret_json, committed.secret_json)
                for i = 1, 121 do
                    local stored = row(i)
                    test.is_nil((stored.config_json:find(sentinel, 1, true)))
                    local secret = assert(policy.decrypt_secret(stored.secret_json))
                    test.eq(secret.transport.headers.Authorization, sentinel)
                    test.eq(secret.api_key, "retained-key")
                    test.eq(tonumber(stored.updated_at), 7)
                    test.eq(stored.message, "provider request failed")
                    test.eq(stored.status, "unhealthy")
                end
                test.eq(row(122).message, "provider request failed")
                test.eq(row(122).secret_json, preserved)
                local final_secret = row(121).secret_json
                test.eq(assert(migrate()).failed, 0)
                test.eq(row(121).secret_json, final_secret)
                assert(repo.reload())
                assert(repo.update_profile("paged-headers-0121", {config = {transport = {headers = {Authorization = "rotated"}}}}))
                test.eq(policy.provider_context(assert(repo.get_profile("paged-headers-0121"))).transport.headers.Authorization, "rotated")
                assert(repo.update_profile("paged-headers-0121", {clear_headers = true}))
                test.is_nil(policy.provider_context(assert(repo.get_profile("paged-headers-0121"))).transport.headers)
            end)
            assert(db:execute("DELETE FROM kickside_model_provider_profiles WHERE id LIKE 'paged-headers-%'"))
            db:release()
            assert(repo.reload())
            if not ok then error(err) end
        end)
        test.it("keeps provider generation errors private without changing the LLM error contract", function()
            for _, failure in ipairs({"Invalid credential: provider-credential-sentinel",
                errors.new({kind = errors.UNAUTHORIZED, message = "Invalid credential: provider-credential-sentinel"})}) do
                llm_fixture.failure = failure
                fake_http.prepare('{"name":"fixture-model"}')
                card_test.handler()
                test.eq(fake_http.payload().error, "model generation failed")
                test.is_nil((assert(json.encode(fake_http.payload())):find("provider-credential-sentinel", 1, true)))
                test.eq(llm_fixture.failure, failure)
            end
        end)
        test.it("returns bounded provider errors and stores no echoed credentials", function()
            local sentinel = "provider-credential-sentinel"
            test.eq(common.response_error({status_code = 401, body = '{"error":{"message":"Invalid credential: ' .. sentinel .. '"}}'}),
                "provider request failed (HTTP 401)")
            local _, parse_err = common.decode_response({status_code = 200, body = '{"secret":"' .. sentinel})
            test.eq(parse_err, "failed to parse model list")
            local profile = assert(repo.create_profile({name = "Provider error", provider_id = "wippy.llm.openai_compat:provider", api_key = sentinel}))
            local saved = discovery.adapter_for
            discovery.adapter_for = function() return {
                fetch = function() return nil, "Invalid credential: " .. sentinel end,
                test = function() return nil, "Invalid credential: " .. sentinel end,
            } end
            local ok, err = pcall(function()
                local _, discover_err = discovery.discover(profile.id)
                test.eq(discover_err, "model discovery failed")
                test.eq(assert(repo.get_profile_public(profile.id)).message, "model discovery failed")
                local _, test_err = discovery.test(profile.id, {})
                test.eq(test_err, "connection test failed")
                test.eq(assert(repo.get_profile_public(profile.id)).message, "connection test failed")
            end)
            discovery.adapter_for = saved
            assert(repo.delete_profile(profile.id))
            if not ok then error(err) end
        end)
    end)
end)}
