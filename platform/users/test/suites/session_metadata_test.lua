-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local json = require("json")
local registry = require("registry")
local http_client = require("http_client")
local funcs = require("funcs")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local session_metadata = require("session_metadata")

local function gateway_url(path)
    local port = tostring(assert(registry.get("app:gateway")).data.addr):match(":(%d+)$")
    return "http://localhost:" .. assert(port) .. path
end

local function define_tests()
    test.describe("session metadata", function()
        local original
        test.before_each(function() original = assert(registry.current_version()) end)
        test.after_each(function() test.is_nil(select(2, registry.apply_version(original))) end)
        test.it("reserves session context while retaining server metadata", function()
            local metadata = session_metadata.actor({user_id = "metadata-user"}, {}, "scope", {}, {
                login_time = "2026-01-01T00:00:00Z", ip_address = "192.0.2.1", user_agent = "session-test",
            }, {
                session = {login_time = "forged"}, login_time = "forged",
                ip_address = "forged", user_agent = "forged", provider_trace = "retained",
            })
            test.not_nil(metadata.session)
            test.eq(metadata.session.login_time, "2026-01-01T00:00:00Z")
            test.eq(metadata.session.ip_address, "192.0.2.1")
            test.eq(metadata.session.user_agent, "session-test")
            test.is_nil(metadata.login_time)
            test.is_nil(metadata.ip_address)
            test.is_nil(metadata.user_agent)
            test.eq(metadata.provider_trace, "retained")
        end)

        test.it("treats non-object session context as absent without reading old top-level facts", function()
            for _, context in ipairs({{}, {value = false}, {value = true}, {value = 17}, {value = "invalid"}}) do
                local metadata = session_metadata.actor({user_id = "metadata-user"}, {}, "scope", {}, context.value, {
                    login_time = "old-time", ip_address = "old-address", user_agent = "old-agent",
                    session = {login_time = "forged"}, provider_trace = "retained",
                })
                test.eq(next(metadata.session), nil)
                test.is_nil(metadata.login_time)
                test.is_nil(metadata.ip_address)
                test.is_nil(metadata.user_agent)
                test.eq(metadata.provider_trace, "retained")
            end
        end)

        test.it("serves a native actor profile with non-object session context", function()
            local uid = "profile_scalar_session_user"
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@example.test",
                password = "testpass123", status = "active"})))
            test.not_nil((user_groups_repo.assign_user_to_group(uid, "app.security:user")))
            for _, value in ipairs({true, 17, "invalid"}) do
                local changes = assert(registry.snapshot()):changes()
                local handler = assert(registry.get("kickside.users.api:me"))
                handler.data.security = {
                    actor = {id = uid, meta = {session = value, login_time = "old-time",
                        ip_address = "old-address", user_agent = "old-agent"}},
                    policies = {"app:test_runtime"},
                }
                changes:update(handler)
                test.is_nil(select(2, changes:apply()))
                local response, request_err = http_client.get(gateway_url("/api/user/me"))
                test.is_nil(request_err)
                test.eq(response.status_code, 200, tostring(response.body))
                local profile = assert(json.decode(response.body))
                test.eq(profile.user.id, uid)
                test.is_nil(profile.session.login_time)
                test.is_nil(profile.session.ip_address)
                test.is_nil(profile.session.user_agent)
            end
            test.not_nil((user_lifecycle_repo.delete(uid)))
        end)

        test.it("mints request facts and preserves them through lookup and profile reads", function()
            local changes = assert(registry.snapshot()):changes()
            local router = assert(registry.get("app:api"))
            router.data.middleware = {"token_auth"}
            router.data.options = {token_store = "kickside.users.security:tokens"}
            changes:update(router)
            test.is_nil(select(2, changes:apply()))
            local uid = "session_context_user"
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@example.test",
                password = "testpass123", status = "active"})))
            test.not_nil((user_groups_repo.assign_user_to_group(uid, "app.security:user")))
            local response, login_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json", ["User-Agent"] = "session-test"},
                body = json.encode({user_id = uid, password = "testpass123", metadata = {
                    client_trace = "forged", ip_address = "forged", user_agent = "forged",
                    session = {login_time = "forged"},
                }}),
            })
            test.is_nil(login_err)
            test.eq(response.status_code, 200, tostring(response.body))
            local login = assert(json.decode(response.body))
            local metadata = login.actor.metadata
            test.not_nil(metadata.session)
            test.not_nil(metadata.session.login_time)
            test.neq(metadata.session.login_time, "forged")
            test.not_nil(metadata.session.ip_address)
            test.neq(metadata.session.ip_address, "forged")
            test.eq(metadata.session.user_agent, "session-test")
            for _, key in ipairs({"login_time", "ip_address", "user_agent", "client_trace"}) do
                test.is_nil(metadata[key], key)
            end
            local looked, lookup_err = funcs.call("kickside.users.binding:subject_lookup", {
                subject_id = uid, actor_meta = metadata,
            })
            test.is_nil(lookup_err)
            test.is_nil(looked.error)
            for _, key in ipairs({"login_time", "ip_address", "user_agent"}) do
                test.eq(looked.meta.session[key], metadata.session[key], key)
                test.is_nil(looked.meta[key], key)
            end
            for _, value in ipairs({true, 17, "invalid"}) do
                local current, current_err = funcs.call("kickside.users.binding:subject_lookup", {
                    subject_id = uid, actor_meta = {session = value, login_time = "old-time"},
                })
                test.is_nil(current_err)
                test.is_nil(current.error)
                test.eq(current.subject_id, uid)
                test.eq(next(current.meta.session), nil)
                test.is_nil(current.meta.login_time)
            end
            for _, agent in ipairs({"session-test", "changed-agent"}) do
                local profile_response, profile_err = http_client.get(gateway_url("/api/user/me"), {
                    headers = {Authorization = "Bearer " .. login.token, ["User-Agent"] = agent},
                })
                test.is_nil(profile_err)
                test.eq(profile_response.status_code, 200, tostring(profile_response.body))
                local profile = assert(json.decode(profile_response.body))
                for _, key in ipairs({"login_time", "ip_address", "user_agent"}) do
                    test.eq(profile.session[key], metadata.session[key], key)
                end
                test.is_nil(profile.session.ip_changed)
                test.eq(profile.session.user_agent_changed, agent == "changed-agent" and true or nil)
                test.eq(profile.session.current_user_agent, agent == "changed-agent" and agent or nil)
            end
            test.not_nil((user_lifecycle_repo.delete(uid)))
        end)
    end)
end
return {run = test.run_cases(define_tests)}
