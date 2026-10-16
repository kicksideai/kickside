local env = require("env")
local funcs = require("funcs")
local errors = require("errors")

local consts = {
    -- Environment variable IDs
    ENV_IDS = {
        DATABASE_RESOURCE = "kickside.users.env:database_resource",
        ADMIN_GROUP_ID = "kickside.users.env:admin_group_id",
        DEFAULT_GROUP_ID = "kickside.users.env:default_group_id",
        BASELINE_GROUP_ID = "kickside.users.env:baseline_group_id",
        DEFAULT_ADMIN_EMAIL = "kickside.users.env:default_admin_email",
        DEFAULT_ADMIN_PASSWORD = "kickside.users.env:default_admin_password",
        ADMIN_INIT_ENABLED = "kickside.users.env:admin_init_enabled",
        TOKEN_EXPIRATION = "kickside.users.env:token_expiration"
    },

    -- Internal Resource IDs
    RESOURCES = {
        TOKEN_STORE = "kickside.users.security:tokens"
    },

    -- Stored in app_users.password_hash for passwordless (SSO-only) accounts. It can
    -- never equal a derived hash (it carries ':' and '!' and no '$' segment layout),
    -- so verify_password always fails: password login stays disabled until the user
    -- sets one. The Unix shadow-file locked-password convention, not a random hash.
    NO_PASSWORD = "!sso:no-password",

    -- User Status Constants
    USER_STATUS = {
        ACTIVE = "active",
        INACTIVE = "inactive",
        SUSPENDED = "suspended",
        PENDING = "pending"
    },

    -- Default Values
    DEFAULTS = {
        USER_STATUS = "active",
        ADMIN_INIT_ENABLED = true,
        ADMIN_USERNAME_PREFIX = "admin",
        PASSWORD_LENGTH = 16,
        USERNAME_LENGTH = 8
    },

    -- Validation Limits
    LIMITS = {
        MAX_EMAIL_LENGTH = 255,
        MAX_FULL_NAME_LENGTH = 200,
        MIN_PASSWORD_LENGTH = 8,
        MAX_PASSWORD_LENGTH = 128
    },

    -- Validation Sets
    VALID_VALUES = {
        USER_STATUS = {
            ["active"] = true,
            ["inactive"] = true,
            ["suspended"] = true,
            ["pending"] = true
        }
    },

    -- Error Messages
    ERROR = {
        -- General errors
        MISSING_REQUIRED_FIELD = "Missing required field: ",
        INVALID_FIELD_VALUE = "Invalid value for field: ",

        -- User errors
        USER_NOT_FOUND = "User not found",
        USER_ALREADY_EXISTS = "User already exists",
        INVALID_EMAIL_FORMAT = "Invalid email format",
        INVALID_PASSWORD = "Invalid password",
        INVALID_USER_STATUS = "Invalid user status",

        -- Authentication errors
        AUTHENTICATION_FAILED = "Authentication failed",
        INSUFFICIENT_PERMISSIONS = "Insufficient permissions",
        TOKEN_CREATION_FAILED = "Failed to create authentication token",
        SESSION_GENERATION_CHANGED = "account session generation changed",

        -- Database errors
        DB_CONNECTION_FAILED = "Failed to connect to database",
        DB_OPERATION_FAILED = "Database operation failed",

        -- Group errors
        GROUP_NOT_FOUND = "Security group not found",
        GROUP_ASSIGNMENT_FAILED = "Failed to assign user to group"
    },

    ERROR_CODE = {
        MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
        INVALID_FIELD_VALUE = "INVALID_FIELD_VALUE",
        USER_NOT_FOUND = "USER_NOT_FOUND",
        USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
        DB_CONNECTION_FAILED = "DB_CONNECTION_FAILED",
        DB_OPERATION_FAILED = "DB_OPERATION_FAILED",
        PASSWORD_HASH_FAILED = "PASSWORD_HASH_FAILED",
    }
}

