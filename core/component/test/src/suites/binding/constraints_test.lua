-- Schema constraint tests for the component tables: the base-table CHECK
-- constraints (non-empty impl_id, non-empty position, access_mask in 0..15)
-- reject bad rows; the parent_id self-FK orphans children on parent delete; the
-- placement path index exists; and the listing endpoint clamps out-of-range
-- pagination. Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local contract = require("contract")
local security = require("security")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local LIST = "list"

local function define_tests()
    test.describe("Component schema constraints", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "owner-" .. suffix
        local impl = "kickside.test:constraints"

        local function get_db()
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end
            return d
        end

        local function ts()
            return time.now():format(time.RFC3339)
        end

        -- Insert a bare component row directly, returning (result, err) so a
        -- CHECK rejection surfaces as a non-nil err.
        local function insert_component(fields)
            local d = get_db()
            local res, err = sql.builder.insert("kickside_components"):set_map(fields):run_with(d):exec()
            d:release()
            return res, err
        end

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function as_owner(target, args)
            local actor = security.new_actor(owner, { security_groups = {} })
            local svc, cerr = contract.get(COMPONENT_SERVICE)
            if cerr or not svc then error("component_service unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst[target](inst, args)
        end

        test.describe("CHECK constraints", function()
            test.it("rejects an empty impl_id", function()
                local _, err = insert_component({
                    component_id = uuid.v7(),
                    impl_id = "",
                    private_context = "{}",
                    position = "n",
                    created_at = ts(),
                    updated_at = ts(),
                })
                test.not_nil(err, "empty impl_id must violate the non-empty CHECK")
            end)

            test.it("rejects an empty position when present", function()
                local _, err = insert_component({
                    component_id = uuid.v7(),
                    impl_id = impl,
                    private_context = "{}",
                    position = "",
                    created_at = ts(),
                    updated_at = ts(),
                })
                test.not_nil(err, "empty position must violate the non-empty CHECK")
            end)

            test.it("accepts a NULL position (root rows before placement)", function()
                local cid = uuid.v7()
                local _, err = insert_component({
                    component_id = cid,
                    impl_id = impl,
                    private_context = "{}",
                    created_at = ts(),
                    updated_at = ts(),
                })
                test.is_nil(err, "NULL position is allowed by the CHECK")

                local d = get_db()
                sql.builder.delete("kickside_components"):where("component_id = ?", cid):run_with(d):exec()
                d:release()
            end)

            test.it("rejects an out-of-range access_mask", function()
                -- A valid component first, so the access row's FK is satisfied and
                -- the only possible failure is the access_mask range CHECK.
                local cid = uuid.v7()
                local _, cerr = insert_component({
                    component_id = cid,
                    impl_id = impl,
                    private_context = "{}",
                    position = "n",
                    created_at = ts(),
                    updated_at = ts(),
                })
                test.is_nil(cerr)

                local d = get_db()
                local _, err = sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(),
                    subject_id = owner,
                    subject_type = "user",
                    component_id = cid,
                    source_component_id = cid,
                    access_mask = 99,
                    created_at = ts(),
                }):run_with(d):exec()
                d:release()
                test.not_nil(err, "access_mask 99 must violate the 0..15 range CHECK")

                -- A negative mask is equally rejected.
                local d2 = get_db()
                local _, neg_err = sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(),
                    subject_id = owner .. "-neg",
                    subject_type = "user",
                    component_id = cid,
                    source_component_id = cid,
                    access_mask = -1,
                    created_at = ts(),
                }):run_with(d2):exec()
                d2:release()
                test.not_nil(neg_err, "negative access_mask must violate the range CHECK")

                -- A valid in-range mask is accepted.
                local d3 = get_db()
                local _, ok_err = sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(),
                    subject_id = owner .. "-ok",
                    subject_type = "user",
                    component_id = cid,
                    source_component_id = cid,
                    access_mask = 15,
                    created_at = ts(),
                }):run_with(d3):exec()
                d3:release()
                test.is_nil(ok_err, "in-range access_mask 15 (FULL) must be accepted")

                local d4 = get_db()
                sql.builder.delete("kickside_component_access"):where("component_id = ?", cid):run_with(d4):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", cid):run_with(d4):exec()
                d4:release()
            end)
        end)

        test.describe("placement schema", function()
            test.it("declares the parent_id self-FK with ON DELETE SET NULL on both dialects", function()
                -- Per-connection SQLite FK enforcement is off in Wippy (the ops
                -- layer orphans children explicitly), so assert the FK action is
                -- declared in the schema rather than relying on runtime cascade.
                local d = get_db()
                local db_type = d:type()
                if db_type == sql.type.POSTGRES then
                    local rows, err = d:query([[
                        SELECT rc.delete_rule
                        FROM information_schema.referential_constraints rc
                        JOIN information_schema.table_constraints tc
                          ON tc.constraint_name = rc.constraint_name
                        WHERE tc.table_name = 'kickside_components'
                          AND tc.constraint_type = 'FOREIGN KEY'
                    ]], {})
                    d:release()
                    if err then error("fk introspection failed: " .. tostring(err)) end
                    local found = false
                    for _, r in ipairs(rows or {}) do
                        if tostring(r.delete_rule):upper() == "SET NULL" then found = true end
                    end
                    test.is_true(found, "parent_id FK must be ON DELETE SET NULL")
                else
                    local rows, err = d:query("PRAGMA foreign_key_list(kickside_components)", {})
                    d:release()
                    if err then error("fk introspection failed: " .. tostring(err)) end
                    local found = false
                    for _, r in ipairs(rows or {}) do
                        if tostring(r.table) == "kickside_components"
                            and tostring(r["from"]) == "parent_id"
                            and tostring(r.on_delete):upper() == "SET NULL" then
                            found = true
                        end
                    end
                    test.is_true(found, "parent_id self-FK must be declared ON DELETE SET NULL")
                end
            end)

            test.it("exposes the placement path index on both dialects", function()
                local d = get_db()
                local db_type = d:type()
                local rows, err
                if db_type == sql.type.POSTGRES then
                    rows, err = d:query(
                        "SELECT indexname AS name FROM pg_indexes WHERE indexname = $1",
                        { "idx_kickside_components_path" })
                else
                    rows, err = d:query(
                        "SELECT name FROM sqlite_master WHERE type = 'index' AND name = $1",
                        { "idx_kickside_components_path" })
                end
                d:release()
                if err then error("index introspection failed: " .. tostring(err)) end
                test.is_true(rows ~= nil and #rows == 1, "placement path index must exist")
            end)
        end)

        test.describe("pagination clamp", function()
            test.it("rejects a limit above the maximum", function()
                local res = as_owner(LIST, { pagination = { limit = 101 } })
                test.not_nil(res)
                test.is_false(res.success, "limit 101 must be rejected by the bound check")
            end)

            test.it("rejects a limit below the minimum", function()
                local res = as_owner(LIST, { pagination = { limit = 0 } })
                test.not_nil(res)
                test.is_false(res.success, "limit 0 must be rejected by the bound check")
            end)

            test.it("rejects a negative offset", function()
                local res = as_owner(LIST, { pagination = { offset = -1 } })
                test.not_nil(res)
                test.is_false(res.success, "negative offset must be rejected by the bound check")
            end)

            test.it("accepts a limit at the boundary", function()
                local res = as_owner(LIST, { pagination = { limit = 100, offset = 0 } })
                test.not_nil(res)
                test.is_true(res.success, "limit 100 is within bounds and must succeed")
            end)
        end)

        test.describe("delete cascade", function()
            local REGISTER = "register"
            local DELETE = "delete"

            local function count_rows(tbl, component_id)
                local d = get_db()
                local rows = sql.builder.select("component_id"):from(tbl)
                    :where("component_id = ?", component_id):run_with(d):query()
                d:release()
                return #(rows or {})
            end

            test.it("deletes the component's meta and access rows", function()
                local reg = as_owner(REGISTER, {
                    impl_id = impl,
                    meta = { label = "cascade-target" },
                    additional_access = { { subject_id = "grantee-" .. suffix, subject_type = "user", access_mask = 1 } },
                })
                test.not_nil(reg)
                test.is_true(reg.success, "register must succeed: " .. tostring(reg.error))
                local cid = reg.component_id
                test.not_nil(cid)

                test.is_true(count_rows("kickside_component_meta", cid) > 0, "meta rows must exist before delete")
                test.is_true(count_rows("kickside_component_access", cid) > 0, "access rows must exist before delete")

                local del = as_owner(DELETE, { component_id = cid })
                test.not_nil(del)
                test.is_true(del.success, "delete must succeed")

                test.eq(count_rows("kickside_component_meta", cid), 0, "meta rows must be gone after delete")
                test.eq(count_rows("kickside_component_access", cid), 0, "access rows must be gone after delete")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
