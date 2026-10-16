local test = require("test")
local contract = require("contract")
local env = require("env")
local registry = require("registry")
local security = require("security")
local sql = require("sql")
local time = require("time")
local store = require("store")
local writer = require("settings_writer")

-- The harness declares fixture settings in this namespace
-- (max_items: int, default 50; api_token: secret, default "").
local NS = "kickside.settings.test"

-- A deterministic 64-hex (32-byte) key so the secret suite has an ENCRYPTION_KEY.
local TEST_KEY = string.rep("ab", 32)

local function scope(policy_id: string): any
    local policy, policy_err = security.policy(policy_id)
    if policy_err or not policy then error("policy " .. policy_id .. ": " .. tostring(policy_err)) end
    return security.new_scope({ policy })
end

local function open_settings_as(actor_id: string, policy_id: string): any
    local def, derr = contract.get("kickside.settings:settings")
    if derr or not def then error("settings contract: " .. tostring(derr)) end
    local inst, oerr = (def :: any)
        :with_actor(security.new_actor(actor_id, {}))
        :with_scope(scope(policy_id))
        :open()
    if oerr or not inst then error("settings open: " .. tostring(oerr)) end
    return inst
end

local function open_settings(): any
    return open_settings_as("admin", "app:settings_admin_policy")
end

