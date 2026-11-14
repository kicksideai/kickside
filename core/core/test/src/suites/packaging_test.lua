-- Packaging / mount test. Unlike the per-slice unit suites, this asserts the
-- module's src entries resolve as a whole against the live (requirement-injected)
-- registry: every supervised service points at a process that exists, every
-- spawned/scheduled reference is a real entry, and every env.variable's storage
-- is registered. These are the integration seams the isolated unit harness masks
-- — the gaps that let a supervisor spawn a nonexistent worker factory and a test
-- fixture bind a harness-only storage id ride along into a mounted boot.

local test = require("test")
local registry = require("registry")
local core_db = require("core_db")
local threads_env = require("threads_env")
local retention_policy = require("retention_policy")

-- The module's namespace prefix; every entry under it is in-scope for this check.
local CORE_PREFIX = "kickside.core"

local function trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- Entry kind, supporting both the top-level and data-nested shapes the loader
-- may produce.
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

-- Read a field off an entry's data payload (where _index.yaml body fields land).
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

local function entry_meta_type(entry: any): string
    if type(entry) ~= "table" then
        return ""
    end
    local meta = type(entry.meta) == "table" and entry.meta or nil
    if not meta and type(entry.data) == "table" and type(entry.data.meta) == "table" then
        meta = entry.data.meta
    end
    if not meta then
        return ""
    end
    return trim(meta.type)
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

local function id_in_core(id: string): boolean
    return id_has_prefix(id, CORE_PREFIX)
end

-- True when a registry id resolves to a real entry.
local function resolves(id: string): boolean
    if id == "" then
        return false
    end
    local entry = registry.get(id)
    return entry ~= nil
end

