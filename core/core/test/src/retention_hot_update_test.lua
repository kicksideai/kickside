-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local process = require("process")
local time = require("time")
local fixture = require("fixture")
local notifier = require("notifier")
local published_reader = require("published_reader")

local function wait_until(check: any, message: string): any
    local until_ns = time.now():unix_nano() + 15 * time.SECOND
    repeat
        local value = check()
        if value then return value end
        time.sleep("10ms")
    until time.now():unix_nano() >= until_ns
    error(message)
end

local function copy(value: table): table
    local out = {}
    for key, item in pairs(value) do out[key] = item end
    return out
end

return {run = test.run_cases(function()
    test.describe("published retention hot update", function()
        local original
        test.after_each(function()
            if original then
                local _, err = registry.apply_version(original)
                test.is_nil(err)
                wait_until(function()
                    local pid = process.registry.lookup(notifier.NAME, process.registry.CONSISTENT)
                    return pid == nil
                end, "test retention service does not stop")
            end
        end)
        test.it("keeps a supervised sweeper deleting after policy data and code change together", function()
            original = assert(registry.current_version())
            local candidate = assert(registry.get("kickside.core:policy_config"))
            local published = assert(registry.get("app:published_retention_policy"))
            local policy = assert(registry.get("kickside.core:policy"))
            local compatible, compatibility_err = published_reader.resolve(policy.meta)
            test.is_nil(compatibility_err)
            test.eq(compatible.events_ms, 30 * 86400000)
            local old_meta = copy(policy.meta)
            old_meta.retention = copy(policy.meta.retention)
            old_meta.retention.events = "90d"
            local old_data = copy(candidate.data)
            old_data.source = published.data.source
            local inherited = fixture.make_thread()
            local expired = fixture.make_thread()
            fixture.add_bulk_events(inherited, 11, 60)
            fixture.add_bulk_events(expired, 1, 120)
            local changes = assert(registry.snapshot()):changes()
            changes:update({id = policy.id, kind = policy.kind, meta = old_meta, data = policy.data})
            changes:update({id = candidate.id, kind = candidate.kind, meta = candidate.meta, data = old_data})
            local service = assert(registry.get("kickside.core.retention.service:sweeper.service"))
            local data = copy(service.data)
            data.host = "app:processes"
            data.lifecycle = copy(data.lifecycle)
            data.lifecycle.auto_start = true
            changes:create({id = "app:retention_update_service", kind = service.kind, meta = service.meta, data = data})
            assert(changes:apply())
            wait_until(function() return fixture.boundary_of(expired) == 1 end, "published sweeper does not prune old data")
            test.eq(#fixture.seqs_of(inherited), 11)
            local before = tostring(assert(process.registry.lookup(notifier.NAME, process.registry.CONSISTENT)))
            changes = assert(registry.snapshot()):changes()
            changes:update({id = policy.id, kind = policy.kind, meta = policy.meta, data = policy.data})
            changes:update(candidate)
            assert(changes:apply())
            wait_until(function() return fixture.boundary_of(inherited) == 11 end, "hot update stops retention before newly eligible events are pruned")
            local after = wait_until(function()
                local pid = process.registry.lookup(notifier.NAME, process.registry.CONSISTENT)
                return pid and tostring(pid) ~= before and tostring(pid)
            end, "updated code does not replace the published process")
            local subsequent = fixture.make_thread()
            fixture.add_bulk_events(subsequent, 3, 60)
            local delivered, notify_err = notifier.notify({kind = "events_appended", thread_id = subsequent})
            test.is_nil(notify_err)
            test.is_true(delivered)
            wait_until(function() return fixture.boundary_of(subsequent) == 3 end, "updated sweeper does not handle subsequent eligibility")
            test.eq(tostring(assert(process.registry.lookup(notifier.NAME, process.registry.CONSISTENT))), after)
        end)
    end)
end)}
