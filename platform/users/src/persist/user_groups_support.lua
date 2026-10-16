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

return M
