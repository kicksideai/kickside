local test = require("test")
local funcs = require("funcs")
local uuid = require("uuid")
local json = require("json")
local scratch = require("migration_scratch")
local natural = require("natural_key")

local function assert_rows(actual, expected)
    test.eq(#actual, #expected)
    for i, row in ipairs(expected) do
        for column, value in pairs(row) do test.eq(actual[i][column], value, column) end
        for column, value in pairs(actual[i]) do test.eq(value, row[column], column) end
    end
end

return test.run_cases(function()
    test.describe("legacy natural key boot migration", function()
        test.it("propagates SQL conflicts instead of reporting a data refusal", function()
            local key = natural.key("legacy", "database-conflict")
            local id = natural.legacy_id(key)
            local cause = errors.new({message="database query conflict",kind=errors.CONFLICT,
                retryable=false,details={code="test_sql_conflict",reason="database_conflict"}})
            local calls = 0
            local executor = {query=function()
                calls = calls + 1
                if calls == 1 then
                    return {{id=id,component_id=id,backing_id=id,thread_class=key.class,
                        attrs=json.encode({external_ref=key.ref})}}, nil
                end
                return nil, cause
            end}
            local adopted, err = natural.adopt_legacy(executor,"sqlite",id)
            test.is_nil(adopted)
            test.is_true(errors.is(err,errors.CONFLICT))
            test.eq(err:details().code,"test_sql_conflict")
            test.eq(err:details().reason,"database_conflict")
            test.eq(calls,2)
        end)
        test.it("binds verified published rows, preserves data, reports refusals and replays safely", function()
            scratch.reset()
            scratch.migrate("kickside.core.migration_tests:legacy_thread_schema")
            scratch.migrate("kickside.core.migration_tests:legacy_component_schema")
            scratch.migrate("kickside.core.migrations:10_thread_natural_keys")
            local function seed(class, ref, id, backing)
                id = id or natural.legacy_id(natural.key(class, ref))
                local attrs = json.encode({external_ref=ref, retained={value="opaque"}})
                if backing ~= false then
                    scratch.exec("INSERT INTO kickside_components(component_id,impl_id) VALUES($1,'test:legacy')", {id})
                end
                scratch.exec("INSERT INTO kickside_thread(id,component_id,thread_class,attrs) VALUES($1,$2,$3,$4)", {id,id,class,attrs})
                return id
            end
            local valid = seed("legacy:é", " opaque:ref ")
            -- Cross the migration's page boundary.
            for i=1,260 do seed("legacy:batch", tostring(i)) end
            local edited = seed("edited", "ref", uuid.v7())
            local missing = seed("missing", "ref", nil, false)
            local collision = seed("conflict", "ref")
            local other = seed("other", "tuple", uuid.v7())
            local function binding(class, ref, id, stored_class, stored_ref)
                local key = natural.key(class, ref)
                local digest = scratch.postgres() and "decode('"..key.digest.."','hex')" or "X'"..key.digest.."'"
                scratch.exec("INSERT INTO kickside_thread_natural_key(key_digest,key_class,key_ref,thread_id,origin,ready) VALUES("..digest..",$1,$2,$3,'legacy',$4)",
                    {stored_class or class,stored_ref or ref,id,scratch.postgres() and true or 1})
            end
            binding("conflict", "ref", other, "other", "tuple")
            local tuple_conflict = seed("tuple-conflict", "ref")
            local tuple_owner = seed("mapped", "other", uuid.v7())
            binding("tuple-conflict", "ref", tuple_owner)
            local adopted = seed("already", "adopted")
            binding("already", "adopted", adopted)
            local bindings_before = scratch.query("SELECT * FROM kickside_thread_natural_key ORDER BY thread_id")
            scratch.exec("INSERT INTO kickside_event(id,thread_id,type,role,body,seq) VALUES($1,$2,'legacy','user','{}',1)", {uuid.v7(),valid})
            local before = scratch.query("SELECT * FROM kickside_thread ORDER BY id")
            local components = scratch.query("SELECT * FROM kickside_components ORDER BY component_id")
            local events = scratch.query("SELECT * FROM kickside_event ORDER BY id")
            local result, err = funcs.call("kickside.core.migrations:11_bind_legacy_natural_keys", {database_id="app:migration_db",id="test:legacy_binding"})
            test.is_nil(err)
            test.eq(result.status,"complete",tostring(result.error or (result.migrations and result.migrations[1].error)))
            test.eq(result.natural_keys.bound,261)
            test.eq(result.natural_keys.already_bound,3)
            test.eq(result.natural_keys.unverifiable,4)
            test.eq(result.natural_keys.reasons.legacy_natural_key_unverifiable,1)
            test.eq(result.natural_keys.reasons.legacy_natural_key_component_integrity,1)
            test.eq(result.natural_keys.reasons.natural_key_digest_collision,1)
            test.eq(result.natural_keys.reasons.natural_key_binding_collision,1)
            local rows = scratch.query("SELECT * FROM kickside_thread_natural_key WHERE thread_id=$1",{valid})
            test.eq(#rows,1)
            test.eq(rows[1].key_class,"legacy:é")
            test.eq(rows[1].key_ref," opaque:ref ")
            test.eq(rows[1].origin,"legacy")
            test.is_true(rows[1].ready == true or rows[1].ready == 1)
            for _,id in ipairs({edited,missing,collision,tuple_conflict}) do
                test.eq(#scratch.query("SELECT * FROM kickside_thread_natural_key WHERE thread_id=$1",{id}),0)
            end
            assert_rows(scratch.query("SELECT * FROM kickside_thread ORDER BY id"),before)
            assert_rows(scratch.query("SELECT * FROM kickside_components ORDER BY component_id"),components)
            assert_rows(scratch.query("SELECT * FROM kickside_event ORDER BY id"),events)
            assert_rows(scratch.query("SELECT * FROM kickside_thread_natural_key WHERE thread_id IN ($1,$2,$3) ORDER BY thread_id", {other,tuple_owner,adopted}),bindings_before)
            local skipped, skip_err = funcs.call("kickside.core.migrations:11_bind_legacy_natural_keys", {database_id="app:migration_db",id="test:legacy_binding"})
            test.is_nil(skip_err)
            test.eq(skipped.skipped,1)
            local replay, replay_err = funcs.call("kickside.core.migrations:11_bind_legacy_natural_keys", {database_id="app:migration_db",id="test:legacy_binding_reapply"})
            test.is_nil(replay_err)
            test.eq(replay.status,"complete",tostring(replay.error or (replay.migrations and replay.migrations[1].error)))
            test.eq(replay.natural_keys.bound,0)
            test.eq(replay.natural_keys.already_bound,264)
            test.eq(replay.natural_keys.unverifiable,4)
            scratch.drop()
        end)
    end)
end)
