-- Optional table owners register one retention callback. The existing core
-- retention process calls them on its tick; each owner keeps its SQL and policy.
local registry = require("registry")
local funcs = require("funcs")
local sql = require("sql")
local migration_repository = require("migration_repository")

local M = {}
local META_TYPE = "kickside.retention.owner"

type Owner = { id: string, module: string?, namespace: string? }
type Applied = { [string]: boolean }
type OwnerFailure = { owner: string, error: error }
type OwnerBlocked = { owner: string, component_id: string, error: error }
type Report = { deleted: integer, failures: { OwnerFailure }, needs_continue: boolean, blocked: { OwnerBlocked }, deadline_ms: integer? }

local function invalid_response(message: string, field: string, owner: string?): error
    return errors.new({message = message, kind = errors.INTERNAL, retryable = false,
        details = {code = "retention_owner_discovery_response", field = field, owner = owner}})
end

local cached_version: string? = nil
local cached_entries: table[]? = nil
local cached_definitions: table[]? = nil
local cached_migrations: { [string]: table[] } = {}

-- Registry declarations are immutable within a version. Migration ledgers and
-- owner callback results remain fresh on every retention pass.
function M.declarations(): (table[]?, table[]?, error?)
    local version, version_err = registry.current_version()
    if version_err then return nil, nil, errors.wrap(version_err, "retention registry version unavailable") end
    if not version then
        return nil, nil, invalid_response("retention registry version unavailable", "registry.current_version")
    end
    local id = tostring(version:id())
    if cached_version == id and cached_entries and cached_definitions then
        return cached_entries, cached_definitions, nil
    end
    local entries, find_err = registry.find({ ["meta.type"] = META_TYPE })
    if find_err then return nil, nil, errors.wrap(find_err, "retention owner discovery failed") end
    if type(entries) ~= "table" then
        return nil, nil, invalid_response("retention owner discovery failed", "retention.owners")
    end
    local definitions, definitions_err = registry.find({ [".kind"] = "ns.definition" })
    if definitions_err then return nil, nil, errors.wrap(definitions_err, "retention module discovery failed") end
    if type(definitions) ~= "table" then
        return nil, nil, invalid_response("retention module discovery failed", "retention.definitions")
    end
    cached_version, cached_entries, cached_definitions = id, entries, definitions
    cached_migrations = {}
    return entries, definitions, nil
end

function M.applied_ids(db: sql.DB): (table[]?, error?)
    local rows, read_err = db:query("SELECT id FROM _migrations")
    if read_err then return nil, errors.wrap(read_err, "retention migration ledger read failed") end
    if type(rows) ~= "table" then
        return nil, invalid_response("retention migration ledger read failed", "retention.migration_ids")
    end
    return rows, nil
end

