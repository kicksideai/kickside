local test = require("test")
local sql = require("sql")
local crypto = require("crypto")
local hash = require("hash")
local user_repo = require("user_repo")
local support = require("user_repo_support")
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
            test.it("preserves the verifier error result for existing callers", function()
                local stored = assert(support.hash_password("supported-password-123"))
                local valid, verify_err = support.check_password(stored, "supported-password-123")
                test.is_true(valid)
                test.is_nil(verify_err)
                local invalid, invalid_err = support.check_password(stored, "wrong-password")
                test.is_false(invalid)
                test.is_nil(invalid_err)
            end)

            test.it("upgrades published pbk1 hashes only after a successful login", function()
                for _, iters in ipairs({1, 4096}) do
                    local uid = "published_password_" .. tostring(iters)
                    local password = "published-password-123"
                    local salt = "0123456789abcdef0123456789abcdef"
                    local derived = assert(hash.hmac_sha512(password, salt))
                    for _ = 2, iters do derived = assert(hash.hmac_sha512(derived, salt)) end
                    local stored = "pbk1$" .. tostring(iters) .. "$" .. salt .. "$" .. derived
                    test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                        password = "temporary-password", status = "active"})))
                    seed_hash(uid, stored)
                    local before = assert(user_repo.get(uid))
                    local rejected, reject_err = user_credentials_repo.verify_password(uid, "wrong-password")
                    test.is_false(rejected)
                    test.eq(reject_err, "Invalid password")
                    test.eq(assert(user_repo.get(uid)).password_hash, stored)
                    local valid, result = user_credentials_repo.verify_password(uid, password)
                    test.is_true(valid, tostring(result))
                    local after = assert(user_repo.get(uid))
                    test.eq(after.password_hash:sub(1, 12), "pbk2$210000$")
                    test.eq(after.auth_generation, before.auth_generation)
                    local again, again_err = user_credentials_repo.verify_password(uid, password)
                    test.is_true(again, tostring(again_err))
                    test.eq(assert(user_repo.get(uid)).password_hash, after.password_hash)
                    user_lifecycle_repo.delete(uid)
                end
            end)

            test.it("upgrades supported older iteration counts after verification", function()
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
                test.eq(after.password_hash:sub(1, 12), "pbk2$210000$")
                test.eq(after.auth_generation, before.auth_generation)
                user_lifecycle_repo.delete(uid)
            end)

    end)
end
return {run = test.run_cases(define_tests)}
