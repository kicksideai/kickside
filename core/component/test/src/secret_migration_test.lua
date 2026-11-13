-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local time = require("time")
local migration = require("secrets_migration")
local component = require("component")
local funcs = require("funcs")
local security = require("security")
local context_ops = require("context_ops")
local reader = require("reader")

return {run = test.run_cases(function()
    test.describe("existing component secrets migration", function()
        test.it("migrates new secret declarations on previously encrypted rows without changing existing secrets", function()
            local db = assert(sql.get("app:db"))
            local bad, id = uuid.v7(), uuid.v7()
            local bad_context = assert(json.encode({api_key = {set = true}, auth = {password = "retained-legacy"}}))
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_components
                (component_id,impl_id,private_context,encrypted_secrets,context_revision)
                VALUES ($1,'app:evolving_secret_kind',$2,'invalid-envelope',7)]], {bad, bad_context})))
            local encrypted = assert(funcs.call("kickside.component.system:seal_secrets", id, {api_key = "original-secret", retired_token = "retained-encrypted-secret"}, {{path = {"api_key"}, type = "string"}, {path = {"retired_token"}, type = "string"}}))
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_components
                (component_id,impl_id,private_context,encrypted_secrets,context_revision)
                VALUES ($1,'app:evolving_secret_kind',$2,$3,7)]], {id,
                assert(json.encode({api_key = {set = true}, retired_token = {set = true}, auth = {password = "newly-declared-secret", user = "kept"}})), encrypted})))
            local malformed = {}
            for _, present in ipairs({true, false}) do
                local malformed_id = uuid.v7()
                local previous = assert(funcs.call("kickside.component.system:seal_secrets", malformed_id,
                    {api_key = "retained-secret"}, {{path = {"api_key"}, type = "string"}}))
                test.is_nil(select(2, db:execute([[INSERT INTO kickside_components
                    (component_id,impl_id,private_context,encrypted_secrets)
                    VALUES ($1,'app:evolving_secret_kind',$2,$3)]], {malformed_id,
                    assert(json.encode({api_key = {set = true}, auth = {password = {set = present}}})), previous})))
                malformed[#malformed + 1] = {id = malformed_id, encrypted = previous, present = present}
            end
            local complete_id = uuid.v7()
            local complete_envelope = assert(funcs.call("kickside.component.system:seal_secrets", complete_id,
                {api_key = "unchanged-secret", auth = {password = "unchanged-password"}},
                {{path = {"api_key"}, type = "string"}, {path = {"auth", "password"}, type = "string"}}))
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_components
                (component_id,impl_id,private_context,encrypted_secrets)
                VALUES ($1,'app:evolving_secret_kind',$2,$3)]], {complete_id,
                assert(json.encode({api_key = {set = true}, auth = {password = {set = true}}})), complete_envelope})))
            local before, before_err = component.get_private_context(id)
            test.is_nil(before_err)
            test.eq(before.api_key, "original-secret")
            test.eq(before.auth.password, "newly-declared-secret")
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_component_access
                (access_id,component_id,source_component_id,subject_id,subject_type,access_mask)
                VALUES ($1,$2,$3,$4,'user',15)]], {uuid.v7(), id, id, assert(security.actor()):id()})))
            local external, external_err = funcs.call("kickside.component.binding:get_access_context_func",
                {component_id = id, include_context = true})
            test.is_nil(external_err)
            test.is_true(external.success, assert(json.encode(external)))
            local report, err = migration.run(5)
            test.is_nil(err)
            test.is_true(report.converted == 1, assert(json.encode(report)))
            test.eq(report.invalid, 3)
            test.eq(assert(db:query("SELECT encrypted_secrets FROM kickside_components WHERE component_id=$1", {complete_id}))[1].encrypted_secrets, complete_envelope)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_components WHERE component_id=$1", {complete_id})))
            for _, invalid in ipairs(malformed) do
                local retained = assert(db:query("SELECT private_context,encrypted_secrets FROM kickside_components WHERE component_id=$1", {invalid.id}))[1]
                test.eq(retained.encrypted_secrets, invalid.encrypted)
                test.eq(assert(json.decode(retained.private_context)).auth.password.set, invalid.present)
                test.is_nil(select(2, db:execute("DELETE FROM kickside_components WHERE component_id=$1", {invalid.id})))
            end
            local invalid_row = assert(db:query("SELECT private_context,encrypted_secrets,context_revision FROM kickside_components WHERE component_id=$1", {bad}))[1]
            test.eq(assert(json.decode(invalid_row.private_context)).auth.password, "retained-legacy")
            test.eq(invalid_row.encrypted_secrets, "invalid-envelope")
            test.eq(tonumber(invalid_row.context_revision), 7)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_components WHERE component_id=$1", {bad})))
            local row = assert(db:query("SELECT * FROM kickside_components WHERE component_id=$1", {id}))[1]
            test.is_nil((assert(json.encode(row)):find("newly-declared-secret", 1, true)))
            test.eq(tonumber(row.context_revision), 7)
            local after = assert(component.get_private_context(id))
            test.eq(after.api_key, "original-secret")
            test.eq(after.retired_token, "retained-encrypted-secret")
            test.eq(after.auth.password, "newly-declared-secret")
            test.eq(after.auth.user, "kept")
            test.eq(assert(migration.run(2)).converted, 0)
            local tx = assert(db:begin())
            local patched, patch_err = context_ops.patch_context(tx, {component_id = id, patch = {auth = {user = "changed"}}})
            if patch_err then tx:rollback() else tx:commit() end
            test.is_nil(patch_err)
            test.is_true(patched.changes_made)
            local context = assert(component.get_private_context(id))
            test.eq(context.auth.password, "newly-declared-secret")
            test.eq(context.auth.user, "changed")
            test.eq(context.retired_token, "retained-encrypted-secret")
            test.is_nil(select(2, db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id})))
            test.is_nil(select(2, db:release()))
            test.eq(external.context.auth.password.set, true)
            test.is_nil((assert(json.encode(external)):find("newly-declared-secret", 1, true)))
        end)
        test.it("reports malformed legacy fields without changing the row or hiding the error", function()
            local db = assert(sql.get("app:db"))
            local id = uuid.v7()
            local raw = assert(json.encode({api_key = {set = false, unexpected = "malformed-credential-sentinel"}}))
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_components
                (component_id,impl_id,private_context,context_revision)
                VALUES ($1,'app:secret_kind',$2,7)]], {id, raw})))
            local before = assert(db:query("SELECT private_context FROM kickside_components WHERE component_id=$1", {id}))[1].private_context
            local report, err = migration.run(2)
            test.is_nil(err)
            test.eq(report.converted, 0)
            test.eq(report.invalid, 1)
            test.is_false(report.needs_continue)
            local after = assert(db:query("SELECT private_context,encrypted_secrets,context_revision FROM kickside_components WHERE component_id=$1", {id}))[1]
            test.eq(after.private_context, before)
            test.eq(tonumber(after.context_revision), 7)
            test.is_nil(after.encrypted_secrets)
            local value, read_err = component.get_private_context(id)
            test.is_nil(value)
            test.is_true(errors.is(read_err, errors.INVALID))
            test.is_nil((tostring(read_err):find("malformed-credential-sentinel", 1, true)))
            test.is_nil(select(2, db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id})))
            test.is_nil(select(2, db:release()))
        end)
        test.it("migrates a JSON-null declared secret as absent", function()
            local db = assert(sql.get("app:db"))
            local id = uuid.v7()
            local raw = '{"api_key":null,"cursor":3}'
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_components
                (component_id,impl_id,private_context,context_revision)
                VALUES ($1,'app:secret_kind',$2,7)]], {id, raw})))
            local report, err = migration.run(2)
            test.is_nil(err)
            test.eq(report.converted, 1)
            test.eq(report.invalid, 0)
            local row = assert(db:query("SELECT private_context,encrypted_secrets,context_revision FROM kickside_components WHERE component_id=$1", {id}))[1]
            test.not_nil(row.encrypted_secrets)
            test.eq(tonumber(row.context_revision), 7)
            local visible = assert(json.decode(tostring(row.private_context)))
            test.eq(visible.api_key.set, false)
            test.eq(visible.cursor, 3)
            local value, read_err = component.get_private_context(id)
            test.is_nil(read_err)
            test.is_nil(value.api_key)
            test.eq(value.cursor, 3)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id})))
            test.is_nil(select(2, db:release()))
        end)
        test.it("commits bounded rows, resumes and preserves context revisions and timestamps", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            db = assert(db)
            local ids: {string} = {}
            local timestamp = time.now():utc():format_rfc3339()
            for i = 1, 5 do
                local id = uuid.v7()
                ids[#ids + 1] = id
                local raw, encode_err = json.encode({api_key = "legacy-credential-" .. tostring(i), cursor = i})
                test.is_nil(encode_err)
                local _, insert_err = db:execute([[INSERT INTO kickside_components
                    (component_id,impl_id,private_context,created_at,updated_at,context_revision)
                    VALUES ($1,'app:secret_kind',$2,$3,$3,7)]], {id, raw, timestamp})
                test.is_nil(insert_err)
            end
            local first, first_err = migration.run(2)
            test.is_nil(first_err)
            test.eq(first.converted, 2)
            test.is_true(first.needs_continue)
            local second, second_err = migration.run(2)
            test.is_nil(second_err)
            test.eq(second.converted, 2)
            local last, last_err = migration.run(2)
            test.is_nil(last_err)
            test.eq(last.converted, 1)
            test.is_false(last.needs_continue)
            local again, again_err = migration.run(2)
            test.is_nil(again_err)
            test.eq(again.converted, 0)
            for i, id in ipairs(ids) do
                local rows, read_err = db:query("SELECT * FROM kickside_components WHERE component_id=$1", {id})
                test.is_nil(read_err)
                test.eq(tonumber(rows[1].secrets_generation), 1)
                test.eq(tonumber(rows[1].context_revision), 7)
                test.eq(rows[1].updated_at, timestamp)
                test.is_nil((json.encode(rows[1]):find("legacy-credential", 1, true)))
                local context, context_err = component.get_private_context(id)
                test.is_nil(context_err)
                test.eq(context.api_key, "legacy-credential-" .. tostring(i))
                test.eq(context.cursor, i)
                local _, delete_err = db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id})
                test.is_nil(delete_err)
            end
            local _, release_err = db:release()
            test.is_nil(release_err)
        end)
    end)
end)}
