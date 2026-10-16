-- Log entry rows. One row per acknowledged write.
local sql = require("sql")
local registry = require("registry")
local uuid = require("uuid")

local repo = {}

local function with_db(fn)
    local requirement, requirement_err = registry.get("acme.starter:target_db")
    if requirement_err then return nil, requirement_err end
    local db, err = sql.get(requirement.data.default)
    if err then return nil, err end
    local result, rerr = fn(db)
    db:release()
    return result, rerr
end

-- Insert one log entry. Returns the generated row id.
function repo.insert(label, content)
    return with_db(function(db)
        local id = uuid.v7()
        local _, err = db:execute(
            "INSERT INTO acme_starter_log_entries (id, label, content) VALUES ($1, $2, $3)",
            { id, label, content })
        if err then return nil, err end
        return id
    end)
end

-- Number of log entries written so far.
function repo.count()
    return with_db(function(db)
        local rows, err = db:query("SELECT COUNT(*) AS n FROM acme_starter_log_entries", {})
        if err then return nil, err end
        return tonumber(rows[1].n)
    end)
end

return repo