local ERROR_SPEC = {
    MISSING_REQUIRED_FIELD = { kind = errors.INVALID, retryable = false, message = consts.ERROR.MISSING_REQUIRED_FIELD },
    INVALID_FIELD_VALUE = { kind = errors.INVALID, retryable = false, message = consts.ERROR.INVALID_FIELD_VALUE },
    USER_NOT_FOUND = { kind = errors.NOT_FOUND, retryable = false, message = consts.ERROR.USER_NOT_FOUND },
    USER_ALREADY_EXISTS = { kind = errors.ALREADY_EXISTS, retryable = false, message = consts.ERROR.USER_ALREADY_EXISTS },
    DB_CONNECTION_FAILED = { kind = errors.UNAVAILABLE, retryable = true, message = consts.ERROR.DB_CONNECTION_FAILED },
    DB_OPERATION_FAILED = { kind = errors.INTERNAL, retryable = false, message = consts.ERROR.DB_OPERATION_FAILED },
    PASSWORD_HASH_FAILED = { kind = errors.INTERNAL, retryable = false, message = "Password hash operation failed" },
}

function consts.new_error(code: string, options: any?): error
    local spec = ERROR_SPEC[code]
    local details: { [string]: any } = { code = code }
    if options and type(options.details) == "table" then
        for key, value in pairs(options.details) do details[key] = value end
    end
    return (errors.new({
        kind = spec.kind,
        retryable = spec.retryable,
        message = options and options.message or spec.message,
        details = details,
    }) :: error)
end

function consts.has_error_code(err: any, code: string): boolean
    local spec = ERROR_SPEC[code]
    if not spec or type(err) ~= "userdata" or not errors.is(err, spec.kind) then return false end
    local details = err:details()
    return type(details) == "table" and details.code == code
end

function consts.propagate_error(err: any, code: string, context: string): error
    if type(err) == "userdata" then return (errors.wrap(err, context) :: error) end
    local spec = ERROR_SPEC[code]
    local message = context
    if err ~= nil and tostring(err) ~= "" then message = message .. ": " .. tostring(err) end
    if message == "" then message = spec.message end
    return consts.new_error(code, { message = message })
end

-- Get database resource
function consts.get_db_resource()
    local db_resource, _ = env.get(consts.ENV_IDS.DATABASE_RESOURCE)
    return db_resource
end

-- Load configuration from environment variables
function consts.get_config()
    local admin_group_id, _ = env.get(consts.ENV_IDS.ADMIN_GROUP_ID)
    local default_group_id, _ = env.get(consts.ENV_IDS.DEFAULT_GROUP_ID)
    local baseline_group_id, _ = env.get(consts.ENV_IDS.BASELINE_GROUP_ID)
    local admin_init_enabled, _ = env.get(consts.ENV_IDS.ADMIN_INIT_ENABLED)
    local token_expiration, _ = env.get(consts.ENV_IDS.TOKEN_EXPIRATION)

    return {
        -- Database configuration
        database_resource = consts.get_db_resource(),
        -- User configuration
        admin_group_id = admin_group_id,
        default_group_id = default_group_id,
        baseline_group_id = baseline_group_id,
        admin_init_enabled = admin_init_enabled == "true" or consts.DEFAULTS.ADMIN_INIT_ENABLED,
        -- Security configuration
        token_store = consts.RESOURCES.TOKEN_STORE,
        token_expiration = token_expiration
    }
end

