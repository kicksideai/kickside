-- Harness user store: the subjects the harness scope_resolver binding answers for.
-- Production resolves credential owners through kickside/users (app_users + group
-- memberships); the harness keeps the same facts -- id, account status, current
-- group memberships -- in one table the suites seed and mutate between calls.
local sql = require("sql")
local json = require("json")

local M = {}
local table_ready = false

M.TABLE = "mcp_harness_subjects"
M.STATUS = { ACTIVE = "active", INACTIVE = "inactive" }

local function db(): any
    local d, err = sql.get("app:db")
    if err or not d then error("harness db unavailable: " .. tostring(err)) end
    return d
end

function M.ensure_table()
    if table_ready then return end
    local d = db()
    local _, err = d:execute("CREATE TABLE IF NOT EXISTS " .. M.TABLE
        .. " (subject_id TEXT PRIMARY KEY, status TEXT NOT NULL, groups_json TEXT NOT NULL, scope_name TEXT, authority_json TEXT)")
    d:release()
    if err then error("harness subjects table: " .. tostring(err)) end
    table_ready = true
end

-- put(subject_id, status, groups) replaces the subject's status and memberships.
function M.put(subject_id: string, status: string, groups: { string }, scope_name: string?, authority_epochs: any?)
    M.ensure_table()
    local d = db()
    d:execute("DELETE FROM " .. M.TABLE .. " WHERE subject_id = $1", { subject_id })
    local _, err = sql.builder.insert(M.TABLE):set_map({
        subject_id = subject_id,
        status = status,
        groups_json = json.encode(groups),
        scope_name = scope_name,
        authority_json = authority_epochs and json.encode(authority_epochs) or nil,
    }):run_with(d):exec()
    d:release()
    if err then error("harness subject seed failed: " .. tostring(err)) end
end

function M.remove(subject_id: string)
    M.ensure_table()
    local d = db()
    d:execute("DELETE FROM " .. M.TABLE .. " WHERE subject_id = $1", { subject_id })
    d:release()
end

-- get(subject_id) -> ({ subject_id, status, groups }?, err?)
function M.get(subject_id: string): (any?, string?)
    M.ensure_table()
    local d = db()
    local rows, err = sql.builder.select("subject_id", "status", "groups_json", "scope_name", "authority_json")
        :from(M.TABLE)
        :where("subject_id = ?", subject_id)
        :limit(1)
        :run_with(d):query()
    d:release()
    if err then return nil, tostring(err) end
    local row = rows and rows[1]
    if not row then return nil, nil end
    local groups, derr = json.decode(tostring(row.groups_json))
    if derr or type(groups) ~= "table" then return nil, "corrupt harness groups for " .. subject_id end
    local epochs = row.authority_json and assert(json.decode(row.authority_json)) or nil
    return { authority_epochs = epochs, subject_id = row.subject_id, status = row.status, groups = groups, scope_name = row.scope_name }, nil
end

return M
