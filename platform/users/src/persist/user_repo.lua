-- User account creation and read queries.
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local consts = require("user_consts")
local support = require("user_repo_support")
local bot_accounts = require("bot_accounts_repo")
local get_db = support.get_db
local find_user = support.find_user
local user_exists = support.user_exists
local hash_password = support.hash_password
local user_repo = {}

function user_repo.create_in(db, user_data)
    if not db then return nil, consts.new_error(consts.ERROR_CODE.DB_CONNECTION_FAILED) end
    -- user_id is an opaque UUID, not derived from the email. External identities
    -- (SSO, DM links) map to it through their own tables, so it carries no
    -- human-readable meaning and stays case-stable.
    if not user_data.user_id or user_data.user_id == "" then
        user_data.user_id = uuid.v4()
    end

    if not user_data.email or user_data.email == "" then
        return nil, consts.new_error(consts.ERROR_CODE.MISSING_REQUIRED_FIELD, { message = consts.ERROR.MISSING_REQUIRED_FIELD .. "email", details = { field = "email" } })
    end

    user_data.email = user_data.email:lower()

    if not user_data.password or user_data.password == "" then
        return nil, consts.new_error(consts.ERROR_CODE.MISSING_REQUIRED_FIELD, { message = consts.ERROR.MISSING_REQUIRED_FIELD .. "password", details = { field = "password" } })
    end

    local email_valid, email_err = consts.validate_email(user_data.email)
    if not email_valid then
        return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = email_err, details = { field = "email" } })
    end

    local pass_valid, pass_err = consts.validate_password(user_data.password)
    if not pass_valid then
        return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = pass_err, details = { field = "password" } })
    end

    local name_valid, name_err = consts.validate_full_name(user_data.full_name)
    if not name_valid then
        return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = name_err, details = { field = "full_name" } })
    end

    if user_data.status then
        local status_valid, status_err = consts.validate_user_status(user_data.status)
        if not status_valid then
            return nil, consts.new_error(consts.ERROR_CODE.INVALID_FIELD_VALUE, { message = status_err, details = { field = "status" } })
        end
    end

    local password_hash, err = hash_password(tostring(user_data.password))
    if err then
        return nil, consts.propagate_error(err, consts.ERROR_CODE.PASSWORD_HASH_FAILED, "Password hash operation failed")
    end

    local exists, exists_err = user_exists(db, tostring(user_data.user_id), tostring(user_data.email))
    if exists_err then
        return nil, exists_err
    end

    if exists then
        return nil, consts.new_error(consts.ERROR_CODE.USER_ALREADY_EXISTS)
    end

    local now = time.now()

    local insert_query = sql.builder.insert("app_users")
        :set_map({
            user_id = user_data.user_id,
            email = user_data.email,
            full_name = user_data.full_name or nil,
            password_hash = password_hash,
            status = user_data.status or consts.DEFAULTS.USER_STATUS,
            created_at = now:utc():format_rfc3339(),
            updated_at = now:utc():format_rfc3339()
        })

    local insert_executor = insert_query:run_with(db)
    local result, err = insert_executor:exec()

    if err then
        return nil, consts.propagate_error(err, consts.ERROR_CODE.DB_OPERATION_FAILED, consts.ERROR.DB_OPERATION_FAILED)
    end

    return {
        user_id = user_data.user_id,
        email = user_data.email,
        full_name = user_data.full_name,
        status = user_data.status or consts.DEFAULTS.USER_STATUS,
        created = true
    }
end

function user_repo.create(user_data)
    local db, err = get_db()
    if err then return nil, err end
    local result, create_err = user_repo.create_in(db, user_data)
    db:release()
    return result, create_err
end

local function prepare_passwordless(user_data)
    if not user_data then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "email"
    end
    if not user_data.user_id or user_data.user_id == "" then
        user_data.user_id = uuid.v4()
    end
    if not user_data.email or user_data.email == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "email"
    end

    user_data.email = tostring(user_data.email):lower()
    local email_valid, email_err = consts.validate_email(user_data.email)
    if not email_valid then return nil, email_err end

    local name_valid, name_err = consts.validate_full_name(user_data.full_name)
    if not name_valid then return nil, name_err end

    if user_data.status then
        local status_valid, status_err = consts.validate_user_status(user_data.status)
        if not status_valid then return nil, status_err end
    end

    return user_data, nil
