-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local capacity = require("capacity")

local function fixture()
    local counters = {find = 0, get = 0, settings = 0}
    local values = {global_limit = 2, key_limit = 2}
    local function entry(id)
        return {id = id, meta = {job_capacity = "fixture.capacity", job_capacity_settings = {
            namespace = "fixture.capacity", global_limit_key = "global_limit", concurrency_key_limit_key = "key_limit"}}}
    end
    local entries = {entry("fixture:a"), entry("fixture:b")}
    local lib = capacity.new({registry = {
        find = function() counters.find = counters.find + 1; return entries, nil end,
        get = function() counters.get = counters.get + 1; return {meta = {}}, nil end,
    }, contract = {get = function() return {open = function() return {get = function(_, args)
        counters.settings = counters.settings + 1
        return {success = true, value = values[args.key]}, nil
    end}, nil end}, nil end}})
    return lib, entries, counters, values
end

return {run = test.run_cases(function()
    test.describe("capacity declaration snapshots", function()
        test.it("preserves function and process worker references for undeclared workers", function()
            for _, worker in ipairs({"func://app:generic_job_target", "proc://app:supervision_child"}) do
                local descriptor, err = capacity.admit(worker, nil)
                test.is_nil(err)
                test.is_nil(descriptor)
            end
        end)
        test.it("recognizes a declared worker through its function reference", function()
            local descriptor, err = capacity.admit("func://app:capacity_worker_a", "uri-key")
            test.is_nil(err)
            test.not_nil(descriptor)
            test.eq(descriptor.group, "app.capacity")
            local scoped, scoped_err = capacity.snapshot().group({worker_ref = "func://app:capacity_worker_a",
                concurrency_key = "uri-key", capacity_group = "app.capacity"})
            test.is_nil(scoped_err)
            test.eq(scoped.group, "app.capacity")
        end)
        test.it("discovers real worker groups using supported flat registry metadata", function()
            local rows, err = registry.find({["meta.job_capacity"] = "app.capacity"})
            test.is_nil(err)
            test.eq(#rows, 2)
            local all, all_err = registry.find({["~meta.job_capacity"] = ".+"})
            test.is_nil(all_err)
            test.eq(#all, 3)
        end)
        test.it("bounds declaration discovery and Settings reads for many jobs in one operation", function()
            local lib, _, counters, values = fixture()
            local snapshot = lib.snapshot()
            for index = 1, 100 do
                local descriptor, err = snapshot.group({worker_ref = index % 2 == 0 and "fixture:a" or "fixture:b",
                    concurrency_key = "key-" .. tostring(index), capacity_group = "fixture.capacity"})
                test.is_nil(err)
                local limits, limits_err = snapshot.limits(descriptor)
                test.is_nil(limits_err)
                test.eq(limits.global_limit, 2)
            end
            test.eq(counters.find, 1)
            test.eq(counters.get, 0)
            test.eq(counters.settings, 2)
            values.global_limit = 3
            local next_operation = lib.snapshot()
            local descriptor, err = next_operation.group({worker_ref = "fixture:a", concurrency_key = "next"})
            test.is_nil(err)
            local limits, limits_err = next_operation.limits(descriptor)
            test.is_nil(limits_err)
            test.eq(limits.global_limit, 3)
            test.eq(counters.find, 2)
            test.eq(counters.settings, 4)
        end)
        test.it("rejects inconsistent Settings declarations within the active group", function()
            local lib, entries = fixture()
            entries[2].meta.job_capacity_settings.namespace = "different.settings"
            local descriptor, err = lib.snapshot().group({worker_ref = "fixture:a", concurrency_key = "key"})
            test.is_nil(descriptor)
            test.is_true(errors.is(err, errors.INVALID))
        end)
        test.it("does not bypass an admitted group when a worker loses its declaration", function()
            local lib = fixture()
            local job = {worker_ref = "fixture:removed", concurrency_key = "key", capacity_group = "fixture.capacity"}
            local descriptor, err = lib.group(job)
            test.is_nil(descriptor)
            test.is_true(errors.is(err, errors.INVALID))
            local scoped, scoped_err = lib.snapshot().group(job)
            test.is_nil(scoped)
            test.is_true(errors.is(scoped_err, errors.INVALID))
        end)
        test.it("does not read Settings for an undeclared worker or validate an unrelated group", function()
            local lib, entries, counters = fixture()
            entries[2].meta.job_capacity = "unrelated"
            entries[2].meta.job_capacity_settings = nil
            local snapshot = lib.snapshot()
            local legacy, legacy_err = snapshot.group({worker_ref = "fixture:legacy"})
            test.is_nil(legacy)
            test.is_nil(legacy_err)
            local active, active_err = snapshot.group({worker_ref = "fixture:a", concurrency_key = "key"})
            test.is_nil(active_err)
            test.eq(active.group, "fixture.capacity")
            test.eq(counters.settings, 0)
        end)
    end)
end)}
