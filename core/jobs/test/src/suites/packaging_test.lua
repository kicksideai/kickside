-- Packaging / mount test for the jobs module. Asserts the jobs src entries
-- resolve as a whole against the live (requirement-injected) registry: every
-- supervised service points at a process that exists, the job worker is the
-- single supervised owner of job processing, no phantom worker factory
-- survives, the per-slot loop the pool spawns exists, and every env.variable
-- binds a registered storage. The core dependency is mounted in the harness, so
-- the scan is scoped to the jobs namespaces this module owns. The projection
-- scheduler slice lives in the core module now; its own mount coverage rides
-- with the core packaging test.

local test = require("test")
local registry = require("registry")
local config = require("config")

-- Namespaces this module owns; every entry under one of them is in scope.
local PREFIXES = {
    "kickside.core.jobs",
}

local function trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function entry_kind(entry: any): string
    if type(entry) ~= "table" then
        return ""
    end
    local kind = trim(entry.kind)
    if kind == "" and type(entry.data) == "table" then
        kind = trim(entry.data.kind)
    end
    return kind
end

local function data_field(entry: any, key: string): string
    if type(entry) ~= "table" or type(entry.data) ~= "table" then
        return ""
    end
    return trim(entry.data[key])
end

local function data_value(entry: any, key: string): any
    if type(entry) ~= "table" then
        return nil
    end
    if type(entry.data) == "table" then
        return entry.data[key]
    end
    return entry[key]
end

local function has_process_scope(entry: any): boolean
    local lifecycle = data_value(entry, "lifecycle")
    if type(lifecycle) ~= "table" or type(lifecycle.security) ~= "table" then
        return false
    end
    local groups = lifecycle.security.groups
    if type(groups) ~= "table" then
        return false
    end
    for _, group_id in ipairs(groups) do
        if group_id == "wippy.security:process" then
            return true
        end
    end
    return false
end

local function id_has_prefix(id: string, prefix: string): boolean
    return id:sub(1, #prefix) == prefix
end

local function id_in_scope(id: string): boolean
    for _, prefix in ipairs(PREFIXES) do
        if id_has_prefix(id, prefix) then
            return true
        end
    end
    return false
end

local function resolves(id: string): boolean
    if id == "" then
        return false
    end
    local entry = registry.get(id)
    return entry ~= nil
end

local function scoped_entries_of_kind(kind: string): { any }
    local all, err = registry.find({})
    if err then
        return {}
    end
    local out: { any } = {}
    for _, entry in ipairs(all or {}) do
        if id_in_scope(trim(entry.id)) and entry_kind(entry) == kind then
            out[#out + 1] = entry
        end
    end
    return out
end

local function define_tests()
    test.describe("kickside.core.jobs packaging", function()
        test.it("routes target_db to jobs runtime persistence", function()
            local requirement = registry.get("kickside.core.jobs:target_db")
            test.not_nil(requirement)
            test.eq(config.db_id(), "app:db")
        end)

        test.it("links realtime with only the existing database and process host requirements", function()
            local expected = "kickside.realtime:realtime_binding"
            local wiring = registry.get("kickside.core.jobs.performance:config")
            local meta = wiring.meta or data_value(wiring, "meta") or {}
            test.eq(meta.binding_id, expected)
            test.eq(data_value(registry.get("kickside.core.jobs.performance:binding"), "policy").resources, expected)
            test.eq(entry_kind(registry.get(expected)), "contract.binding")
        end)

        test.it("routes the service and every dynamic job child through process_host", function()
            local requirement = registry.get("kickside.core.jobs:process_host")
            test.not_nil(requirement)
            local expected_host = "app:processes"
            test.eq(data_field(registry.get("kickside.core.jobs.service:worker.service"), "host"), expected_host)
            local worker_security = data_value(registry.get("kickside.core.jobs.service:worker.service"), "lifecycle").security
            test.not_nil(worker_security.actor, "framework jobs worker carries its maintenance actor")
            test.eq(worker_security.actor.id, "system:kickside.jobs")

            local process_entry = registry.get("kickside.core.jobs:process_config")
            local process_meta = type(process_entry.meta) == "table" and process_entry.meta
                or (type(process_entry.data) == "table" and process_entry.data.meta)
                or {}
            test.eq(tostring(process_meta.host_id), expected_host)

            test.eq(config.process_host(), expected_host)
        end)

        test.it("every supervised service points at an existing process", function()
            local services = scoped_entries_of_kind("process.service")
            local checked = 0
            for _, svc in ipairs(services) do
                local id = trim(svc.id)
                local process_id = data_field(svc, "process")
                local qualified = process_id
                if process_id ~= "" and not process_id:find(":") then
                    local ns = id:match("^(.*):")
                    qualified = (ns or "") .. ":" .. process_id
                end
                test.is_true(resolves(qualified),
                    id .. " references missing process '" .. process_id .. "'")
                checked = checked + 1
            end
            test.is_true(checked > 0, "expected at least one jobs process.service")
        end)

        test.it("every supervised service starts with the process security scope", function()
            local checked = 0
            for _, svc in ipairs(scoped_entries_of_kind("process.service")) do
                checked = checked + 1
                test.is_true(has_process_scope(svc),
                    trim(svc.id) .. " must declare lifecycle.security.groups wippy.security:process")
            end
            test.is_true(checked > 0, "expected at least one jobs process.service")
        end)

        test.it("the job worker is the single supervised owner of job processing", function()
            local owners = {}
            for _, svc in ipairs(scoped_entries_of_kind("process.service")) do
                if data_field(svc, "process"):find("worker") then
                    owners[#owners + 1] = trim(svc.id)
                end
            end
            test.eq(#owners, 1, "expected exactly one job-worker service, got " .. tostring(#owners))
            test.eq(owners[1], "kickside.core.jobs.service:worker.service")
        end)


        test.it("the loop process the pool spawns exists", function()
            test.is_true(resolves("kickside.core.jobs.service:loop"),
                "the per-slot claim loop process must exist for pool scale-out")
        end)

        test.it("every env.variable binds a storage that resolves", function()
            for _, v in ipairs(scoped_entries_of_kind("env.variable")) do
                local storage = data_field(v, "storage")
                test.is_true(resolves(storage),
                    trim(v.id) .. " binds unresolved storage '" .. storage .. "'")
            end
        end)

        test.it("no test-only env.variable rides along in the published namespace", function()
            for _, v in ipairs(scoped_entries_of_kind("env.variable")) do
                local meta = type(v.meta) == "table" and v.meta or {}
                test.neq(trim(meta.type), "test", trim(v.id) .. " is a test fixture in src")
                test.is_false(data_field(v, "variable"):find("_TEST_") ~= nil,
                    trim(v.id) .. " binds a test-only OS variable")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
