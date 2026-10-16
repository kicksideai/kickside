-- Profile contract suite, exercised over the bundled base fields (no external
-- fixture harness): display_name/avatar_url/bio are public strings, locale is a
-- self string. Covers default fallback, per-user round-trip + isolation, type
-- validation, list provenance, and the self|public cross-user read rule.

local test = require("test")
local sql = require("sql")
local contract = require("contract")
local security = require("security")
local time = require("time")
local json = require("json")
local profile_writer = require("profile_writer")
local get_profile = require("get_profile")

-- Field value bucket: the stored kickside_profile.namespace for the bundled base
-- fields. Stable data key (kept as kickside.profile), distinct from the module
-- namespace kickside.users.profile.
local NS = "kickside.profile"

-- The users harness app:user policy grants contract access; the runtime enforces
-- contract.open/call against the scope, while per-user isolation is enforced
-- inside the service by actor id (not by policy).
local function scope(): any
    local policy, perr = security.policy("app:user")
    if perr or not policy then error("profile policy: " .. tostring(perr)) end
    return security.new_scope({ policy })
end

local function open_profile_as(actor_id: string): any
    local def, derr = contract.get("kickside.users.profile:profile")
    if derr or not def then error("profile contract: " .. tostring(derr)) end
    local inst, oerr = (def :: any)
        :with_actor(security.new_actor(actor_id, {}))
        :with_scope(scope())
        :open()
    if oerr or not inst then error("profile open: " .. tostring(oerr)) end
    return inst
end

