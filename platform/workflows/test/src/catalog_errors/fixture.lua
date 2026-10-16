local M = { ACCESS = { READ = 1 } }
local stage = nil
local source = nil
function M.reset(failed_stage, err) stage = failed_stage; source = err end
function M.list()
    if stage == "list" then return nil, source end
    return { { id = "draft", published_version = 0 }, { id = "published", title = "Published", published_version = 1 } }, nil
end
function M.require_access(_id, _access)
    if stage == "access" then return source end
    return nil
end
function M.get(_id, _version)
    if stage == "version" then return nil, source end
    return { version = 1, interface = {}, document = {} }, nil
end
return M
