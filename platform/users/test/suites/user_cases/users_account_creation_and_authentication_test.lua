local test = require("test")
local json = require("json")
local time = require("time")
local sql = require("sql")
local crypto = require("crypto")
local hash = require("hash")
local security = require("security")
local errors = require("errors")
local user_repo = require("user_repo")
local consts = require("consts")
local error_response = require("error_response")
local user_credentials_repo = require("user_credentials_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_groups_repo = require("user_groups_repo")
local user_group_sources_repo = require("user_group_sources_repo")
local admin_repo = require("admin_repo")
local provisioning = require("provisioning")
local directory = require("directory")
local scope_resolver = require("scope_resolver")
local execution_identity = require("execution_identity")
local set_user_groups = require("set_user_groups")
local delete_user = require("delete_user")
local delete_principal = require("delete_principal")
local update_user = require("update_user")
local list_users = require("list_users")
local lifecycle_report = require("lifecycle_report")
local session_index = require("session_index")

local TEST_USER_ID = "test_user_structure_suite"
local TEST_EMAIL = TEST_USER_ID .. "@test.local"

local function define_tests()
    test.describe("user management", function()
        test.describe("create", function()
            test.it("preserves native catalog failures through account and group updates", function()
                local db = assert(sql.get("app:db"))
                test.is_nil(select(2, db:execute("CREATE TABLE IF NOT EXISTS users_catalog_failure (id INTEGER PRIMARY KEY, payload TEXT NOT NULL)")))
                local encoded = assert(json.encode({ error = { kind = errors.UNAVAILABLE, message = "catalog source failure", retryable = false,
                    details = { code = "GROUP_CATALOG_SOURCE_FAILURE", source = { operation = "list" } } } }))
                test.is_nil(select(2, db:execute("INSERT INTO users_catalog_failure (id,payload) VALUES (1,$1)", { encoded })))
                db:release()
                local ok, response = pcall(function()
                    local status, body = update_user.process("catalog-failure-user",
                        json.encode({ groups = { "app.security:user" } }))
                    return { status = status, body = body }
                end)
                local restored, groups_response = pcall(function()
                    local status, body = set_user_groups.process("catalog-failure-user",
                        json.encode({ groups = { "app.security:user" } }))
                    return { status = status, body = body }
                end)
                local cleanup = assert(sql.get("app:db"))
                test.is_nil(select(2, cleanup:execute("DELETE FROM users_catalog_failure WHERE id=1")))
                cleanup:release()
                test.is_true(ok)
                test.is_true(restored)
                test.eq((response :: any).status, 500)
                test.eq((groups_response :: any).status, 500)
                for _, reply in ipairs({ (response :: any).body, (groups_response :: any).body }) do
                    test.is_false(reply.success)
                    test.eq(reply.kind, errors.UNAVAILABLE)
                    test.is_false(reply.retryable)
                    test.eq(reply.code, "GROUP_CATALOG_SOURCE_FAILURE")
                    test.eq(reply.details.source.operation, "list")
                end
            end)

            test.it("keeps an unavailable group catalog at HTTP 500 during administrative updates", function()
                local db = assert(sql.get("app:db"))
                test.is_nil(select(2, db:execute("CREATE TABLE IF NOT EXISTS users_catalog_failure (id INTEGER PRIMARY KEY, payload TEXT NOT NULL)")))
                test.is_nil(select(2, db:execute("INSERT INTO users_catalog_failure (id,payload) VALUES (1,$1)",
                    { assert(json.encode({ result = {} })) })))
                db:release()
                local ok, response = pcall(function()
                    local status, body = update_user.process("catalog-failure-user",
                        json.encode({ groups = { "app.security:user" } }))
                    return { status = status, body = body }
                end)
                local cleanup = assert(sql.get("app:db"))
                test.is_nil(select(2, cleanup:execute("DELETE FROM users_catalog_failure WHERE id=1")))
                cleanup:release()
                test.is_true(ok)
                test.eq((response :: any).status, 500)
                test.is_false((response :: any).body.success)
                test.eq((response :: any).body.kind, errors.UNAVAILABLE)
                test.eq((response :: any).body.code, "GROUP_CATALOG_UNAVAILABLE")
                test.is_false((response :: any).body.retryable)
            end)

            test.it("returns native validation failures from administrative transactions", function()
                local _, create_err = admin_repo.create({}, nil)
                test.is_true(errors.is(create_err, errors.INVALID))
                test.eq(create_err:details().code, consts.ERROR_CODE.INVALID_FIELD_VALUE)
                test.is_false(create_err:retryable())
                test.eq(error_response.status(create_err), 400)
                for _, values in ipairs({ { data = "invalid", code = consts.ERROR_CODE.INVALID_FIELD_VALUE },
                    { data = {}, code = consts.ERROR_CODE.MISSING_REQUIRED_FIELD } }) do
                    local _, update_err = admin_repo.update("unused-validation-subject", values.data, nil)
                    test.is_true(errors.is(update_err, errors.INVALID))
                    test.eq(update_err:details().code, values.code)
                    test.is_false(update_err:retryable())
                    test.eq(error_response.status(update_err), 400)
                end
            end)

            test.it("preserves the database acquisition error through administrative transactions", function()
                local resource = "app:missing_administrative_database"
                local _, source = sql.get(resource)
                test.not_nil(source)
                local saved = consts.get_db_resource
                consts.get_db_resource = function() return resource end
                local ok, result = pcall(function()
                    local value, err = admin_repo.create({ email = "unused@test.local" }, {})
                    return { value = value, err = err }
                end)
                consts.get_db_resource = saved
                test.is_true(ok, tostring(result))
                test.is_nil(result.value)
                test.is_true(errors.is(result.err, source:kind()))
                test.eq(result.err:retryable(), source:retryable())
                test.eq(error_response.status(result.err), 500)
            end)

            test.it("creates a user with valid data", function()
                local result, err = user_repo.create({
                    user_id = TEST_USER_ID,
                    email = TEST_EMAIL,
                    full_name = "Test User",
                    password = "testpass123",
                    status = "active",
                })
                test.is_nil(err)
                test.not_nil(result)
            end)

            test.it("rejects duplicate email", function()
                local result, err = user_repo.create({
                    user_id = TEST_USER_ID .. "_dup",
                    email = TEST_EMAIL,
                    full_name = "Duplicate",
                    password = "testpass123",
                    status = "active",
                })
                test.is_nil(result)
                test.not_nil(err)
            end)

            test.it("rejects empty email", function()
                local result, err = user_repo.create({
                    user_id = "no_email_user",
                    email = "",
                    full_name = "No Email",
                    password = "testpass123",
                    status = "active",
                })
                test.is_nil(result)
                test.not_nil(err)
            end)

            test.it("rejects short password", function()
                local result, err = user_repo.create({
                    user_id = "short_pass_user",
                    email = "short@test.local",
                    full_name = "Short Pass",
                    password = "abc",
                    status = "active",
                })
                test.is_nil(result)
                test.not_nil(err)
            end)

            test.it("rolls back account creation when membership persistence fails", function()
                local uid = "atomic_create_" .. tostring(os.time())
                local result, err = admin_repo.create({
                    user_id = uid,
                    email = uid .. "@test.local",
                    full_name = "Atomic Create",
                    password = "testpass123",
                    status = "active",
                }, { "app.security:user", "app.security:user" })
                test.is_nil(result)
                test.not_nil(err)

                local missing, get_err = user_repo.get(uid)
                test.is_nil(missing)
                test.not_nil(get_err)
            end)

            test.it("returns a native duplicate error from the administrative repository", function()
                local uid = "native_duplicate_" .. tostring(os.time())
                local created, create_err = admin_repo.create({
                    user_id = uid,
                    email = uid .. "@test.local",
                    full_name = "Native Duplicate",
                    password = "testpass123",
                    status = "active",
                }, { "app.security:user" })
                test.is_nil(create_err)
                test.not_nil(created)

                local duplicate, duplicate_err = admin_repo.create({
                    user_id = uid .. "_again",
                    email = uid .. "@test.local",
                    full_name = "Native Duplicate Again",
                    password = "testpass123",
                    status = "active",
                }, { "app.security:user" })
                test.is_nil(duplicate)
                test.is_true(errors.is(duplicate_err, errors.ALREADY_EXISTS))
                test.eq(duplicate_err:details().code, "USER_ALREADY_EXISTS")
                test.is_false(duplicate_err:retryable())

                user_groups_repo.remove_all_user_groups(uid)
                user_lifecycle_repo.delete(uid)
            end)

            test.it("preserves a native database dependency error through the repository", function()
                local source = errors.new({
                    kind = errors.UNAVAILABLE,
                    message = "users database dependency is unavailable",
                    retryable = true,
                    details = { code = "DB_DEPENDENCY_UNAVAILABLE", nested = { operation = "connect" } },
                })
                local propagated = consts.propagate_error(source, consts.ERROR_CODE.DB_CONNECTION_FAILED,
                    consts.ERROR.DB_CONNECTION_FAILED)
                test.is_true(errors.is(propagated, errors.UNAVAILABLE))
                test.eq(propagated:message(), "users database dependency is unavailable")
                test.is_true(propagated:retryable())
                local propagated_details = propagated:details()
                test.eq(propagated_details.code, "DB_DEPENDENCY_UNAVAILABLE")
                test.eq(propagated_details.nested.operation, "connect")

                local original = consts.get_db_resource
                consts.get_db_resource = function() return "app:missing_native_errors_database" end
                local result, err = user_repo.create({
                    user_id = "native_dependency_" .. tostring(os.time()),
                    email = "native_dependency_" .. tostring(os.time()) .. "@test.local",
                    full_name = "Native Dependency",
                    password = "testpass123",
                    status = "active",
                })
                consts.get_db_resource = original
                test.is_nil(result)
                test.is_true(type(err) == "userdata")
                test.is_true(errors.is(err, errors.NOT_FOUND))
                test.is_false(err:retryable())
                test.eq(error_response.status(err), 500)
                test.is_nil(error_response.body(err).details)
            end)

            test.it("keeps dependency error kinds out of administrative client statuses", function()
                local dependency_kinds = {
                    errors.ALREADY_EXISTS,
                    errors.INVALID,
                    errors.CONFLICT,
                }
                for _, kind in ipairs(dependency_kinds) do
                    local dependency = errors.new({
                        kind = kind,
                        message = "dependency failure",
                        retryable = false,
                        details = { code = "DEPENDENCY_FAILURE" },
                    })
                    test.eq(error_response.status(dependency), 500)
                end

                local missing_user = consts.new_error(consts.ERROR_CODE.USER_NOT_FOUND)
                test.is_true(consts.has_error_code(missing_user, consts.ERROR_CODE.USER_NOT_FOUND))
                test.is_false(consts.has_error_code(errors.new({
                    kind = errors.NOT_FOUND,
                    message = "missing dependency",
                    retryable = false,
                    details = { code = "DEPENDENCY_NOT_FOUND" },
                }), consts.ERROR_CODE.USER_NOT_FOUND))
            end)

            test.it("rolls back account fields and memberships together", function()
                local uid = "atomic_update_" .. tostring(os.time())
                local created, create_err = admin_repo.create({
                    user_id = uid,
                    email = uid .. "@test.local",
                    full_name = "Before",
                    password = "testpass123",
                    status = "active",
                }, { "app.security:user" })
                test.is_nil(create_err)
                test.not_nil(created)

                local result, err = admin_repo.update(uid, { full_name = "After" },
                    { "app.security:admin", "app.security:admin" })
                test.is_nil(result)
                test.not_nil(err)

                local user = user_repo.get(uid)
                test.eq((user :: any).full_name, "Before")
                local groups = user_groups_repo.get_user_groups(uid)
                test.eq(#(groups :: any).groups, 1)
                test.eq((groups :: any).groups[1], "app.security:user")

                user_groups_repo.remove_all_user_groups(uid)
                user_lifecycle_repo.delete(uid)
            end)

            test.it("returns a native not-found error through the update endpoint", function()
                local missing = "native_missing_" .. tostring(os.time())
                local result, update_err = admin_repo.update(missing, { full_name = "Missing" }, nil)
                test.is_nil(result)
                test.is_true(errors.is(update_err, errors.NOT_FOUND))
                test.eq(update_err:details().code, "USER_NOT_FOUND")
                test.is_false(update_err:retryable())

                local status, body = update_user.process(missing, json.encode({ full_name = "Missing" }))
                test.eq(status, 404)
                test.is_false(body.success)
                test.eq(body.error, "User not found")
                test.eq(body.kind, errors.NOT_FOUND)
                test.eq(body.code, "USER_NOT_FOUND")
                test.is_false(body.retryable)
                test.eq(body.details.code, "USER_NOT_FOUND")
            end)

            test.it("creates passwordless users through the repository seam", function()
                local uid = "passwordless_" .. tostring(os.time())
                local result, err = user_repo.create_passwordless({
                    user_id = uid,
                    email = uid .. "@test.local",
                    full_name = "Passwordless User",
                })
                test.is_nil(err)
                test.not_nil(result)
                test.eq(result.passwordless, true)

                local user, get_err = user_repo.get(uid)
                test.is_nil(get_err)
                test.eq(user.user_id, uid)
                test.eq(user.status, "active")

                local valid = user_credentials_repo.verify_password(uid, "testpass123")
                test.is_false(valid)
                user_lifecycle_repo.delete(uid)
            end)

            test.it("validates passwordless names before SSO persistence", function()
                for i, bad_name in ipairs({ "line\nbreak", string.rep("n", 201), 42 }) do
                    local uid = "passwordless_bad_" .. tostring(os.time()) .. "_" .. tostring(i)
                    local result, err = user_repo.create_passwordless({
                        user_id = uid,
                        email = uid .. "@test.local",
                        full_name = bad_name,
                    })
                    test.is_nil(result)
                    test.not_nil(err)
                    local missing = user_repo.get(uid)
                    test.is_nil(missing)
                end

                local uid = "passwordless_limit_" .. tostring(os.time())
                local result, err = user_repo.create_passwordless({
                    user_id = uid,
                    email = uid .. "@test.local",
                    full_name = string.rep("n", 200),
                })
                test.is_nil(err)
                test.not_nil(result)
                user_lifecycle_repo.delete(uid)
            end)
        end)

        -- One canonical timestamp representation: created_at is an RFC3339 UTC
        -- string in both the persisted row and every read path, identical across
        -- SQLite and PostgreSQL. No unix integers, no per-DB shape.
        test.describe("canonical RFC3339 timestamps", function()
            local tid = "ts_" .. tostring(os.time())
            local temail = tid .. "@test.local"

            test.it("stores created_at as a parseable RFC3339 string", function()
                local created, cerr = user_repo.create({
                    user_id = tid, email = temail, full_name = "TS User",
                    password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                test.not_nil(created)

                local user, gerr = user_repo.get(tid)
                test.is_nil(gerr)
                test.eq(type(user.created_at), "string")
                test.is_true(#tostring(user.created_at) > 0)

                local parsed, perr = time.parse(time.RFC3339, tostring(user.created_at))
                test.is_nil(perr)
                test.not_nil(parsed)
            end)

            test.it("list returns the same created_at string", function()
                local from_get = user_repo.get(tid)
                test.not_nil(from_get)
                local fetched: any = from_get or {}
                local users, lerr = user_repo.list()
                test.is_nil(lerr)
                local listed = nil
                for _, u in ipairs(users) do
                    if u.user_id == tid then listed = u end
                end
                test.not_nil(listed)
                test.eq(type(listed.created_at), "string")
                test.eq(tostring(listed.created_at), tostring(fetched.created_at))
            end)

            test.it("cleans up the timestamp user", function()
                user_lifecycle_repo.delete(tid)
            end)
        end)

        -- The SQL token store (kickside_user_auth_tokens) shares the canonical
        -- representation: created_at / updated_at are RFC3339 UTC TEXT on both
        -- DBs, filled by the column DEFAULT the runtime store relies on when it
        -- inserts a token row. expires_at stays a native TTL value the store
        -- compares against now(), so it is left out of this contract.
        test.describe("token store canonical RFC3339 timestamps", function()
            local token_key = "ts_token_" .. tostring(os.time())

            local function with_db(body)
                local db, derr = sql.get("app:db")
                if derr or not db then error("db: " .. tostring(derr)) end
                local ok, err = pcall(body, db)
                db:release()
                if not ok then error(err) end
            end

            test.it("fills created_at / updated_at as parseable RFC3339 strings", function()
                with_db(function(db)
                    db:execute("DELETE FROM kickside_user_auth_tokens WHERE token_key = $1", { token_key })

                    -- Mirror the runtime store insert: write only the id/payload
                    -- columns and let the DEFAULT populate the timestamps.
                    local _, ierr = sql.builder.insert("kickside_user_auth_tokens")
                        :set_map({ token_key = token_key, token_value = "seed" })
                        :run_with(db):exec()
                    test.is_nil(ierr)

                    local rows, qerr = db:query(
                        "SELECT created_at, updated_at FROM kickside_user_auth_tokens WHERE token_key = $1",
                        { token_key }
                    )
                    test.is_nil(qerr)
                    test.not_nil(rows and rows[1])
                    local row: any = rows[1]

                    test.eq(type(row.created_at), "string")
                    test.eq(type(row.updated_at), "string")

                    local pc, pcerr = time.parse(time.RFC3339, tostring(row.created_at))
                    test.is_nil(pcerr)
                    test.not_nil(pc)

                    local pu, puerr = time.parse(time.RFC3339, tostring(row.updated_at))
                    test.is_nil(puerr)
                    test.not_nil(pu)
                end)
            end)

            test.it("cleans up the seeded token row", function()
                with_db(function(db)
                    db:execute("DELETE FROM kickside_user_auth_tokens WHERE token_key = $1", { token_key })
                end)
            end)
        end)

        -- These probes use the same SQL-backed token-store table as the runtime.
        -- They prove that revocation is keyed by ':' + unsigned token base, never a
        -- bearer token, and that the account fence does not cross account boundaries.
        test.describe("atomic session invalidation", function()
            local uid_a = "session_a_" .. tostring(os.time())
            local uid_b = "session_b_" .. tostring(os.time())
            local key_a1, key_a2, key_b, key_stale, key_cleanup =
                ":session_a1", ":session_a2", ":session_b1", ":session_stale", ":session_cleanup"

            local function with_db(body)
                local db, derr = sql.get("app:db")
                if derr or not db then error("db: " .. tostring(derr)) end
                local ok, err = pcall(body, db)
                db:release()
                if not ok then error(err) end
            end

            test.it("uses the unsigned SQL token key, never the bearer signature", function()
                local key, err = session_index.token_key("session_a1.signature-must-not-persist")
                test.is_nil(err)
                test.eq(key, key_a1)
            end)

            test.it("sets up two accounts and indexed token-store rows", function()
                local a, aerr = user_repo.create({ user_id = uid_a, email = uid_a .. "@test.local", full_name = "A", password = "testpass123", status = "active" })
                local b, berr = user_repo.create({ user_id = uid_b, email = uid_b .. "@test.local", full_name = "B", password = "testpass123", status = "active" })
                test.is_nil(aerr); test.not_nil(a)
                test.is_nil(berr); test.not_nil(b)
                with_db(function(db)
                    for _, key in ipairs({ key_a1, key_a2, key_b, key_stale, key_cleanup }) do
                        local _, err = sql.builder.insert("kickside_user_auth_tokens")
                            :set_map({ token_key = key, token_value = "seed" })
                            :run_with(db):exec()
                        test.is_nil(err)
                    end
                    for _, row in ipairs({
                        { key_a1, uid_a }, { key_a2, uid_a }, { key_b, uid_b }, { key_cleanup, uid_b },
                    }) do
                        local _, err = sql.builder.insert("kickside_user_sessions")
                            :set_map({ token_key = row[1], user_id = row[2], auth_generation = 0 })
                            :run_with(db):exec()
                        test.is_nil(err)
                    end
                end)
            end)

            test.it("removes the session index when token-store cleanup deletes a token", function()
                with_db(function(db)
                    local _, derr = sql.builder.delete("kickside_user_auth_tokens")
                        :where("token_key = ?", key_cleanup)
                        :run_with(db):exec()
                    test.is_nil(derr)
                    local sessions, serr = sql.builder.select("token_key")
                        :from("kickside_user_sessions")
                        :where("token_key = ?", key_cleanup)
                        :run_with(db):query()
                    test.is_nil(serr)
                    test.eq(#sessions, 0)
                end)
            end)

            test.it("invalidates every session for one account atomically and leaves another intact", function()
                local result, err = session_index.invalidate_user(uid_a)
                test.is_nil(err)
                test.eq(result.revoked, 2)
                with_db(function(db)
                    local tokens, terr = db:query("SELECT token_key FROM kickside_user_auth_tokens ORDER BY token_key")
                    test.is_nil(terr)
                    test.eq(#tokens, 2)
                    test.eq(tokens[1].token_key, key_b)
                    test.eq(tokens[2].token_key, key_stale)
                    local sessions, serr = db:query("SELECT user_id FROM kickside_user_sessions")
                    test.is_nil(serr)
                    test.eq(#sessions, 1)
                    test.eq(sessions[1].user_id, uid_b)
                    local users, uerr = sql.builder.select("auth_generation")
                        :from("app_users"):where("user_id = ?", uid_a):run_with(db):query()
                    test.is_nil(uerr)
                    test.eq(users[1].auth_generation, 1)
                end)
            end)

            test.it("fails a stale-generation mint closed and deletes its exact token-store row", function()
                local result, err = session_index.record_minted("session_stale.signature", uid_b, 99)
                test.is_nil(result)
                test.not_nil(err)
                with_db(function(db)
                    local tokens, terr = sql.builder.select("token_key")
                        :from("kickside_user_auth_tokens")
                        :where("token_key = ?", key_stale)
                        :run_with(db):query()
                    test.is_nil(terr)
                    test.eq(#tokens, 0)
                end)
            end)

            test.it("revokes exactly one presented session without affecting another account", function()
                local result, err = session_index.invalidate_token("session_b1.any-signature")
                test.is_nil(err)
                test.eq(result.revoked, 1)
                with_db(function(db)
                    local tokens, terr = db:query("SELECT token_key FROM kickside_user_auth_tokens")
                    test.is_nil(terr)
                    test.eq(#tokens, 0)
                    local sessions, serr = db:query("SELECT token_key FROM kickside_user_sessions")
                    test.is_nil(serr)
                    test.eq(#sessions, 0)
                end)
            end)

            test.it("cleans up session fence fixtures", function()
                user_lifecycle_repo.delete(uid_a)
                user_lifecycle_repo.delete(uid_b)
            end)
        end)

        test.describe("atomic self password rotation", function()
            local uid = "self_rotate_" .. tostring(os.time())
            local old_password = "old-password-123"
            local new_password = "new-password-456"
            local token_keys = { ":self_rotate_1", ":self_rotate_2" }

            local function with_db(body)
                local db, derr = sql.get("app:db")
                if derr or not db then error("db: " .. tostring(derr)) end
                local ok, err = pcall(body, db)
                db:release()
                if not ok then error(err) end
            end

            test.it("keeps credentials and sessions on failure, then rotates both atomically", function()
                local created, create_err = user_repo.create({
                    user_id = uid,
                    email = uid .. "@test.local",
                    full_name = "Before Rotation",
                    password = old_password,
                    status = "active",
                })
                test.is_nil(create_err)
                test.not_nil(created)
                local before: any = user_repo.get(uid) or {}

                with_db(function(db)
                    for _, key in ipairs(token_keys) do
                        local _, token_err = sql.builder.insert("kickside_user_auth_tokens")
                            :set_map({ token_key = key, token_value = "seed" })
                            :run_with(db):exec()
                        test.is_nil(token_err)
                        local _, session_err = sql.builder.insert("kickside_user_sessions")
                            :set_map({
                                token_key = key,
                                user_id = uid,
                                auth_generation = before.auth_generation,
                            })
                            :run_with(db):exec()
                        test.is_nil(session_err)
                    end
                end)

                local rejected, reject_err = user_credentials_repo.update_self_password(uid, "wrong-password", {
                    password = new_password,
                    full_name = "Must Not Persist",
                })
                test.is_nil(rejected)
                test.eq(reject_err, "Invalid password")
                local oversized, oversized_err = user_credentials_repo.update_self_password(
                    uid, string.rep("x", 129), { password = new_password })
                test.is_nil(oversized)
                test.eq(oversized_err, "Invalid password")
                local unchanged: any = user_repo.get(uid) or {}
                test.eq(unchanged.password_hash, before.password_hash)
                test.eq(unchanged.auth_generation, before.auth_generation)
                test.eq(unchanged.full_name, "Before Rotation")
                with_db(function(db)
                    local tokens = sql.builder.select("token_key"):from("kickside_user_auth_tokens")
                        :where("token_key IN (?, ?)", token_keys[1], token_keys[2]):run_with(db):query()
                    local sessions = sql.builder.select("token_key"):from("kickside_user_sessions")
                        :where("user_id = ?", uid):run_with(db):query()
                    test.eq(#tokens, 2)
                    test.eq(#sessions, 2)
                end)

                local rotated, rotate_err = user_credentials_repo.update_self_password(uid, old_password, {
                    password = new_password,
                    full_name = "After Rotation",
                })
                test.is_nil(rotate_err)
                test.not_nil(rotated)
                test.eq(rotated.sessions_revoked, 2)
                local after: any = user_repo.get(uid) or {}
                test.eq(after.auth_generation, before.auth_generation + 1)
                test.eq(after.full_name, "After Rotation")
                local old_verified, old_result = user_credentials_repo.verify_password(uid, old_password)
                test.is_false(old_verified, tostring(old_result))
                local new_verified, new_result = user_credentials_repo.verify_password(uid, new_password)
                test.is_true(new_verified, tostring(new_result))
                with_db(function(db)
                    local tokens = sql.builder.select("token_key"):from("kickside_user_auth_tokens")
                        :where("token_key IN (?, ?)", token_keys[1], token_keys[2]):run_with(db):query()
                    local sessions = sql.builder.select("token_key"):from("kickside_user_sessions")
                        :where("user_id = ?", uid):run_with(db):query()
                    test.eq(#tokens, 0)
                    test.eq(#sessions, 0)
                end)
                user_lifecycle_repo.delete(uid)
            end)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
