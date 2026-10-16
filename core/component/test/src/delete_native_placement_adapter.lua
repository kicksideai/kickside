local fixture = require("fixture")
local M = {}
function M.lock_tree(tx): error?
    local _, err = fixture.result("tree", true)
    return err
end
function M.read_node(tx, id): (any, error?)
    return fixture.result("parent", {path = "/parent/"})
end
function M.build_path(db, id, parent): string
    return (parent or "/") .. id .. "/"
end
function M.relink_root_page(tx, db, id, limit): (boolean?, error?)
    return fixture.result("relink", false)
end
function M.unlink_node_page(tx, db, id, limit): (boolean?, error?)
    return fixture.result("unlink", false)
end
return M
