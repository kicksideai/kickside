local http = require("http")
local security = require("security")
local json = require("json")
local time = require("time")

-- Import our repositories and constants
local user_groups_repo = require("user_groups_repo")
local user_repo = require("user_repo")
local consts = require("consts")

-- User profile endpoint handler - returns current authenticated user info with security groups
local function handler()
    local res = http.response()
    local req = http.request()

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    -- Set JSON content type
    res:set_content_type(http.CONTENT.JSON)

    -- Get current actor from security context
    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Authentication required",
            details = "This endpoint requires a valid authentication token"
        })
        return
    end

    -- Get current scope from security context
    local scope = security.scope()
    if not scope then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({
            success = false,
            error = "Authorization required",
            details = "No authorization scope available"
        })
        return
    end

    -- Extract user ID from actor
    local user_id = actor:id()
    if not user_id then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Invalid actor context",
            details = "Unable to determine user identity"
        })
        return
    end

    -- Get fresh user security groups from database
    local user_groups, err = user_groups_repo.get_user_groups(user_id)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = "Failed to retrieve user security groups",
            details = err
        })
        return
    end

    -- Get actor meta (which should include security groups from login)
    local actor_meta = actor:meta() or {}

    -- The token metadata is captured at login and goes stale after a self-edit, so
    -- prefer the live user record for the editable profile fields when available.
    local db_user = nil
    local fresh = user_repo.get(user_id)
    if type(fresh) == "table" then db_user = fresh end
    local function profile_field(key: string): any
        if db_user and db_user[key] ~= nil and db_user[key] ~= "" then return db_user[key] end
        return actor_meta[key]
    end

    -- Determine admin status and current scope via the single canonical rule.
    local config = consts.get_config()
    local current_scope_id, is_admin = consts.derive_scope(config, user_groups.groups)

    -- Build comprehensive user profile response
    local profile = {
        success = true,
        message = "User profile retrieved successfully",
        user = {
            id = user_id,
            email = profile_field("email"),
            full_name = profile_field("full_name"),
            status = profile_field("status"),
            created_at = profile_field("created_at"),
            metadata = actor_meta,
            timestamp = time.now():format_rfc3339()
        },
        security = {
            groups = user_groups.groups,
            is_admin = is_admin,
            scope = current_scope_id,  -- Current scope is based on groups
            permissions = {
                can_admin = is_admin,
                can_manage_users = is_admin,
                can_view_system = is_admin
            }
        },
        session = {
            login_time = actor_meta.login_time,
            ip_address = actor_meta.ip_address,
            user_agent = actor_meta.user_agent,
            timestamp = time.now():format_rfc3339()
        }
    }

    -- Add additional request metadata if available
    local current_ip = req:remote_addr()
    local current_ua = req:header("User-Agent")

    if current_ip and current_ip ~= actor_meta.ip_address then
        profile.session.current_ip_address = current_ip
        profile.session.ip_changed = true
    end

    if current_ua and current_ua ~= actor_meta.user_agent then
        profile.session.current_user_agent = current_ua
        profile.session.user_agent_changed = true
    end

    -- Return user profile
    res:set_status(http.STATUS.OK)
    res:write_json(profile)
end

return {
    handler = handler
}
