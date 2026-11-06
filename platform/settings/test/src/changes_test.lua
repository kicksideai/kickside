-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local contract = require("contract")
local security = require("security")
local sql = require("sql")
local json = require("json")
local time = require("time")
local channel = require("channel")
local process = require("process")
local store = require("store")
local cache = require("settings_cache")
local registry = require("registry")
local writer = require("settings_writer")
local changes = require("settings_changes")

local NS = "kickside.settings.test"

local function open_settings(): any
    local policy = assert(security.policy("app:settings_admin_policy"))
    local def = assert(contract.get("kickside.settings:settings"))
    return assert((def :: any)
        :with_actor(security.new_actor("admin", {}))
        :with_scope(security.new_scope({ policy }))
        :open())
end

-- receive returns the next value on topic, or nil after the timeout.
local function receive(inbox: any, timeout: string): any
    local result = channel.select({ inbox:case_receive(), time.after(timeout):case_receive() })
    if result.channel == inbox then return result.value end
    return nil
end

-- commit_elsewhere writes an override and bumps the revision the way a writer
-- on another node does, without touching this node's cache.
local function commit_elsewhere(key: string, value: any): number
    local db = assert(sql.get("app:db"))
    local tx = assert(db:begin())
    assert(tx:execute([[
        INSERT INTO kickside_settings (namespace, key, value, value_type, updated_by, updated_at)
        VALUES ($1, $2, $3, 'int', 'peer', '2026-11-03T00:00:00Z')
        ON CONFLICT (namespace, key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by
    ]], { NS, key, json.encode(value) }))
    assert(tx:execute("UPDATE kickside_settings_revision SET revision = revision + 1 WHERE id = 1", {}))
    local rows = assert(tx:query("SELECT revision FROM kickside_settings_revision WHERE id = 1", {}))
    assert(tx:commit())
    db:release()
    return tonumber(rows[1].revision) :: number
end

local function define_tests()
    test.describe("KickSide Settings change propagation", function()
        local listener: string? = nil
        local revisions: any = nil

        test.before_all(function()
            revisions = process.listen("listener.revision")
            local ready = process.listen("listener.ready")
            listener = assert(process.spawn_monitored("app:change_listener", "app:processes", process.pid()))
            test.not_nil(receive(ready, "5s"), "change listener joins the subscribers")
        end)

        test.after_all(function()
            if listener then process.cancel(listener, "1s") end
            open_settings():unset({ namespace = NS, key = "max_items" })
        end)

        test.it("runs the keeper on the host's processes without an explicit binding", function()
            local registry = require("registry")
            local service = assert(registry.get("kickside.settings.service:keeper.service"))
            test.eq(service.data.host, "app:processes")
        end)

        test.it("commits each change with the next revision and tells subscribers once", function()
            local before = assert(writer.stored_revision())
            test.eq(open_settings():set({ namespace = NS, key = "max_items", value = 61 }).success, true)
            test.eq(writer.stored_revision(), before + 1)
            test.eq(receive(revisions, "5s"), before + 1)
            test.is_nil(receive(revisions, "300ms"), "a revision is announced once")
        end)

        test.it("recovers a cache emptied after the keeper starts and announces the next write once", function()
            local before = assert(writer.stored_revision())
            local handle = assert(store.get("kickside.settings:cache"))
            assert(handle:delete("snapshot"))
            handle:release()
            test.is_nil(cache.read())
            local response = open_settings():get({ namespace = NS, key = "max_items" })
            test.eq(response.success, true, tostring(response.error))
            test.eq(response.value, 61)
            test.eq(cache.revision(), before)
            test.is_nil(receive(revisions, "300ms"), "a read does not announce a revision")
            test.eq(open_settings():set({ namespace = NS, key = "max_items", value = 61 }).success, true)
            test.eq(writer.stored_revision(), before + 1)
            test.eq(cache.revision(), before + 1)
            test.eq(receive(revisions, "5s"), before + 1)
            assert(changes.publish(before + 1))
            test.is_nil(receive(revisions, "300ms"), "a revision is announced once after cold recovery")
        end)

        test.it("reloads this node when another node publishes its committed revision", function()
            local revision = commit_elsewhere("max_items", 62)
            test.eq(open_settings():get({ namespace = NS, key = "max_items" }).value, 61)
            assert(changes.publish(revision))
            test.eq(receive(revisions, "5s"), revision)
            test.eq(open_settings():get({ namespace = NS, key = "max_items" }).value, 62)
        end)

        test.it("reloads an older write-through cache from the stored rows", function()
            local elsewhere = commit_elsewhere("max_items", 63)
            test.eq(open_settings():set({ namespace = NS, key = "page_size", value = 7 }).success, true)
            test.eq(receive(revisions, "5s"), elsewhere + 1)
            test.eq(open_settings():get({ namespace = NS, key = "max_items" }).value, 63)
            open_settings():unset({ namespace = NS, key = "page_size" })
            test.eq(receive(revisions, "5s"), elsewhere + 2)
        end)

        test.it("rechecks the stored revision when another keeper joins", function()
            local revision = commit_elsewhere("max_items", 64)
            local peer = assert(process.spawn_monitored("app:keeper_peer", "app:processes"))
            test.eq(receive(revisions, "5s"), revision)
            test.eq(open_settings():get({ namespace = NS, key = "max_items" }).value, 64)
            process.cancel(peer, "1s")
        end)
        test.it("recovers after a registry update replaces the running memory store", function()
            local entry = assert(registry.get("kickside.settings:cache"))
            local before = assert(writer.stored_revision())
            local function replace(size: number)
                local data = {}
                for key, value in pairs(entry.data) do data[key] = value end
                data.max_size = size
                local edits = assert(registry.snapshot()):changes()
                edits:update({ id = entry.id, kind = entry.kind, meta = entry.meta, data = data })
                assert(edits:apply())
            end
            local ok, err = pcall(function()
                replace(entry.data.max_size + 1)
                test.is_nil(cache.read(), "the replacement store starts empty")
                local response = open_settings():get({ namespace = NS, key = "max_items" })
                test.eq(response.success, true, tostring(response.error))
                test.eq(response.value, 64)
                test.eq(cache.revision(), before)
                test.eq(writer.stored_revision(), before)
                test.is_nil(receive(revisions, "300ms"), "reloading does not announce the same revision")
            end)
            replace(entry.data.max_size)
            local _, reload_err = writer.reload()
            if not ok then error(err, 0) end
            test.is_nil(reload_err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
