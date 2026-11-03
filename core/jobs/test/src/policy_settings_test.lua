-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local config = require("config")
local runtime_policy = require("runtime_policy")
local admin = require("policy_settings_fixture")

local function update_entry(entry: any, meta: any): ()
    local changes = assert(registry.snapshot()):changes()
    changes:update({id = entry.id, kind = entry.kind, meta = meta, data = entry.data})
    assert(changes:apply())
end

-- with_host applies a host assignment to the Jobs policy entry for one check,
-- then writes the original assignments back.
local function with_host(edit: (table) -> (), check: () -> ()): ()
    local entry = assert(registry.get(config.POLICY))
    local original = config.copy(entry.meta)
    local meta = config.copy(entry.meta)
    edit(meta)
    update_entry(entry, meta)
    local ok, err = pcall(check)
    update_entry(entry, original)
    test.is_true(ok, tostring(err))
end

return { run = test.run_cases(function()
    test.describe("Jobs policy through Settings", function()
        test.after_each(function()
            admin.reset({"worker.count_postgres", "lease.timeout", "lease.heartbeat", "proc.max_execution"})
        end)

        test.it("keeps the shipped defaults", function()
            local entry = assert(registry.get(config.POLICY))
            test.eq(entry.data.defaults.worker.count_postgres, 4)
            test.eq(entry.data.defaults.proc.max_execution, "10m")
            local policy = assert(runtime_policy.resolve())
            test.eq(policy.worker_count_postgres, 4)
            test.eq(policy.proc_max_execution_ms, 600000)
        end)

        test.it("applies an administrator override over the host and shipped values", function()
            with_host(function(meta) meta.worker.count_postgres = 30 end, function()
                test.eq(assert(runtime_policy.resolve()).worker_count_postgres, 30)
                test.is_nil(admin.set({["worker.count_postgres"] = 40}))
                test.eq(assert(runtime_policy.overrides())["worker.count_postgres"], 40)
                test.eq(assert(runtime_policy.resolve()).worker_count_postgres, 40)
                admin.reset({"worker.count_postgres"})
                test.is_nil(assert(runtime_policy.overrides())["worker.count_postgres"])
                test.eq(assert(runtime_policy.resolve()).worker_count_postgres, 30, "a reset restores the host value")
            end)
        end)

        test.it("treats an override equal to the shipped default as an override", function()
            with_host(function(meta) meta.worker.count_postgres = 30 end, function()
                test.is_nil(admin.set({["worker.count_postgres"] = 4}))
                test.eq(assert(runtime_policy.resolve()).worker_count_postgres, 4)
            end)
        end)

        test.it("refuses values the Jobs policy rejects and keeps the stored override", function()
            test.is_nil(admin.set({["lease.timeout"] = "60s", ["lease.heartbeat"] = "15s"}))
            for _, values in ipairs({
                {["lease.heartbeat"] = "60s"}, {["lease.timeout"] = "500ms"},
                {["worker.count_postgres"] = 257}, {["worker.count_sqlite"] = 3},
                {["fairness.shares"] = {live = 0, backfill = 0, maintenance = 0}},
            }) do
                local key = next(values)
                test.not_nil(admin.set(values), tostring(key))
            end
            local policy = assert(runtime_policy.resolve())
            test.eq(policy.lease_timeout_seconds, 60)
            test.eq(policy.lease_heartbeat_ms, 15000)
        end)

        test.it("accepts the native duration grammar for overrides", function()
            for _, value in ipairs({"+45s", ".5s", "1.s"}) do
                local result, err = config.runtime({["proc.max_execution"] = value})
                test.is_nil(err, value)
                test.is_true(result.proc_max_execution_ms >= 1)
            end
            test.is_nil(admin.set({["proc.max_execution"] = "30m"}))
            test.eq(assert(runtime_policy.resolve()).proc_max_execution_ms, 1800000)
        end)

        test.it("keeps fixed registry reads independent of Settings overrides", function()
            test.is_nil(admin.set({["worker.count_postgres"] = 37}))
            test.eq(assert(config.policy()).worker_count_postgres, 4)
            test.eq(assert(runtime_policy.resolve()).worker_count_postgres, 37)
        end)

        test.it("runs on the registry and host policy when Settings is not installed", function()
            local removed = {}
            for _, id in ipairs({"kickside.settings:settings_binding", "kickside.settings:settings", "kickside.settings:changes"}) do
                removed[#removed + 1] = assert(registry.get(id))
            end
            local changes = assert(registry.snapshot()):changes()
            for _, entry in ipairs(removed) do changes:delete(entry.id) end
            assert(changes:apply())
            local ok, err = pcall(function()
                local values = assert(runtime_policy.overrides())
                test.is_nil(next(values))
                local inbox, subscribe_err = runtime_policy.subscribe()
                test.is_nil(subscribe_err)
                test.is_nil(inbox)
                test.eq(assert(runtime_policy.resolve()).worker_count_postgres, 4)
            end)
            local restore = assert(registry.snapshot()):changes()
            for index = #removed, 1, -1 do
                local entry = removed[index]
                restore:create({id = entry.id, kind = entry.kind, meta = entry.meta, data = entry.data})
            end
            assert(restore:apply())
            test.is_true(ok, tostring(err))
        end)
    end)
end) }