-- Core entries of a given kind. registry.find's kind filter is not relied on;
-- the kind is read off each returned entry so both the top-level and data-nested
-- shapes are handled uniformly.
local function core_entries_of_kind(kind: string): { any }
    local all, err = registry.find({})
    if err then
        return {}
    end
    local out: { any } = {}
    for _, entry in ipairs(all or {}) do
        if id_in_core(trim(entry.id)) and entry_kind(entry) == kind then
            out[#out + 1] = entry
        end
    end
    return out
end

local function define_tests()
    test.describe("kickside.core packaging", function()
        test.it("routes target_db through every migration and runtime DB access", function()
            local requirement = registry.get("kickside.core:target_db")
            test.not_nil(requirement)
            local targets: any = {}
            for _, target in ipairs((((requirement :: any).data or requirement).targets or {}) :: { any }) do
                targets[tostring((target :: any).entry)] = tostring((target :: any).path)
            end
            for _, id in ipairs({
                "kickside.core.migrations:01_thread",
                "kickside.core.migrations:02_projection",
                "kickside.core.migrations:05_retention",
                "kickside.core.migrations:06_graph",
                "kickside.core.migrations:07_retention_pins",
                "kickside.core.migrations:08_write_receipts",
            }) do
                test.eq(targets[id], ".meta.target_db")
            end
            test.eq(targets["kickside.core:db_config"], ".meta.db_id")

            local config = registry.get(core_db.CONFIG)
            test.not_nil(config)
            local db_id = tostring((config :: any).meta.db_id)
            test.eq(core_db.id(), db_id)
            test.eq(threads_env.db_id(), db_id)
        end)

        test.it("declares retention windows and batches in the core policy", function()
            local policy = registry.get("kickside.core:policy")
            test.not_nil(policy)
            test.eq(((policy :: any).meta :: any).retention.events, "90d")
            test.eq(((policy :: any).meta :: any).retention.receipts_orphan, "30d")
            test.eq(((policy :: any).meta :: any).sweep.batch_events, 5000)
            test.eq(((policy :: any).meta :: any).sweep.batch_receipts, 500)
            test.is_nil((registry.get("kickside.core.retention:policy")))
            local resolved, policy_err = retention_policy.policy()
            test.is_nil(policy_err)
            test.eq(resolved.events_ms, 90 * 86400000)
        end)

        test.it("routes every core-owned process host through requirements", function()
            local expected = {
                ["kickside.core.threads:process_host"] = {
                    ["kickside.core.threads:workspace_plugin"] = ".meta.default_host",
                    ["kickside.core.threads:cursor_waiter.service"] = ".host",
                },
            }
            for requirement_id, targets_expected in pairs(expected) do
                local requirement = registry.get(requirement_id)
                test.not_nil(requirement)
                local targets = data_value(requirement, "targets") or {}
                local expected_count = 0
                for _ in pairs(targets_expected) do expected_count = expected_count + 1 end
                test.eq(#targets, expected_count)
                local actual: any = {}
                for _, target in ipairs(targets) do
                    actual[tostring(target.entry)] = tostring(target.path)
                end
                for target_id, target_path in pairs(targets_expected) do
                    test.eq(actual[target_id], target_path)
                end
            end

            local entry, err = registry.get("kickside.core.projections:advance")
            test.is_nil(err, tostring(err))
            test.not_nil(entry)
        end)

        test.it("runs projection slots on the jobs pool's awaited slots", function()
            -- catch_up_projection callers wait on the slot job; a waiting job
            -- must never hold the only worker that slot could run on.
            local entry = registry.get("kickside.core.projections:advance")
            test.not_nil(entry)
            test.eq(((entry :: any).meta :: any).job_class, "awaited")
            local awaited = registry.find({ ["meta.job_class"] = "awaited" }) or {}
            local found = false
            for _, candidate in ipairs(awaited) do
                if tostring((candidate :: any).id) == "kickside.core.projections:advance" then found = true end
            end
            test.is_true(found, "the jobs pool discovers projection slots as awaited work")
        end)

        test.it("every supervised service points at an existing process", function()
            local services = core_entries_of_kind("process.service")
            local checked = 0
            for _, svc in ipairs(services) do
                local id = trim(svc.id)
                local process_id = data_field(svc, "process")
                -- A bare name resolves within the service's own namespace; an
                -- already-qualified id resolves as-is.
                local qualified = process_id
                if process_id ~= "" and not process_id:find(":") then
                    local ns = id:match("^(.*):")
                    qualified = (ns or "") .. ":" .. process_id
                end
                test.is_true(resolves(qualified),
                    id .. " references missing process '" .. process_id .. "'")
                checked = checked + 1
            end
            test.is_true(checked > 0, "expected at least one core process.service")
        end)

        test.it("every supervised core service starts with the process security scope", function()
            local checked = 0
            for _, svc in ipairs(core_entries_of_kind("process.service")) do
                checked = checked + 1
                test.is_true(has_process_scope(svc),
                    trim(svc.id) .. " must declare lifecycle.security.groups wippy.security:process")
            end
            test.is_true(checked > 0, "expected at least one core process.service")
        end)

        -- The job worker / loop ownership and the phantom-factory guards moved to
        -- the kickside/jobs packaging test with the job engine itself.

        test.it("every core requirement has at least one target", function()
            for _, requirement in ipairs(core_entries_of_kind("ns.requirement")) do
                local targets = data_value(requirement, "targets")
                test.is_true(type(targets) == "table" and #targets > 0,
                    trim(requirement.id) .. " must declare at least one target")
            end
        end)

        test.it("every core env.variable binds a storage that resolves", function()
            -- An env.variable whose storage is not in the registry is exactly the
            -- 'referenced storage not found' boot error. Every operator knob must
            -- bind the wired env_storage requirement, which resolves in any host.
            for _, v in ipairs(core_entries_of_kind("env.variable")) do
                local storage = data_field(v, "storage")
                test.is_true(resolves(storage),
                    trim(v.id) .. " binds unresolved storage '" .. storage .. "'")
            end
        end)

        test.it("no test-only env.variable rides along in the published namespace", function()
            -- The leaked fixtures (KICKSIDE_CORE_JOB_TEST_*) bound a harness-only
            -- storage and logged 'referenced storage not found' on a clean mount.
            -- They now live in the test harness, so no core env.variable carries
            -- a test marker or a test-only OS variable name.
            for _, v in ipairs(core_entries_of_kind("env.variable")) do
                local meta = type(v.meta) == "table" and v.meta or {}
                test.neq(trim(meta.type), "test", trim(v.id) .. " is a test fixture in src")
                test.is_false(data_field(v, "variable"):find("_TEST_") ~= nil,
                    trim(v.id) .. " binds a test-only OS variable")
            end
        end)

        test.it("thread HTTP handlers use the thread contract boundary", function()
            -- HTTP adapters must not open the thread DB or emit notifications
            -- directly. The contract owns persistence, component access checks,
            -- thread fanout, and scheduler nudges.
            local forbidden = {
                threads_env = true,
                threads_writer = true,
                threads_reader = true,
                threads_notify = true,
            }
            local contract_parts = {
                ["kickside.core.threads:contract_resource"] = true,
                ["kickside.core.threads:contract_events"] = true,
                ["kickside.core.threads:contract_graph"] = true,
                ["kickside.core.threads:component_scope"] = true,
                ["kickside.core.threads:job_history"] = true,
            }
            local checked = 0
            for _, fn in ipairs(core_entries_of_kind("function.lua")) do
                local id = trim(fn.id)
                if id_has_prefix(id, "kickside.core.threads.api:") and entry_meta_type(fn) == "" then
                    checked = checked + 1
                    local imports = data_value(fn, "imports")
                    test.is_true(type(imports) == "table", id .. " must declare imports")
                    for name, _ in pairs(imports or {}) do
                        test.is_false(forbidden[name] == true,
                            id .. " bypasses the threads contract with import " .. tostring(name))
                    end
                    test.is_true(contract_parts[tostring(imports.threads_contract)] == true,
                        id .. " must route through a kickside.core.threads contract part")
                end
            end
            test.is_true(checked > 0, "expected production thread API function handlers")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
