local sql = require("sql")
local security = require("security")
local M = {}
function M.run(input)
    return {body = input.projection.body, last_seq = input.range.to_seq}, nil
end
function M.after_commit(input)
    local db = assert(sql.get("app:db"))
    local actor = assert(security.actor())
    assert(db:execute("UPDATE kickside_component_meta SET value=$1 WHERE component_id=$2 AND key='owner_test.callback'",
        {actor:id(), input.events[1].body.component_id}))
    assert(db:release())
    return {}, nil
end
return M