end

local function insert_passwordless(db, user_data)
    local exists, exists_err = user_exists(db, tostring(user_data.user_id), tostring(user_data.email))
    if exists_err then
        return nil, exists_err
    end
    if exists then
        return nil, consts.ERROR.USER_ALREADY_EXISTS
    end

    local now = time.now()
    local ts = now:utc():format_rfc3339()
    local _, insert_err = sql.builder.insert("app_users")
        :set_map({
            user_id = user_data.user_id,
            email = user_data.email,
            full_name = user_data.full_name or nil,
            password_hash = consts.NO_PASSWORD,
            status = user_data.status or consts.USER_STATUS.ACTIVE,
            created_at = ts,
            updated_at = ts,
        })
        :run_with(db):exec()

    if insert_err then
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. insert_err
    end

    return {
        user_id = user_data.user_id,
        email = user_data.email,
        full_name = user_data.full_name,
        status = user_data.status or consts.USER_STATUS.ACTIVE,
        created = true,
        passwordless = true,
    }
end

function user_repo.create_passwordless_in(db, user_data)
    if not db then return nil, consts.new_error(consts.ERROR_CODE.DB_CONNECTION_FAILED) end
    local prepared, err = prepare_passwordless(user_data)
    if err then return nil, err end
    return insert_passwordless(db, prepared)
end

function user_repo.create_passwordless(user_data)
    local prepared, validation_err = prepare_passwordless(user_data)
    if validation_err then return nil, validation_err end
    local db, db_err = get_db()
    if db_err then return nil, db_err end
    local user, create_err = insert_passwordless(db, prepared)
    db:release()
    return user, create_err
end

function user_repo.get(identifier)
    if not identifier or identifier == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier"
    end

    local normalized = type(identifier) == "string" and identifier:lower() or identifier

    local db, err = get_db()
    if err then
        return nil, err
    end

    local user, err = find_user(db, identifier, normalized, {
        "user_id", "email", "full_name", "password_hash", "status", "auth_generation", "created_at", "updated_at", support.DELEGATION_COLUMN
    })

    db:release()

    if err then
        return nil, err
    end

    if not user then
        return nil, consts.ERROR.USER_NOT_FOUND
    end

    return user
end

function user_repo.get_in(db, identifier)
    if not db then return nil, consts.new_error(consts.ERROR_CODE.DB_CONNECTION_FAILED) end
    if not identifier or identifier == "" then
        return nil, consts.new_error(consts.ERROR_CODE.MISSING_REQUIRED_FIELD, { message = consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier", details = { field = "identifier" } })
    end
    local normalized = type(identifier) == "string" and identifier:lower() or identifier
    local user, err = find_user(db, identifier, normalized, {
        "user_id", "email", "full_name", "password_hash", "status", "auth_generation", "created_at", "updated_at", support.DELEGATION_COLUMN
    })
    if err then return nil, err end
    if not user then return nil, consts.new_error(consts.ERROR_CODE.USER_NOT_FOUND) end
    return user, nil
end

function user_repo.list(options)
    options = options or {}
    local limit = options.limit or 50
    local offset = options.offset or 0

    local db, err = get_db()
    if err then
        return nil, err
    end

    local query = sql.builder.select("user_id", "email", "full_name", "status", "created_at", "updated_at", support.BOT_ACCOUNT_PREDICATE .. " AS bot_account")
        :from("app_users")
        :order_by("created_at DESC")
        :limit(limit)
        :offset(offset)

    if options.status then
        query = query:where("status = ?", options.status)
    end
    if options.bot_accounts == true then query = query:where(support.BOT_ACCOUNT_PREDICATE) end

    local executor = query:run_with(db)
    local users, err = executor:query()

    db:release()

    if err then
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. err
    end

    for _, user in ipairs(users) do
        user.bot_account = bot_accounts.is_bot(user) and true or nil
    end
    return users
end

function user_repo.count(options)
    options = options or {}

    local db, err = get_db()
    if err then
        return nil, err
    end

    local query = sql.builder.select("COUNT(*) as count")
        :from("app_users")

    if options.status then
        query = query:where("status = ?", options.status)
    end

    local executor = query:run_with(db)
    local result, err = executor:query()

    db:release()

    if err then
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. err
    end

    return result[1].count
end

return user_repo
