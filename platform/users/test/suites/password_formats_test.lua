local test = require("test")
local sql = require("sql")
local crypto = require("crypto")
local hash = require("hash")
local user_repo = require("user_repo")
local user_credentials_repo = require("user_credentials_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local function to_hex(raw)
    return (raw:gsub(".", function(c) return string.format("%02x", c:byte()) end))
end
local function seed_hash(uid, stored)
    local db = assert(sql.get("app:db"))
    local _, err = db:execute("UPDATE app_users SET password_hash=$1 WHERE user_id=$2", {stored,uid})
    db:release()
    test.is_nil(err)
end
local function define_tests()
    test.describe("stored password formats", function()
            test.it("rejects retired password hashes without login writes", function()
                local uid = "retired_password_" .. tostring(os.time())
                local password = "retired-password-123"
                local salt = "0123456789abcdef0123456789abcdef"
                local stored = "pbk1$1$" .. salt .. "$" .. hash.hmac_sha512(password, salt)
                test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                    password = "temporary-password", status = "active"})))
                seed_hash(uid, stored)
                local before = assert(user_repo.get(uid))
                local valid, err = user_credentials_repo.verify_password(uid, password)
                test.is_false(valid)
                test.eq(err, "Invalid password")
                local after = assert(user_repo.get(uid))
                test.eq(after.password_hash, stored)
                test.eq(after.auth_generation, before.auth_generation)
                user_lifecycle_repo.delete(uid)
            end)

            test.it("verifies supported iteration counts without rewriting credentials", function()
                local uid = "supported_password_" .. tostring(os.time())
                local password = "supported-password-123"
                local salt = "0123456789abcdef0123456789abcdef"
                local stored = "pbk2$1000$" .. salt .. "$" .. to_hex(assert(crypto.pbkdf2(password, salt, 1000, 64, "sha512")))
                test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                    password = "temporary-password", status = "active"})))
                seed_hash(uid, stored)
                local before = assert(user_repo.get(uid))
                local valid, result = user_credentials_repo.verify_password(uid, password)
                test.is_true(valid, tostring(result))
                local after = assert(user_repo.get(uid))
                test.eq(after.password_hash, stored)
                test.eq(after.updated_at, before.updated_at)
                test.eq(after.auth_generation, before.auth_generation)
                user_lifecycle_repo.delete(uid)
            end)

    end)
end
return {run = test.run_cases(define_tests)}
