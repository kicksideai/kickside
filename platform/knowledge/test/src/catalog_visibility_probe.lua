-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local knowledge_bases = require("knowledge_bases")
local listing = require("listing")
local http = require("http")

local function run()
    local created, create_err = knowledge_bases.create({
        name = "Catalog visibility fixture", kb_type = "bound", embedding_model = "fixture-embedding",
    })
    if create_err then return nil, create_err end
    local status, body
    listing.new({ http = {
        CONTENT = http.CONTENT, STATUS = http.STATUS,
        request = function() return { query = function() return nil end } end,
        response = function() return {
            set_content_type = function() end,
            set_status = function(_, value) status = value end,
            write_json = function(_, value) body = value end,
        } end,
    } }).handler()
    local _, delete_err = knowledge_bases.delete({ component_id = created.component_id })
    if delete_err then return nil, delete_err end
    return { id = created.component_id, status = status, body = body }, nil
end

return { run = run }