-- Registry publication precedes hot-install migrations. The migration framework
-- records an id in _migrations in the same transaction as the schema change;
-- packed module provenance selects the owner's migrations. Source replacements
-- lack provenance, so use their declared ns.definition boundary. Never cache
-- readiness across passes: upgrades add work.
local function namespace(id: string, definitions: table[]): string?
    local ns = string.match(id, "^([^:]+):")
    if not ns then return nil end
    local selected: string? = nil
    for _, definition in ipairs(definitions) do
        local root = string.match(tostring(definition.id), "^([^:]+):")
        if root and (ns == root or string.sub(ns, 1, #root + 1) == root .. ".")
            and (not selected or #root > #selected) then selected = root end
    end
    return selected
end

local function ready(owner: Owner, definitions: table[], ledgers: { [string]: Applied }): (boolean?, error?)
    local key = owner.module and ("module:" .. owner.module) or ("namespace:" .. tostring(owner.namespace))
    local migrations = cached_migrations[key]
    if not migrations then
        local criteria: { [string]: string } = { [".kind"] = "function.*", ["meta.type"] = "migration" }
        if owner.module then criteria["meta.module"] = owner.module end
        local found, find_err = registry.find(criteria)
        if find_err then return nil, errors.wrap(find_err, "retention owner migration discovery failed") end
        if type(found) ~= "table" then
            return nil, invalid_response("retention owner migration discovery failed", "retention.owner_migrations")
        end
        migrations = {}
        for _, migration in ipairs(found) do
            if type(migration) ~= "table" then
                return nil, invalid_response("retention owner migration has no id or target_db", "retention.owner_migrations[]", owner.id)
            end
            if owner.module or namespace(tostring(migration.id), definitions) == owner.namespace then
                migrations[#migrations + 1] = migration
            end
        end
        cached_migrations[key] = migrations
    end
    for _, migration in ipairs(migrations) do
        local target_db = type(migration.meta) == "table" and migration.meta.target_db or nil
        if type(migration.id) ~= "string" or migration.id == "" or type(target_db) ~= "string" or target_db == "" then
            return nil, invalid_response("retention owner migration has no id or target_db", "retention.owner_migrations[]", owner.id)
        end
        local applied = ledgers[target_db]
        if not applied then
            local db, db_err = sql.get(target_db)
            if db_err then return nil, errors.wrap(db_err, "retention migration database unavailable") end
            if not db then return nil, invalid_response("retention migration database unavailable", "sql.get") end
            local exists, exists_err = migration_repository.table_exists(db)
            if exists_err then
                db:release()
                return nil, errors.wrap(exists_err, "retention migration ledger lookup failed")
            end
            if type(exists) ~= "boolean" then
                db:release()
                return nil, invalid_response("retention migration ledger lookup failed", "migration.table_exists")
            end
            local rows, read_err = {}, nil
            if exists then rows, read_err = M.applied_ids(db) end
            db:release()
            if read_err then return nil, read_err end
            applied = {}
            for _, row in ipairs(rows) do
                if type(row) ~= "table" or type(row.id) ~= "string" or row.id == "" then
                    return nil, invalid_response("retention migration ledger has no id", "retention.migration_ids[].id", owner.id)
                end
                applied[row.id] = true
            end
            ledgers[target_db] = applied
        end
        if not applied[migration.id] then return false, nil end
    end
    return true, nil
end

-- invoke runs one ready owner callback and returns its validated deleted count.
local function invoke(owner: Owner, definitions: table[], ledgers: { [string]: Applied }, change: table?): (integer?, error?, boolean?, table[]?, integer?)
    local is_ready, ready_err = ready(owner, definitions, ledgers)
    if ready_err then return nil, ready_err end
    if not is_ready then return 0, nil end
    local result, call_err = funcs.call(owner.id, { change = change })
    if call_err then return nil, errors.wrap(call_err, "retention owner " .. owner.id .. " failed") end
    if type(result) == "table" and result.success == false then
        if not result.error then
            return nil, invalid_response("retention owner " .. owner.id .. " failed", "retention.owner.error")
        end
        return nil, errors.wrap(result.error, "retention owner " .. owner.id .. " failed")
    end
    if type(result) ~= "table" or result.success ~= true
        or type(result.deleted) ~= "number" or result.deleted < 0
        or result.deleted ~= math.floor(result.deleted) then
        return nil, invalid_response("retention owner " .. owner.id .. " returned invalid result",
            "retention.owner.result", owner.id)
    end
    if result.blocked ~= nil then
        if type(result.blocked) ~= "table" then
            return nil, invalid_response("retention owner " .. owner.id .. " returned invalid blocked report",
                "retention.owner.blocked", owner.id)
        end
        for _, item in ipairs(result.blocked) do
            if type(item) ~= "table" or type(item.component_id) ~= "string" or item.component_id == ""
                or type(item.error) ~= "userdata" then
                return nil, invalid_response("retention owner " .. owner.id .. " returned invalid blocked item",
                    "retention.owner.blocked[]", owner.id)
            end
        end
    end
    local deadline = result.deadline_ms
    if deadline ~= nil and (type(deadline) ~= "number" or deadline < 0
        or deadline ~= math.floor(deadline) or deadline == math.huge) then
        return nil, invalid_response("retention owner " .. owner.id .. " returned invalid deadline",
            "retention.owner.deadline_ms", owner.id)
    end
    return math.floor(result.deleted) :: integer, nil, result.needs_continue == true, result.blocked, deadline :: integer?
end

-- run invokes every declared owner in id order. One owner's failure is recorded
-- in the report and never prevents the remaining owners from running; only a
-- failed owner discovery fails the pass.
function M.run(change: table?): (Report?, error?)
    local entries, definitions, declarations_err = M.declarations()
    if declarations_err or not entries or not definitions then return nil, declarations_err end
    local report: Report = { deleted = 0, failures = {}, needs_continue = false, blocked = {} }
    local targets: { Owner } = {}
    for _, entry in ipairs(entries) do
        local id = type(entry) == "table" and entry.id or nil
        if type(id) ~= "string" or id == "" then
            return nil, invalid_response("retention owner has no callable id", "retention.owner.id")
        end
        local module = nil
        if type(entry.meta) == "table" then module = entry.meta.module end
        local owner_namespace = namespace(id, definitions)
        if entry.meta ~= nil and type(entry.meta) ~= "table" then
            report.failures[#report.failures + 1] = { owner = id,
                error = invalid_response("retention owner has invalid metadata", "retention.owner.meta", id) }
        elseif module ~= nil and (type(module) ~= "string" or module == "") then
            report.failures[#report.failures + 1] = { owner = id,
                error = invalid_response("retention owner has invalid module provenance", "retention.owner.module", id) }
        elseif module == nil and owner_namespace == nil then
            report.failures[#report.failures + 1] = { owner = id,
                error = invalid_response("retention owner has no module definition", "retention.owner.namespace", id) }
        else
            targets[#targets + 1] = { id = id, module = module, namespace = owner_namespace }
        end
    end
    table.sort(targets, function(a: Owner, b: Owner): boolean return a.id < b.id end)
    local ledgers: { [string]: Applied } = {}
    for _, owner in ipairs(targets) do
        local deleted, owner_err, needs_continue, blocked, deadline = invoke(owner, definitions, ledgers, change)
        if owner_err then
            report.failures[#report.failures + 1] = { owner = owner.id, error = owner_err }
        else
            report.deleted = report.deleted + (deleted :: integer)
            report.needs_continue = report.needs_continue or needs_continue == true
            if deadline ~= nil then
                report.deadline_ms = report.deadline_ms == nil and deadline or math.min(report.deadline_ms, deadline)
            end
            for _, item in ipairs(blocked or {}) do
                report.blocked[#report.blocked + 1] = { owner = owner.id,
                    component_id = item.component_id, error = item.error }
            end
        end
    end
    return report, nil
end

return M
