local sql = require("sql")

local function groups(input: any): (any?, error?)
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, db_err end
    local rows, query_err = db:query("SELECT active FROM webhook_test_principals WHERE id=$1", {input.id})
    local _, release_err = db:release()
    if query_err then return nil, query_err end
    if release_err then return nil, release_err end
    return {active = rows ~= nil and rows[1] ~= nil and tonumber(rows[1].active) == 1, groups = {}}, nil
end

local function search(): any
    return {principals = {}}, nil
end

local function resolve(): any
    return {principals = {}}, nil
end

local function exists(input: any): (any?, error?)
    local answer, err = groups(input)
    if err then return nil, err end
    return {exists = answer.active}, nil
end

return {groups = groups, search = search, resolve = resolve, exists = exists}
