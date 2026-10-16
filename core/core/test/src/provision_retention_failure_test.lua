local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local provision = require("provision")
local autoinit = require("autoinit")

local function define_tests()
    test.describe("provisioned retention failure", function()
        test.it("reports a failed retention write and converges on retry without changing the thread identity", function()
            local owner = "retention-" .. uuid.v7()
            local actor = security.new_actor(owner, { security_groups = {} })
            local scope, scope_err = security.named_scope("wippy.security:process")
            test.is_nil(scope_err)
            local initial, initial_err = provision.ensure_user(actor, scope, owner)
            test.is_nil(initial_err)
            local id = autoinit.component_id(owner, "test_ws")
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local dialect = tostring(db:type())
            local _, seed_err = db:execute("UPDATE kickside_retention_policy SET event_hot_retention_days=90 WHERE thread_id=$1", { id })
            test.is_nil(seed_err)
            if dialect == sql.type.POSTGRES then
                local _, fn_err = db:execute("CREATE FUNCTION audit_retention_refusal() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.thread_id = '" .. id .. "' THEN RAISE EXCEPTION 'audit retention refusal'; END IF; RETURN NEW; END $$")
                test.is_nil(fn_err)
                local _, trigger_err = db:execute("CREATE TRIGGER audit_retention_refusal BEFORE UPDATE ON kickside_retention_policy FOR EACH ROW EXECUTE FUNCTION audit_retention_refusal()")
                test.is_nil(trigger_err)
            else
                local _, trigger_err = db:execute("CREATE TRIGGER audit_retention_refusal BEFORE UPDATE ON kickside_retention_policy WHEN NEW.thread_id='" .. id .. "' BEGIN SELECT RAISE(ABORT, 'audit retention refusal'); END")
                test.is_nil(trigger_err)
            end
            local _, source_err = db:execute("UPDATE kickside_retention_policy SET event_hot_retention_days=7 WHERE thread_id=$1", { id })
            db:release()
            test.eq(type(source_err), "userdata")
            local reported, reported_err = provision.ensure_user(actor, scope, owner)
            db = assert(sql.get("app:db"))
            local failed_policy, read_err = db:query("SELECT event_hot_retention_days FROM kickside_retention_policy WHERE thread_id=$1", { id })
            local _, drop_err = db:execute(dialect == sql.type.POSTGRES
                and "DROP TRIGGER audit_retention_refusal ON kickside_retention_policy" or "DROP TRIGGER audit_retention_refusal")
            if dialect == sql.type.POSTGRES then
                local _, fn_drop_err = db:execute("DROP FUNCTION audit_retention_refusal()")
                test.is_nil(fn_drop_err)
            end
            db:release()
            test.is_nil(drop_err)
            test.is_nil(read_err)
            test.is_nil(reported)
            test.eq(type(reported_err), "userdata")
            test.eq(reported_err:kind(), source_err:kind())
            test.eq(reported_err:retryable(), source_err:retryable())
            local source_details, reported_details = source_err:details(), reported_err:details()
            test.eq(type(reported_details), type(source_details))
            if source_details then
                for key, value in pairs(source_details) do test.eq(reported_details[key], value) end
                for key, value in pairs(reported_details) do test.eq(value, source_details[key]) end
            end
            test.eq(tonumber(failed_policy[1].event_hot_retention_days), 90)
            local resumed, resume_err = provision.ensure_user(actor, scope, owner)
            test.is_nil(resume_err)
            test.eq(#resumed, #initial)
            db = assert(sql.get("app:db"))
            local rows, verify_err = db:query("SELECT event_hot_retention_days FROM kickside_retention_policy WHERE thread_id=$1", { id })
            db:release()
            test.is_nil(verify_err)
            test.eq(tonumber(rows[1].event_hot_retention_days), 7)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