-- Keep the primary scope label and return every group for effective composition.
function consts.with_baseline_group(config, groups)
    local out, present = {}, false
    for _, group in ipairs(groups or {}) do
        out[#out + 1] = group
        if group == config.baseline_group_id then present = true end
    end
    if type(config.baseline_group_id) == "string" and config.baseline_group_id ~= "" and not present then
        out[#out + 1] = config.baseline_group_id
    end
    return out
end

function consts.derive_scope(config, security_groups)
    local scope_id = config.baseline_group_id ~= nil and config.baseline_group_id ~= ""
        and config.baseline_group_id or config.default_group_id
    local is_admin = false
    local scope_groups = consts.with_baseline_group(config, type(security_groups) == "table" and security_groups or {})
    if type(security_groups) == "table" then
        for _, group_id in ipairs(security_groups) do
            if group_id == config.admin_group_id then
                scope_id = config.admin_group_id
                is_admin = true
            elseif not is_admin then
                scope_id = group_id
            end
        end
    end
    if #scope_groups == 0 then scope_groups[1] = config.default_group_id end
    return scope_id, is_admin, scope_groups
end

function consts.resolve_scope(config, groups, authority_only)
    local primary, is_admin, effective = consts.derive_scope(config, groups)
    local distinct, seen, custom = {}, {}, false
    for _, group in ipairs(effective) do
        if not seen[group] then distinct[#distinct + 1] = group; seen[group] = true end
        if group ~= config.admin_group_id and group ~= config.default_group_id
            and group ~= config.baseline_group_id then custom = true end
    end
    if authority_only == true then return primary, is_admin, effective, nil end
    local result, err = funcs.call("kickside.security.binding:materialize_group_set", {groups = distinct})
    if err then
        local cause = err:details() and err:details().cause
        local native = type(cause) == "table" and errors.new(cause) or err
        return nil, is_admin, effective, (errors.wrap(native, "group set projection failed") :: error)
    end
    if type(result) ~= "table" or type(result.scope_name) ~= "string" then
        return nil, is_admin, effective, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "group set projection returns an invalid result"})
    end
    if #distinct == 1 then return distinct[1], is_admin, effective, nil end
    if not custom and is_admin then return config.admin_group_id, true, effective, nil end
    if not custom and seen[config.default_group_id] then return config.default_group_id, false, effective, nil end
    return result.scope_name, is_admin, effective, nil
end

-- Validate email format
function consts.validate_email(email)
    if not email or type(email) ~= "string" then
        return false, "Email must be a string"
    end

    if #email > consts.LIMITS.MAX_EMAIL_LENGTH then
        return false, "Email exceeds maximum length"
    end

    -- Basic email validation pattern
    local pattern = "^[%w%._%-%+]+@[%w%.%-]+%.%a%a+$"
    if not string.match(email, pattern) then
        return false, "Invalid email format"
    end

    return true
end

-- Validate a display name.
--
-- Names are free-form and international, so this rejects only what makes the value
-- dangerous downstream rather than trying to model what a name looks like: values
-- past the declared limit, and control characters. Newlines are the important case —
-- they are the shape that turns a name into injected instructions wherever it is
-- interpolated into an agent prompt. Multi-byte UTF-8 is unaffected: continuation
-- bytes are >= 0x80 and never match %c.
function consts.validate_full_name(full_name)
    if full_name == nil then
        return true -- optional field
    end

    if type(full_name) ~= "string" then
        return false, "Full name must be a string"
    end

    if #full_name > consts.LIMITS.MAX_FULL_NAME_LENGTH then
        return false, "Full name exceeds maximum length"
    end

    if string.find(full_name, "%c") then
        return false, "Full name must not contain control characters"
    end

    return true
end

-- Validate user status
function consts.validate_user_status(status)
    if not status then
        return true -- Allow nil/empty for default
    end

    if not consts.VALID_VALUES.USER_STATUS[status] then
        return false, "Invalid user status: " .. tostring(status)
    end

    return true
end

-- Validate password strength
function consts.validate_password(password)
    if not password or type(password) ~= "string" then
        return false, "Password must be a string"
    end

    if #password < consts.LIMITS.MIN_PASSWORD_LENGTH then
        return false, "Password must be at least " .. consts.LIMITS.MIN_PASSWORD_LENGTH .. " characters"
    end

    if #password > consts.LIMITS.MAX_PASSWORD_LENGTH then
        return false, "Password exceeds maximum length"
    end

    return true
end

return consts