local function define_tests()
    test.describe("KickSide Profile", function()
        test.it("grants member profile HTTP access and keeps user creation administrative", function()
            local policy, err = security.policy("kickside.users.profile:profile_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("profile-member", {})
            test.eq(policy:evaluate(actor, "access", "kickside.users.api:get_profile.endpoint", {}), "allow")
            test.eq(policy:evaluate(actor, "access", "kickside.users.api:put_profile.endpoint", {}), "allow")
            test.neq(policy:evaluate(actor, "access", "kickside.users.api:create_user.endpoint", {}), "allow")
        end)

        test.it("get returns the declared default when there is no value", function()
            local r = open_profile_as("alice"):get({ namespace = NS, key = "timezone" })
            test.eq(r.success, true)
            test.eq(r.value, "UTC")
        end)

        test.it("set stores and get returns the actor's own value", function()
            local s = open_profile_as("alice")
            test.eq(s:set({ namespace = NS, key = "display_name", value = "Alice" }).success, true)
            test.eq(s:get({ namespace = NS, key = "display_name" }).value, "Alice")
            s:unset({ namespace = NS, key = "display_name" })
        end)

        test.it("unset reverts to the declared default", function()
            local s = open_profile_as("alice")
            s:set({ namespace = NS, key = "locale", value = "fr" })
            s:unset({ namespace = NS, key = "locale" })
            test.eq(s:get({ namespace = NS, key = "locale" }).value, "en")
        end)

        test.it("rejects an undeclared field", function()
            test.eq(open_profile_as("alice"):get({ namespace = NS, key = "nope" }).success, false)
        end)

        test.it("rejects a wrong-typed value on set", function()
            local r = open_profile_as("alice"):set({ namespace = NS, key = "display_name", value = 123 })
            test.eq(r.success, false)
        end)

        test.it("enforces every bundled string bound at the exact boundary", function()
            local s = open_profile_as("profile-bounds")
            for _, field in ipairs({
                { "display_name", 80 },
                { "avatar_url", 2048 },
                { "bio", 500 },
                { "locale", 35 },
                { "timezone", 64 },
            }) do
                local key, limit = field[1], field[2]
                local exact = string.rep("a", limit)
                if key == "avatar_url" then
                    exact = "https://example.test/" .. string.rep("a", limit - 21)
                end
                test.eq(s:set({ namespace = NS, key = key, value = exact }).success, true)
                test.eq(s:set({ namespace = NS, key = key, value = exact .. "a" }).success, false)
                s:unset({ namespace = NS, key = key })
            end
        end)

        test.it("accepts only absolute HTTP(S) avatar URLs", function()
            local s = open_profile_as("profile-avatar")
            test.eq(s:set({ namespace = NS, key = "avatar_url", value = "https://example.test/a.png" }).success, true)
            test.eq(s:set({ namespace = NS, key = "avatar_url", value = "http://example.test/a.png" }).success, true)
            test.eq(s:set({ namespace = NS, key = "avatar_url", value = "javascript:alert(1)" }).success, false)
            test.eq(s:set({ namespace = NS, key = "avatar_url", value = "data:image/svg+xml,x" }).success, false)
            test.eq(s:set({ namespace = NS, key = "avatar_url", value = "/relative.png" }).success, false)
            s:unset({ namespace = NS, key = "avatar_url" })
        end)

        test.it("values are isolated per user", function()
            local alice = open_profile_as("alice")
            alice:set({ namespace = NS, key = "display_name", value = "Alice" })
            -- bob has set nothing: his own read falls back to the default.
            test.eq(open_profile_as("bob"):get({ namespace = NS, key = "display_name" }).value, "")
            alice:unset({ namespace = NS, key = "display_name" })
        end)

        test.it("a public field is readable across users via user_id", function()
            local alice = open_profile_as("alice")
            alice:set({ namespace = NS, key = "display_name", value = "Alice" })
            local r = open_profile_as("bob"):get({ namespace = NS, key = "display_name", user_id = "alice" })
            test.eq(r.success, true)
            test.eq(r.value, "Alice")
            alice:unset({ namespace = NS, key = "display_name" })
        end)

        test.it("a self field is not readable for another user", function()
            local alice = open_profile_as("alice")
            alice:set({ namespace = NS, key = "locale", value = "fr" })
            local r = open_profile_as("bob"):get({ namespace = NS, key = "locale", user_id = "alice" })
            test.eq(r.success, false)
            test.eq(r.error, "profile field is not readable for another user")
            alice:unset({ namespace = NS, key = "locale" })
        end)

        test.it("get_namespace returns only public fields for another user", function()
            local alice = open_profile_as("alice")
            alice:set({ namespace = NS, key = "display_name", value = "Alice" })
            alice:set({ namespace = NS, key = "locale", value = "fr" })
            local r = open_profile_as("bob"):get_namespace({ namespace = NS, user_id = "alice" })
            test.eq(r.success, true)
            test.eq(r.values.display_name, "Alice")
            -- locale is self: absent from a cross-user namespace read.
            test.eq(r.values.locale, nil)
            alice:unset({ namespace = NS, key = "display_name" })
            alice:unset({ namespace = NS, key = "locale" })
        end)

        test.it("list merges declarations with the actor's values + provenance", function()
            local s = open_profile_as("alice")
            s:set({ namespace = NS, key = "bio", value = "hello" })
            local found = nil
            for _, e in ipairs(s:list({ namespace = NS }).fields) do
                if e.key == "bio" then found = e end
            end
            test.not_nil(found)
            test.eq(found.value, "hello")
            test.eq(found.is_default, false)
            test.eq(found.visibility, "public")
            s:unset({ namespace = NS, key = "bio" })
        end)

        test.it("exact API reads address hidden module state without listing it", function()
            local s = open_profile_as("alice")
            local exact = get_profile.read(s, { namespace = "test.profile", key = "internal_state" })
            test.eq(exact.success, true)
            test.eq(exact.value, "hidden-default")

            local listed = get_profile.read(s, { namespace = "test.profile" })
            test.eq(listed.success, true)
            test.eq(#listed.fields, 0)
        end)

        test.it("preserves a declared empty JSON object shape", function()
            local exact = get_profile.read(open_profile_as("alice"), {
                namespace = "test.profile",
                key = "object_state",
            })
            test.eq(exact.success, true)
            test.eq(json.encode(exact.value), "{}")
        end)

        test.it("enforces the declared JSON object shape", function()
            local s = open_profile_as("profile-object")
            test.eq(s:set({ namespace = "test.profile", key = "object_state", value = { ok = true } }).success, true)
            test.eq(s:set({ namespace = "test.profile", key = "object_state", value = { "array" } }).success, false)
            s:unset({ namespace = "test.profile", key = "object_state" })
        end)

        test.it("cannot clear a non-editable field", function()
            local ok, err = profile_writer.clear("profile-locked", "test.profile", "locked_state")
            test.eq(ok, false)
            test.eq(err, "profile field is not editable")
        end)

        test.it("fails closed on malformed schema declarations and non-JSON values", function()
            local s = open_profile_as("profile-malformed")
            test.eq(s:set({ namespace = "test.profile", key = "malformed_schema", value = "abc" }).success, false)

            local cyclic = {}
            cyclic.self = cyclic
            local ok, err = profile_writer.set("profile-malformed", "test.profile", "object_state", cyclic)
            test.eq(ok, false)
            test.eq(err, "value is not valid JSON")
        end)

        test.it("persisted updated_at is RFC3339 UTC (Z-suffixed, parseable)", function()
            local s = open_profile_as("alice")
            s:set({ namespace = NS, key = "display_name", value = "Alice" })
            local found = nil
            for _, e in ipairs(s:list({ namespace = NS }).fields) do
                if e.key == "display_name" then found = e end
            end
            test.not_nil(found)
            test.eq(type(found.updated_at), "string")
            test.eq(found.updated_at:sub(-1), "Z")
            local parsed, perr = time.parse(time.RFC3339, found.updated_at)
            test.eq(perr, nil)
            test.not_nil(parsed)
            s:unset({ namespace = NS, key = "display_name" })
        end)

        -- A failed read is an error on every path, never the declared default.
        -- The value table is hidden for the duration of the calls and restored
        -- before any assertion runs.
        test.it("reports a failed value read instead of the declared default", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not db then error(tostring(db_err or "database unavailable")) end
            local _, hide_err = db:execute("ALTER TABLE kickside_profile RENAME TO kickside_profile_hidden")
            test.is_nil(hide_err)
            local s = open_profile_as("profile-unreadable")
            local got = s:get({ namespace = NS, key = "timezone" })
            local ns = s:get_namespace({ namespace = NS })
            local listed = s:list({ namespace = NS })
            local set = s:set({ namespace = NS, key = "display_name", value = "X" })
            local _, restore_err = db:execute("ALTER TABLE kickside_profile_hidden RENAME TO kickside_profile")
            db:release()
            test.is_nil(restore_err)

            test.eq(got.success, false)
            test.is_nil(got.value)
            test.contains(tostring(got.error), "profile query failed")
            test.eq(ns.success, false)
            test.is_nil(ns.values)
            test.contains(tostring(ns.error), "profile query failed")
            test.eq(listed.success, false)
            test.is_nil(listed.fields)
            test.contains(tostring(listed.error), "profile query failed")
            test.eq(set.success, false)
            test.contains(tostring(set.error), "profile query failed")
        end)

        test.it("principal cleanup removes every stored profile value for the user", function()
            local s = open_profile_as("profile-clean")
            s:set({ namespace = NS, key = "display_name", value = "Profile Clean" })
            s:set({ namespace = NS, key = "locale", value = "fr" })
            local before = s:list({ namespace = NS }).fields
            local stored = 0
            for _, field in ipairs(before) do
                if (field :: any).is_default == false then stored = stored + 1 end
            end
            test.eq(stored, 2)

            local result = profile_writer.cleanup_principal({ user_id = "profile-clean" })
            test.eq((result :: any).success, true)

            local after = open_profile_as("profile-clean"):list({ namespace = NS }).fields
            for _, field in ipairs(after) do
                test.eq((field :: any).is_default, true)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
