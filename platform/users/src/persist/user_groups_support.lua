-- Shared database lookup and identity resolution for user group repositories.
local sql = require("sql")
local consts = require("user_consts")
local user_repo_support = require("user_repo_support")
local M = {}

-- Resolve a user identifier (canonical user_id or email) to the canonical
-- app_users.user_id. Membership rows are always keyed by the canonical id so
-- that login -- which resolves the same way via get_user_with_groups -- joins
-- them; an email-addressed write must never orphan the grant. Doubles as the
-- existence check. Uses indexed point reads in deterministic order (user_id,
-- then normalized email) instead of one broad OR predicate.
local function resolve_user_id(db, identifier)
    local normalized = type(identifier) == "string" and identifier:lower() or identifier
    local user, err = user_repo_support.find_user(db, identifier, normalized, { "user_id" })
    if err then return nil, err end
    if not user then
        return nil, consts.ERROR.USER_NOT_FOUND
    end
    return user.user_id
end

-- Clamp pagination so list queries never return unbounded rows. Default page is
-- 100; callers page through larger sets with offset.
local DEFAULT_LIMIT = 100
local MEMBERSHIP_CEILING = 10000

local function read_complete_membership(db, user_id)
    local rows, err = sql.builder.select("group_id", "created_at")
        :from("app_user_groups")
        :where("user_id = ?", user_id)
        :order_by("created_at ASC, group_id ASC")
        :limit(MEMBERSHIP_CEILING + 1)
        :run_with(db):query()
    if err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err) end
    if #rows > MEMBERSHIP_CEILING then
        return nil, "Security group membership exceeds the supported maximum of " .. tostring(MEMBERSHIP_CEILING)
    end
    return rows, nil
end

-- User-list pages already carry canonical IDs. Read their complete memberships
-- in one owner query, retaining existence checks and the per-user ceiling.
local function read_page_memberships(db, user_ids)
    if type(user_ids) ~= "table" or #user_ids > DEFAULT_LIMIT then
        return nil, "User membership batch must contain at most " .. tostring(DEFAULT_LIMIT) .. " canonical IDs"
    end
    if #user_ids == 0 then return {}, nil end
    for _, id in ipairs(user_ids) do
        if type(id) ~= "string" or id == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
        end
    end
    local placeholders = string.rep("?,", #user_ids):sub(1, -2)
    local rows, err = sql.builder.select("u.user_id", "g.group_id")
        :from("app_users u")
        :left_join("app_user_groups g ON g.user_id = u.user_id")
        :where("u.user_id IN (" .. placeholders .. ")", table.unpack(user_ids))
        :order_by("u.user_id ASC, g.created_at ASC, g.group_id ASC")
        :limit(#user_ids * (MEMBERSHIP_CEILING + 1))
        :run_with(db):query()
    if err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err) end
    local memberships = {}
    for _, row in ipairs(rows) do
        local groups = memberships[row.user_id]
        if not groups then groups = {}; memberships[row.user_id] = groups end
        if row.group_id ~= nil then
            groups[#groups + 1] = row.group_id
            if #groups > MEMBERSHIP_CEILING then
                return nil, "Security group membership exceeds the supported maximum of " .. tostring(MEMBERSHIP_CEILING)
            end
        end
    end
    for _, id in ipairs(user_ids) do
        if memberships[id] == nil then return nil, consts.ERROR.USER_NOT_FOUND end
    end
    return memberships, nil
end

local function page(opts)
    opts = type(opts) == "table" and opts or {}
    local limit = tonumber(opts.limit) or DEFAULT_LIMIT
    if limit < 1 then limit = 1 elseif limit > DEFAULT_LIMIT then limit = DEFAULT_LIMIT end
    local offset = tonumber(opts.offset) or 0
    if offset < 0 then offset = 0 end
    return limit, offset
end


function M.membership_conflict()
    return errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "membership authority changes during classification",
        details = {error_kind = "membership_revision"}})
end

-- Retry only a rolled-back membership observation. Other errors propagate, and
-- sustained concurrent changes retain the last retryable refusal.
function M.retry_membership_change(operation)
    local result, err
    for _ = 1, 3 do
        result, err = operation()
        if err == nil or type(err) ~= "userdata" then return result, err end
        local details = err:details()
        if type(details) ~= "table" or details.error_kind ~= "membership_revision" then return result, err end
    end
    return result, err
end

M.resolve_user_id = resolve_user_id
M.page = page
M.DEFAULT_LIMIT = DEFAULT_LIMIT
M.read_complete_membership = read_complete_membership
M.read_page_memberships = read_page_memberships

return M
