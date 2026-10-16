local registry = require("registry")
local keyset = require("keyset")

local M = {}

local DOCUMENTATION_PAGE_TYPE = "wippy.documentation.page"

type Map = { [string]: any }
type DocumentationPage = {
    path: string,
    content: string,
}

local function pages(): ({ DocumentationPage }?, error?)
    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = DOCUMENTATION_PAGE_TYPE,
    })
    if err then return nil, errors.wrap(err, "documentation lookup failed") end

    local found: { DocumentationPage } = {}
    for _, entry in ipairs(entries or {}) do
        local data: any = (entry :: Map).data or {}
        local page = data.path
        local content = data.content
        if type(page) == "string" and page ~= "" and type(content) == "string" and content ~= "" then
            found[#found + 1] = { path = page, content = content }
        end
    end
    table.sort(found, function(left, right) return left.path < right.path end)
    return found, nil
end

-- read lists page paths in path order (limit, cursor) or returns one whole page.
function M.read(args: any): (Map?, any)
    local input: Map = type(args) == "table" and (args :: Map) or {}
    local requested: any = input.page
    if requested == nil or requested == "" then
        local limit, cursor, page_err = keyset.args(input)
        if page_err then return nil, page_err end
        local found, err = pages()
        if not found then return nil, err end
        local selected, next_cursor = keyset.page(found, keyset.field("path"), limit :: integer, cursor)
        local listed: { string } = {}
        for _, page in ipairs(selected) do listed[#listed + 1] = (page :: DocumentationPage).path end
        return { pages = listed, next_cursor = next_cursor }, nil
    end
    if type(requested) ~= "string" then
        return nil, errors.new({ kind = errors.INVALID, message = "page must be a string" })
    end

    local found, err = pages()
    if not found then return nil, err end
    for _, page in ipairs(found) do
        if page.path == requested then return { page = page.path, content = page.content }, nil end
    end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "documentation page not found: " .. requested })
end

return M
