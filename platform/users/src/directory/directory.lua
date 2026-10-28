-- Directory adapter: implements kickside.contract:directory over KickSide user
-- persistence. Surfaces shareable principals — users, plus the assignable security
-- scopes from the security_scopes catalog — as typed grant subjects
-- { type, id, label, sublabel } the component access store accepts. This is the
-- swappable seam: a different user backend binds the same contract and the sharing
-- layer is unchanged.

local user_repo = require("user_repo")
local funcs = require("funcs")
local consts = require("consts")
local catalog = require("directory_catalog")
local search_page = require("search_page")

local M = {}

-- A shareable principal — a typed grant subject the component access store accepts.
type Principal = {
    type: string, -- "user" | "group"
    id: string,
    label: string,
    sublabel: string?,
}

-- A user row from KickSide user persistence (only the fields read here).
type UserRow = {
    user_id: string,
    email: string?,
    full_name: string?,
}

type PrincipalList = { principals: { Principal } }

local function user_label(u: UserRow): string
    if u.full_name and u.full_name ~= "" then return u.full_name :: string end
    return u.email or u.user_id
end

M.search = search_page.search

-- resolve maps principal refs ({ type, id }) to display info for an access list.
function M.resolve(input: any): (PrincipalList?, any?)
    input = (type(input) == "table") and input or {}
    local refs = (input.refs or {}) :: { { type: string, id: string } }

    local need_groups = false
    for _, r in ipairs(refs) do
        if r.type == "group" then need_groups = true end
    end

    local group_labels: { [string]: string } = {}
    if need_groups then
        local groups, catalog_err = catalog.groups()
        if catalog_err then return nil, catalog_err end
        for _, g in ipairs(groups) do group_labels[g.id] = g.label end
    end

    local principals: { Principal } = {}
    for _, r in ipairs(refs) do
        if r.type == "group" then
            local label = group_labels[r.id] or catalog.label(r.id)
            principals[#principals + 1] = { type = "group", id = r.id, label = label, sublabel = r.id }
        else
            local u, lookup_err = user_repo.get(r.id)
            if lookup_err and lookup_err ~= consts.ERROR.USER_NOT_FOUND then return nil, lookup_err end
            if u then
                principals[#principals + 1] = { type = "user", id = u.user_id, label = user_label(u), sublabel = u.email or "" }
            else
                principals[#principals + 1] = { type = "user", id = r.id, label = r.id, sublabel = "" }
            end
        end
    end

    return { principals = principals }
end

-- exists reports whether a principal is real. The sharing layer uses it to reject
-- grants to phantom users without importing this module's persistence.
function M.exists(input: any): ({ exists: boolean }?, any?)
    input = (type(input) == "table") and input or {}
    local id = input.id
    if type(id) ~= "string" or id == "" then return { exists = false } end
    if input.type == "group" then
        local groups, catalog_err = catalog.groups()
        if catalog_err then return nil, catalog_err end
        for _, g in ipairs(groups) do
            if g.id == id then return { exists = true } end
        end
        return { exists = false }
    end
    local user, lookup_err = user_repo.get(id)
    if lookup_err and lookup_err ~= consts.ERROR.USER_NOT_FOUND then return nil, lookup_err end
    return { exists = user ~= nil }, nil
end

-- groups answers a user's live group memberships (A32): the groups an active
-- user holds, exactly those a login stamps into its security_groups. The id is
-- a canonical user id; an email alias, an unknown or an inactive user is not
-- active and holds none. A read failure is the caller's typed error.
function M.groups(input: any): ({ active: boolean, groups: { string } }?, error?)
    input = (type(input) == "table") and input or {}
    local id = input.id
    if type(id) ~= "string" or id == "" then return { active = false, groups = {} }, nil end
    if id:match("^%s") or id:match("%s$") then return { active = false, groups = {} }, nil end
    local executor, executor_err = ((M :: any)._funcs or funcs).new()
    if executor_err then return nil, executor_err end
    local subject, call_err = executor:call("kickside.users.binding:subject_lookup", { subject_id = id })
    if call_err then return nil, call_err end
    if type(subject) ~= "table" then
        return nil, (errors.new({ message = "directory subject lookup returns no result", kind = errors.UNAVAILABLE, retryable = true }) :: error)
    end
    if subject.error then
        local detail = subject.error
        if detail.kind == errors.NOT_FOUND or detail.kind == errors.PERMISSION_DENIED then
            return { active = false, groups = {} }, nil
        end
        return nil, (errors.new({ message = "directory groups: " .. tostring(detail.message),
            kind = detail.kind, retryable = subject.retriable == true }) :: error)
    end
    if type(subject.meta) ~= "table" or subject.meta.user_id ~= id then return { active = false, groups = {} }, nil end
    return { active = true, groups = subject.groups or {} }, nil
end

return M
