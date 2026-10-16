-- Packaging / mount test. Asserts the module's src entries resolve as a whole
-- against the live (requirement-injected) registry rather than only inside the
-- isolated unit harness: every migration's target_db points at a db resource
-- that exists, and no entry binds a harness-only id. This is the seam the unit
-- suites mask — a migration that hardcoded a db id the mounted app does not
-- define would boot-fail with 'target db not found', invisible to the suites
-- because the harness happens to define that id.

local test = require("test")
local registry = require("registry")
local component_types = require("component_types")

local COMPONENT_PREFIX = "kickside.component"

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

local function id_in_module(id: string): boolean
    return id:sub(1, #COMPONENT_PREFIX) == COMPONENT_PREFIX
end

local function resolves(id: string): boolean
    if id == "" then
        return false
    end
    return registry.get(id) ~= nil
end

-- The migration's target db id lives on meta.target_db (where the requirement
-- injects it).
local function migration_target_db(entry: any): string
    if type(entry) ~= "table" or type(entry.meta) ~= "table" then
        return ""
    end
    return trim(entry.meta.target_db)
end

local function module_migrations(): { any }
    local all, err = registry.find({})
    if err then
        return {}
    end
    local out: { any } = {}
    for _, entry in ipairs(all or {}) do
        if id_in_module(trim(entry.id)) then
            local meta = type(entry.meta) == "table" and entry.meta or {}
            if entry_kind(entry) == "function.lua" and trim(meta.type) == "migration" then
                out[#out + 1] = entry
            end
        end
    end
    return out
end

local function define_tests()
    test.describe("kickside.component packaging", function()
        test.it("routes target_db through the runtime db config", function()
            local requirement = registry.get("kickside.component:target_db")
            test.not_nil(requirement)
            local targets: any = {}
            for _, target in ipairs((((requirement :: any).data or requirement).targets or {}) :: { any }) do
                targets[tostring((target :: any).entry)] = tostring((target :: any).path)
            end
            test.eq(targets["kickside.component:db_config"], ".meta.db_id")
            for _, id in ipairs({
                "kickside.component.migrations:01_create_components_table",
                "kickside.component.migrations:02_create_component_meta_table",
                "kickside.component.migrations:03_create_component_access_table",
            }) do
                test.eq(targets[id], ".meta.target_db")
            end

            local config = registry.get(component_types.DB_CONFIG)
            test.not_nil(config)
            test.eq(component_types.db_id(), tostring((config :: any).meta.db_id))
        end)

        test.it("every migration binds a target_db that resolves", function()
            local migrations = module_migrations()
            test.is_true(#migrations > 0, "expected component migrations to be discovered")
            for _, m in ipairs(migrations) do
                local target = migration_target_db(m)
                test.is_true(resolves(target),
                    trim(m.id) .. " binds unresolved target_db '" .. target .. "'")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
