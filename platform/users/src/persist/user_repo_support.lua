-- Shared database lookup and credential primitives for user persistence owners.
local sql = require("sql")
local crypto = require("crypto")
local hash = require("hash")
local consts = require("user_consts")
local M = {}
M.BOT_ACCOUNT_PREDICATE = "EXISTS (SELECT 1 FROM app_user_bot_accounts WHERE app_user_bot_accounts.user_id = app_users.user_id)"
M.DELEGATION_COLUMN = "COALESCE((SELECT generation FROM app_user_delegation_epochs WHERE app_user_delegation_epochs.user_id = app_users.user_id), 0) AS delegation_generation"
local unpack = table.unpack or unpack

local function get_db()
    local db_resource = consts.get_db_resource()
    -- Reading the env entry is itself a gated action, so a caller whose scope cannot
    -- read it gets nil here rather than an error. Passing that straight to sql.get
    -- raises a raw Lua error out of the handler; fail with a handled one instead.
    if not db_resource then
        return nil, consts.new_error(consts.ERROR_CODE.DB_CONNECTION_FAILED)
    end
    local db, err = sql.get(db_resource)
    if err then
        return nil, consts.propagate_error(err, consts.ERROR_CODE.DB_CONNECTION_FAILED, consts.ERROR.DB_CONNECTION_FAILED)
    end
    return db
end

local function find_user(db, identifier: string, normalized: string, fields: { string })
    local by_id, id_err = sql.builder.select(unpack(fields))
        :from("app_users")
        :where("user_id = ?", identifier)
        :limit(1)
        :run_with(db):query()
    if id_err then
        return nil, consts.propagate_error(id_err, consts.ERROR_CODE.DB_OPERATION_FAILED, consts.ERROR.DB_OPERATION_FAILED)
    end
    if #by_id > 0 then
        return by_id[1], nil
    end

    local by_email, email_err = sql.builder.select(unpack(fields))
        :from("app_users")
        :where("email = ?", normalized)
        :limit(1)
        :run_with(db):query()
    if email_err then
        return nil, consts.propagate_error(email_err, consts.ERROR_CODE.DB_OPERATION_FAILED, consts.ERROR.DB_OPERATION_FAILED)
    end
    if #by_email > 0 then
        return by_email[1], nil
    end
    return nil, nil
end

local function user_exists(db, user_id: string, email: string)
    local by_id, id_err = sql.builder.select("user_id")
        :from("app_users")
        :where("user_id = ?", user_id)
        :limit(1)
        :run_with(db):query()
    if id_err then return nil, consts.propagate_error(id_err, consts.ERROR_CODE.DB_OPERATION_FAILED, consts.ERROR.DB_OPERATION_FAILED) end
    if #by_id > 0 then return true, nil end

    local by_email, email_err = sql.builder.select("user_id")
        :from("app_users")
        :where("email = ?", email)
        :limit(1)
        :run_with(db):query()
    if email_err then return nil, consts.propagate_error(email_err, consts.ERROR_CODE.DB_OPERATION_FAILED, consts.ERROR.DB_OPERATION_FAILED) end
    return #by_email > 0, nil
end

-- Password hashing. Current format is real PBKDF2-HMAC-SHA512 via the runtime's
-- native crypto.pbkdf2: "pbk2$<iters>$<salt>$<hex>".
local PBK2_PREFIX = "pbk2"
local PBK2_ITERS = 210000        -- OWASP guidance for PBKDF2-HMAC-SHA512
local PBK2_KEYLEN = 64           -- bytes; full SHA-512 output width
local PBK2_HASH = "sha512"
local PBK2_MAX_STORED_ITERS = 1000000
local PBK1_PREFIX = "pbk1"
local PBK1_MAX_STORED_ITERS = 4096
local SALT_CHARSET = "0123456789abcdef"
-- Fixed salt used only to burn KDF time for accounts that do not exist or whose
-- unrecognized hash rejects the candidate. It is never stored or compared.
local ABSENT_ACCOUNT_SALT = "00000000000000000000000000000000"

-- crypto.pbkdf2 returns raw bytes; the stored format is hex, so encode before use.
local function to_hex(raw: string): string
    return (raw:gsub(".", function(c: string): string
        return string.format("%02x", c:byte())
    end))
end

local function derive_pbk2(password: string, salt: string, iters: number): (string?, any?)
    local raw, err = crypto.pbkdf2(password, salt, iters, PBK2_KEYLEN, PBK2_HASH)
    if err then return nil, err end
    return to_hex(raw), nil
end

local function hash_password(password: string)
    local salt, serr = crypto.random.string(32, SALT_CHARSET)
    if serr or not salt or salt == "" then
        return nil, serr
    end
    local derived, derr = derive_pbk2(password, salt, PBK2_ITERS)
    if derr then
        return nil, derr
    end
    return PBK2_PREFIX .. "$" .. tostring(PBK2_ITERS) .. "$" .. salt .. "$" .. derived
end

-- Retired home-rolled HMAC chain, retained solely to upgrade existing users.
local function derive_pbk1(password: string, salt: string, iters: number): (string?, string?)
    local derived, err = hash.hmac_sha512(password, salt)
    if err or not derived then return nil, "hmac failed: " .. tostring(err) end
    for _ = 2, iters do
        derived, err = hash.hmac_sha512(derived, salt)
        if err or not derived then return nil, "hmac failed: " .. tostring(err) end
    end
    return derived, nil
end

local function rejection_cost_error(password: string): any?
    local _, err = derive_pbk2(password, ABSENT_ACCOUNT_SALT, PBK2_ITERS)
    return err
end

-- Keep (valid, error) stable; callers that upgrade credentials consume the third result.
local function check_password(stored: string, password: string): (boolean, any?, boolean)
    local scheme, iters_s, salt, expected = stored:match("^(pbk%w+)%$(%d+)%$(%x+)%$(%x+)$")
    if not scheme or not salt or not expected or #expected ~= 128 then
        return false, rejection_cost_error(password), false
    end
    local iters = tonumber(iters_s)
    if not iters or iters < 1 then return false, rejection_cost_error(password), false end

    if scheme == PBK2_PREFIX then
        if iters > PBK2_MAX_STORED_ITERS then return false, rejection_cost_error(password), false end
        local derived, err = derive_pbk2(password, salt, iters)
        if err then return false, err, false end
        local valid = crypto.constant_time_compare(expected, derived)
        local stale = iters < PBK2_ITERS
        if stale and not valid then return false, rejection_cost_error(password), false end
        return valid, nil, valid and stale
    end

    if scheme == PBK1_PREFIX then
        if iters > PBK1_MAX_STORED_ITERS then return false, rejection_cost_error(password), false end
        local derived, err = derive_pbk1(password, salt, iters)
        if err then return false, err, false end
        if not crypto.constant_time_compare(expected, derived) then
            return false, rejection_cost_error(password), false
        end
        return true, nil, true
    end
    return false, rejection_cost_error(password), false
end

-- Spend the same derivation cost a real verification would, so an unauthenticated
-- caller cannot distinguish "no such account" from "wrong password" by response time.
-- The KDF is the dominant cost on this path, so skipping it when the lookup misses is
-- a measurable existence oracle (see the timing note in H7).
function M.equalize_password_timing(password: any)
    derive_pbk2(tostring(password or ""), ABSENT_ACCOUNT_SALT, PBK2_ITERS)
end

M.get_db = get_db
M.find_user = find_user
M.user_exists = user_exists
M.hash_password = hash_password
M.check_password = check_password

return M