local function define_tests()
    test.describe("KickSide Settings", function()
        test.it("get returns the declared default when there is no override", function()
            local r = open_settings():get({ namespace = NS, key = "max_items" })
            test.eq(r.success, true)
            test.eq(r.value, 50)
        end)

        test.it("set overrides and get returns the override", function()
            local s = open_settings()
            local sr = s:set({ namespace = NS, key = "max_items", value = 7 })
            test.eq(sr.success, true)
            test.eq(s:get({ namespace = NS, key = "max_items" }).value, 7)
            s:unset({ namespace = NS, key = "max_items" })
        end)

        test.it("unset reverts to the declared default", function()
            local s = open_settings()
            s:set({ namespace = NS, key = "max_items", value = 9 })
            s:unset({ namespace = NS, key = "max_items" })
            test.eq(s:get({ namespace = NS, key = "max_items" }).value, 50)
        end)

        test.it("rejects an undeclared setting", function()
            test.eq(open_settings():get({ namespace = NS, key = "nope" }).success, false)
        end)

        test.it("rejects a wrong-typed value on set", function()
            local r = open_settings():set({ namespace = NS, key = "max_items", value = "notanint" })
            test.eq(r.success, false)
        end)

        test.it("lists declared presentation hints with the effective setting value", function()
            local response = open_settings():list({ namespace = NS })
            test.is_true(response.success)
            local found: any = nil
            for _, row in ipairs(response.settings) do
                if row.key == "max_items" then found = row end
            end
            test.not_nil(found)
            test.eq(found.title, "Page size")
            test.eq(found.category, "Rendering")
            test.eq(found.order, 7)
            test.eq(found.ui, "test-page-size")
            test.eq(found.owner, "test-renderer")
            test.eq(found.value_type, "int")
        end)

        test.it("list merges declarations with overrides + provenance", function()
            local s = open_settings()
            s:set({ namespace = NS, key = "max_items", value = 3, actor_id = "spoofed" })
            local r = s:list({ namespace = NS })
            test.eq(r.success, true)
            local found = nil
            for _, e in ipairs(r.settings) do
                if e.key == "max_items" then found = e end
            end
            test.not_nil(found)
            test.eq(found.value, 3)
            test.eq(found.is_default, false)
            test.eq(found.updated_by, "admin")
            s:unset({ namespace = NS, key = "max_items" })
        end)

        test.it("secret round-trips: get returns plaintext", function()
            env.set("ENCRYPTION_KEY", TEST_KEY)
            local s = open_settings()
            local sr = s:set({ namespace = NS, key = "api_token", value = "s3cr3t-value" })
            test.eq(sr.success, true)
            test.eq(s:get({ namespace = NS, key = "api_token" }).value, "s3cr3t-value")
            s:unset({ namespace = NS, key = "api_token" })
        end)

        test.it("secret is stored encrypted at rest, not as plaintext", function()
            env.set("ENCRYPTION_KEY", TEST_KEY)
            open_settings():set({ namespace = NS, key = "api_token", value = "plaintext-marker" })
            local db = sql.get("app:db")
            test.not_nil(db)
            local dbh = db :: any
            local rows = dbh:query(
                "SELECT value FROM kickside_settings WHERE namespace = $1 AND key = $2",
                { NS, "api_token" })
            dbh:release()
            test.eq(#rows, 1)
            -- The stored column must not contain the plaintext.
            test.eq(string.find(tostring(rows[1].value), "plaintext-marker", 1, true), nil)
            open_settings():unset({ namespace = NS, key = "api_token" })
        end)

        test.it("isolates an unreadable secret from valid overrides and unrelated writes", function()
            env.set("ENCRYPTION_KEY", TEST_KEY)
            local s = open_settings()
            test.eq(s:set({ namespace = NS, key = "api_token", value = "preserve-me" }).success, true)
            test.eq(s:set({ namespace = NS, key = "max_items", value = 7 }).success, true)
            env.set("ENCRYPTION_KEY", string.rep("cd", 32))
            local ok, test_err = pcall(function()
                local map, err = writer.reload()
                test.is_nil(err)
                test.not_nil(map)
                local expected = map[NS .. "\0api_token"].error
                test.not_nil(expected)
                local bad = s:get({ namespace = NS, key = "api_token" })
                test.eq(bad.success, false)
                test.is_nil(bad.value)
                test.eq(bad.error, expected)
                local namespace = s:get_namespace({ namespace = NS })
                test.eq(namespace.success, false)
                test.eq(namespace.error, expected)
                test.eq(s:get({ namespace = NS, key = "max_items" }).value, 7)
                local listed = s:list({ namespace = NS })
                test.eq(listed.success, true)
                for _, row in ipairs(listed.settings) do
                    if row.key == "api_token" then
                        test.eq(row.error, expected)
                        test.eq(row.is_default, false)
                        test.is_nil(row.value)
                    elseif row.key == "max_items" then test.eq(row.value, 7) end
                end
                local handle = store.get("kickside.settings:cache")
                handle:set("overrides", "null", 0)
                handle:release()
                test.eq(s:set({ namespace = NS, key = "max_items", value = 8 }).success, true)
                test.eq(s:get({ namespace = NS, key = "max_items" }).value, 8)
                test.eq(s:get({ namespace = NS, key = "api_token" }).error, expected)
                local same_key = s:set({ namespace = NS, key = "api_token", value = "replacement" })
                test.eq(same_key.success, false)
                test.eq(same_key.error, expected)
                handle = store.get("kickside.settings:cache")
                handle:set("overrides", "null", 0)
                handle:release()
                test.eq(s:unset({ namespace = NS, key = "max_items" }).success, true)
                test.eq(s:get({ namespace = NS, key = "max_items" }).value, 50)
                test.eq(s:get({ namespace = NS, key = "api_token" }).error, expected)
            end)
            env.set("ENCRYPTION_KEY", TEST_KEY)
            local _, reload_err = writer.reload()
            test.is_nil(reload_err)
            test.eq(s:get({ namespace = NS, key = "api_token" }).value, "preserve-me")
            s:unset({ namespace = NS, key = "api_token" })
            s:unset({ namespace = NS, key = "max_items" })
            if not ok then error(test_err, 0) end
        end)

        test.it("isolates malformed stored JSON from other settings", function()
            local s = open_settings()
            test.eq(s:set({ namespace = NS, key = "max_items", value = 7 }).success, true)
            local db = assert(sql.get("app:db"))
            local _, write_err = db:execute(
                "UPDATE kickside_settings SET value = $1 WHERE namespace = $2 AND key = $3",
                { "not-json", NS, "max_items" })
            db:release()
            test.is_nil(write_err)
            local ok, test_err = pcall(function()
                local map, err = writer.reload()
                test.is_nil(err)
                local expected = map[NS .. "\0max_items"].error
                test.not_nil(expected)
                local bad = s:get({ namespace = NS, key = "max_items" })
                test.eq(bad.success, false)
                test.is_nil(bad.value)
                test.eq(bad.error, expected)
                test.eq(s:set({ namespace = NS, key = "internal_flag", value = true }).success, true)
                test.eq(s:get({ namespace = NS, key = "internal_flag" }).value, true)
                test.eq(s:get({ namespace = NS, key = "max_items" }).error, expected)
                local listed = s:list({ namespace = NS })
                test.eq(listed.success, true)
                for _, row in ipairs(listed.settings) do
                    if row.key == "max_items" then
                        test.eq(row.error, expected)
                        test.is_nil(row.value)
                        test.eq(row.is_default, false)
                    end
                end
            end)
            s:unset({ namespace = NS, key = "max_items" })
            s:unset({ namespace = NS, key = "internal_flag" })
            if not ok then error(test_err, 0) end
        end)

        test.it("passes a stored false override to transition validation", function()
            local s = open_settings()
            test.eq(s:set({ namespace = NS, key = "transition_flag", value = false }).success, true)
            local result = s:set({ namespace = NS, key = "transition_flag", value = true })
            test.eq(result.success, true)
            s:unset({ namespace = NS, key = "transition_flag" })
        end)

        test.it("a non-visible setting is excluded from list but settable via the contract", function()
            local s = open_settings()
            local listed = nil
            for _, e in ipairs(s:list({ namespace = NS }).settings) do
                if e.key == "internal_flag" then listed = e end
            end
            test.eq(listed, nil)
            -- Still writable + readable through the contract (backend-manageable).
            test.eq(s:set({ namespace = NS, key = "internal_flag", value = true }).success, true)
            test.eq(s:get({ namespace = NS, key = "internal_flag" }).value, true)
            s:unset({ namespace = NS, key = "internal_flag" })
        end)

        test.it("list surfaces a declared per-setting schema", function()
            local found = nil
            for _, e in ipairs(open_settings():list({ namespace = NS }).settings) do
                if e.key == "page_size" then found = e end
            end
            test.not_nil(found)
            test.not_nil(found.schema)
            test.eq(found.schema.type, "integer")
            test.eq(found.schema.minimum, 1)
            test.eq(found.schema.maximum, 100)
        end)

        test.it("validate_func rejects an invalid change before persisting", function()
            local s = open_settings()
            local r = s:set({ namespace = NS, key = "positive_quota", value = -1 })
            test.eq(r.success, false)
            test.eq(r.error, "must be non-negative")
            -- The rejected write never persisted: the value stays the default.
            test.eq(s:get({ namespace = NS, key = "positive_quota" }).value, 5)
        end)

        test.it("validate_func accepts a valid change", function()
            local s = open_settings()
            local r = s:set({ namespace = NS, key = "positive_quota", value = 12 })
            test.eq(r.success, true)
            test.eq(s:get({ namespace = NS, key = "positive_quota" }).value, 12)
            s:unset({ namespace = NS, key = "positive_quota" })
        end)

        test.it("secret value is masked in list, only presence reported", function()
            env.set("ENCRYPTION_KEY", TEST_KEY)
            local s = open_settings()
            s:set({ namespace = NS, key = "api_token", value = "do-not-leak" })
            local found = nil
            for _, e in ipairs(s:list({ namespace = NS }).settings) do
                if e.key == "api_token" then found = e end
            end
            test.not_nil(found)
            test.eq(found.is_secret, true)
            test.eq(found.value, nil)
            test.eq(found.has_value, true)
            s:unset({ namespace = NS, key = "api_token" })
        end)

        test.it("persists updated_at as a Z-suffixed RFC3339 UTC string", function()
            local s = open_settings()
            s:set({ namespace = NS, key = "max_items", value = 4 })
            local db = sql.get("app:db")
            test.not_nil(db)
            local dbh = db :: any
            local rows = dbh:query(
                "SELECT updated_at FROM kickside_settings WHERE namespace = $1 AND key = $2",
                { NS, "max_items" })
            dbh:release()
            test.eq(#rows, 1)
            local raw = tostring(rows[1].updated_at)
            test.eq(raw:sub(-1), "Z")
            local parsed, perr = time.parse(time.RFC3339, raw)
            test.is_nil(perr)
            test.not_nil(parsed)
            s:unset({ namespace = NS, key = "max_items" })
        end)

        test.it("a read before the cache is warmed surfaces an error, never a silent DB reload", function()
            -- Boot is the sole cache owner; a read must never provision the cache.
            -- Force the cache cold and confirm the read fails loudly instead of
            -- silently reloading from the DB and returning a value.
            local s = store.get("kickside.settings:cache")
            test.not_nil(s)
            local sh = s :: any
            sh:set("overrides", "null", 0)
            sh:release()

            local r = open_settings():get({ namespace = NS, key = "max_items" })
            test.eq(r.success, false)
            test.not_nil(r.error)

            -- Re-warm the cache from the DB so the remaining suite reads served state.
            writer.reload()
            test.eq(open_settings():get({ namespace = NS, key = "max_items" }).success, true)
        end)

        test.it("admin-only settings are denied by get and omitted by get_namespace for non-admins", function()
            local member = open_settings_as("user", "app:settings_user_runtime_policy")
            test.eq(member:get({ namespace = NS, key = "max_items" }).success, true)
            local r = member:get({ namespace = NS, key = "admin_state" })
            test.eq(r.success, false)
            test.is_nil(r.value)
            local ns = member:get_namespace({ namespace = NS })
            test.eq(ns.success, true)
            test.is_nil(ns.values.admin_state)
            test.eq(ns.values.max_items, 50)
            test.eq(open_settings():get({ namespace = NS, key = "admin_state" }).success, true)
        end)

        test.it("non-admin runtime cannot mutate or list settings through the contract", function()
            local s = open_settings_as("user", "app:settings_user_runtime_policy")
            local set_result = s:set({ namespace = NS, key = "max_items", value = 11 })
            test.eq(set_result.success, false)
            test.eq(set_result.error, "admin settings write access is required")

            local unset_result = s:unset({ namespace = NS, key = "max_items" })
            test.eq(unset_result.success, false)
            test.eq(unset_result.error, "admin settings write access is required")

            local list_result = s:list({ namespace = NS })
            test.eq(list_result.success, false)
            test.eq(list_result.error, "admin settings list access is required")
        end)

        test.it("declared component-backed settings blocks resolve to view components", function()
            local views = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "view.component" }) or {}
            local by_tag: { [string]: boolean } = {}
            for _, entry in ipairs(views) do
                local meta = (entry :: any).meta or {}
                if type(meta.tag_name) == "string" and meta.tag_name ~= "" then
                    by_tag[meta.tag_name] = true
                end
            end

            local blocks = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "kickside.settings:block" }) or {}
            local checked = 0
            for _, entry in ipairs(blocks) do
                local data = (entry :: any).data or {}
                local tag = data.component_tag
                if type(tag) == "string" and tag ~= "" then
                    checked = checked + 1
                    test.is_true(by_tag[tag], "settings block component_tag must resolve as view.component: " .. tag)
                end
            end
            test.is_true(checked > 0, "test harness should include at least one component-backed settings block")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
