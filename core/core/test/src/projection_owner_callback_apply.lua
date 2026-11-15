local apply = require("apply")
local fixture = require("fixture")
local sql = require("sql")
local M = {fail = apply.fail, process_host = apply.process_host}
function M.advance(db_id, job, snapshot, last, output)
    local result, err = apply.advance(db_id, job, snapshot, last, output)
    if err then return nil, err end
    local db = assert(sql.get(db_id))
    if fixture.mode == "generation" then
        assert(db:execute("UPDATE kickside_components SET identity_generation=identity_generation+2 WHERE component_id=$1", {snapshot.component_authority.component_id}))
    else
        assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {snapshot.component_authority.component_id}))
    end
    assert(db:release())
    return result, nil
end
return M
