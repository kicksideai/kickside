local test = require("test")
local sql = require("sql")
local crypto = require("crypto")
local json = require("json")
local base64 = require("base64")
local funcs = require("funcs")
local security = require("security")
local directory = require("directory")

local function define_tests()
    local prefix = ""
    test.describe("principal directory continuation", function()
        test.before_all(function()
            local suffix, suffix_err = crypto.random.uuid()
            if suffix_err then error(tostring(suffix_err)) end
            prefix = "paging-" .. suffix
            local db, db_err = sql.get("app:db")
            if db_err then error(tostring(db_err)) end
            local tx, tx_err = db:begin()
            if tx_err then db:release(); error(tostring(tx_err)) end
            local rows = {}
            for i = 1, 65 do
                rows[#rows + 1] = { id = prefix .. string.format("-%03d", i), name = prefix, status = "active" }
            end
            rows[#rows + 1] = { id = prefix .. "-inactive", name = prefix, status = "inactive" }
            rows[#rows + 1] = { id = prefix .. "-pending", name = prefix, status = "pending" }
            rows[#rows + 1] = { id = prefix .. "-literal", name = prefix .. "%_\\", status = "active" }
            rows[#rows + 1] = { id = prefix .. "-editor-a", name = "Editors", status = "active" }
            rows[#rows + 1] = { id = prefix .. "-editor-b", name = "Editors", status = "active" }
            for _, row in ipairs(rows) do
                local _, err = sql.builder.insert("app_users"):set_map({
                    user_id = row.id, email = row.id .. "@test.local", full_name = row.name,
                    status = row.status, password_hash = "fixture",
                    created_at = row.id == prefix .. "-001" and "1900-01-01T00:00:00Z" or "2000-01-01T00:00:00Z",
                }):run_with(tx):exec()
                if err then tx:rollback(); db:release(); error(tostring(err)) end
            end
            local _, err = tx:commit()
            db:release()
            if err then error(tostring(err)) end
        end)
        test.after_all(function()
            local db, db_err = sql.get("app:db")
            if db_err then error(tostring(db_err)) end
            local _, err = sql.builder.delete("app_users"):where("user_id LIKE ?", prefix .. "%"):run_with(db):exec()
            db:release()
            if err then error(tostring(err)) end
        end)

        test.it("finds an old matching user beyond the first roster page", function()
            local page, err = directory.search({ query = prefix .. "-001", kinds = { "user" }, limit = 1 })
            test.is_nil(err)
            test.eq(#page.principals, 1)
            test.eq(page.principals[1].id, prefix .. "-001")
            test.eq(page.has_more, false)
        end)

        test.it("pages every active matching user once with a total tied order", function()
            local seen, ids, cursor = {}, {}, nil
            for i = 1, 20 do
                local page, err = directory.search({ query = prefix, kinds = { "user" }, limit = 7, cursor = cursor })
                test.is_nil(err)
                test.ok(#page.principals <= 7)
                for _, principal in ipairs(page.principals) do
                    test.is_nil(seen[principal.id], "a page repeats a user")
                    seen[principal.id] = true
                    ids[#ids + 1] = principal.id
                end
                test.eq(type(page.has_more), "boolean")
                if not page.has_more then test.is_nil(page.cursor); break end
                test.not_nil(page.cursor)
                cursor = page.cursor
            end
            test.eq(#ids, 68)
            test.is_nil(seen[prefix .. "-inactive"])
            test.is_nil(seen[prefix .. "-pending"])
            test.is_true(seen[prefix .. "-001"])
            for i = 2, #ids do test.ok(ids[i - 1] > ids[i], "equal timestamps have a deterministic ID order") end
        end)

        test.it("matches percent underscore and backslash as a literal substring", function()
            local page, err = directory.search({ query = prefix .. "%_\\", kinds = { "user" }, limit = 10 })
            test.is_nil(err)
            test.eq(#page.principals, 1)
            test.eq(page.principals[1].id, prefix .. "-literal")
            test.eq(page.has_more, false)
        end)

        test.it("continues from a full user page into the group catalog", function()
            local users, users_err = directory.search({ query = "Editors", limit = 2 })
            test.is_nil(users_err)
            test.eq(#users.principals, 2)
            test.eq(users.principals[1].type, "user")
            test.eq(users.principals[2].type, "user")
            test.eq(users.has_more, true)
            test.not_nil(users.cursor)
            local groups, groups_err = directory.search({ query = "Editors", limit = 2, cursor = users.cursor })
            test.is_nil(groups_err)
            test.eq(#groups.principals, 1)
            test.eq(groups.principals[1].id, "kickside.security.scopes:editors")
            test.eq(groups.has_more, false)
        end)

        test.it("rejects malformed and mismatched continuation tokens", function()
            local encoded, encode_err = json.encode({ plane = "user", user_after = { created_at = "", user_id = false } })
            test.is_nil(encode_err)
            local packed, pack_err = base64.encode(encoded)
            test.is_nil(pack_err)
            for _, cursor in ipairs({ "invalid%%%", packed }) do
                local page, err = directory.search({ query = prefix, kinds = { "user" }, cursor = cursor })
                test.is_nil(page)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.INVALID))
            end
            local first, first_err = directory.search({ query = prefix, kinds = { "user" }, limit = 1 })
            test.is_nil(first_err)
            test.not_nil(first.cursor)
            local page, err = directory.search({ query = "different", kinds = { "user" }, cursor = first.cursor })
            test.is_nil(page)
            test.is_true(errors.is(err, errors.INVALID))
        end)

        test.it("propagates a catalog authorization failure", function()
            local actor, actor_err = security.new_actor("directory-catalog-denied")
            test.is_nil(actor_err)
            local scope, scope_err = security.named_scope("app:directory_catalog_denied")
            test.is_nil(scope_err)
            local page, err = funcs.new():with_actor(actor):with_scope(scope)
                :call("kickside.users.directory:directory_search", { query = "Editors", kinds = { "group" } })
            test.is_nil(page)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
