local crypto = require("crypto")
local logger = require("logger")
local user_repo_support = require("user_repo_support")
local env = require("env")
local sql = require("sql")
local consts = require("consts")

local log = logger:named("admin_init_migration")

local function get_admin_group_id()
    return select(1, env.get(consts.ENV_IDS.ADMIN_GROUP_ID)) :: string
end

-- Generate a random admin username
local function generate_admin_username()
    local random_suffix, err = crypto.random.string(8, "0123456789abcdefghijklmnopqrstuvwxyz")
    if err then
        error("Failed to generate random username: " .. err)
    end
    return "admin-" .. random_suffix
end

-- Generate a secure random password
local function generate_admin_password()
    local password, err = crypto.random.string(16,
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*")
    if err then
        error("Failed to generate random password: " .. err)
    end
    return password
end

-- Check if any admin users already exist (using provided db connection)
local function admin_exists(db)
    local group_id = get_admin_group_id()

    -- Check if there are any users in the admin group
    local query = sql.builder.select("COUNT(*) as count")
        :from("app_user_groups")
        :where("group_id = ?", group_id)

    local executor = query:run_with(db)
    local results, err = executor:query()
    if err then
        error("Failed to check for existing admin users: " .. err)
    end

    return results[1].count > 0
end

-- Get default admin credentials from environment
local function get_default_admin_credentials()
    local default_email, _ = env.get(consts.ENV_IDS.DEFAULT_ADMIN_EMAIL)
    local default_password, _ = env.get(consts.ENV_IDS.DEFAULT_ADMIN_PASSWORD)

    if default_email and default_email ~= "" and default_password and default_password ~= "" then
        return {
            username = default_email, -- Use full email as username
            email = default_email,
            password = default_password,
            is_default = true
        }
    end

    return nil
end

-- Use the same canonical password writer as user creation and reset.
local function hash_password(password)
    local hashed, err = user_repo_support.hash_password(password)
    if err then
        error("Failed to hash password: " .. err)
    end
    return hashed
end

local function credential_summary(username, email, password, group_id, is_default)
    local credential_type = is_default and "DEFAULT" or "GENERATED"
    local lines = {
        "    " .. credential_type .. " ADMIN USER CREATED - SAVE THESE CREDENTIALS!",
        "    Username: " .. username,
        "    Email:    " .. email,
    }
    if not is_default then
        lines[#lines + 1] = "    Password: " .. password
    end
    lines[#lines + 1] = "    Group:    " .. group_id
    lines[#lines + 1] = ""
    lines[#lines + 1] = "    Login URL: /api/public/user/token"
    return lines
end

-- Create the admin user (using provided db connection)
local function create_admin_user(db)
    -- Check if admin already exists
    if admin_exists(db) then
        log:info("Admin users already exist, skipping creation")
        return nil
    end

    log:info("Creating initial admin user")

    -- Get admin init enabled setting
    local admin_init_enabled, _ = env.get(consts.ENV_IDS.ADMIN_INIT_ENABLED)
    if admin_init_enabled == "false" then
        log:info("Admin initialization disabled by configuration")
        return nil
    end

    -- Get credentials
    local default_creds = get_default_admin_credentials()
    local admin_username, admin_email, admin_password, is_default_admin

    if default_creds then
        admin_username = default_creds.username
        admin_email = default_creds.email
        admin_password = default_creds.password
        is_default_admin = true
        log:info("Using provided default admin credentials", { username = admin_username, email = admin_email })
    else
        admin_username = generate_admin_username()
        admin_password = generate_admin_password()
        admin_email = admin_username .. "@localhost"
        is_default_admin = false
        log:info("Generated random admin credentials", { username = admin_username, email = admin_email })
    end

    -- Hash the password
    local password_hash = hash_password(admin_password)

    -- Create the user directly with SQL
    local user_query = sql.builder.insert("app_users")
        :set_map({
            user_id = admin_username,
            email = admin_email,
            full_name = is_default_admin and "Default Administrator" or "System Administrator",
            password_hash = password_hash,
            status = "active"
        })

    local user_executor = user_query:run_with(db)
    local result, err = user_executor:exec()
    if err then
        error("Failed to create admin user: " .. err)
    end

    -- Assign to admin group directly with SQL
    local admin_group_id = get_admin_group_id()
    local group_query = sql.builder.insert("app_user_groups")
        :set_map({
            user_id = admin_username,
            group_id = admin_group_id
        })

    local group_executor = group_query:run_with(db)
    result, err = group_executor:exec()
    if err then
        error("Failed to assign admin to group: " .. err)
    end

    log:info("Admin user created and assigned to admin group", { user_id = admin_username })

    for _, line in ipairs(credential_summary(admin_username, admin_email, admin_password,
        admin_group_id, is_default_admin)) do
        print(line)
    end

    return { username = admin_username }
end

local migrate = require("migration").define(function()
    migration("Initialize admin user with randomized credentials on first boot", function()
        database("postgres", function()
            up(function(db)
                log:info("Starting Admin User Initialization Migration")
                create_admin_user(db)
                log:info("Admin user initialization completed")
            end)
            down(function(db)
                print("Admin user migration rollback: manually remove admin users if needed")
            end)
        end)

        database("sqlite", function()
            up(function(db)
                log:info("Starting Admin User Initialization Migration")
                create_admin_user(db)
                log:info("Admin user initialization completed")
            end)
            down(function(db)
                print("Admin user migration rollback: manually remove admin users if needed")
            end)
        end)
    end)
end)

return { migrate = migrate, credential_summary = credential_summary }
