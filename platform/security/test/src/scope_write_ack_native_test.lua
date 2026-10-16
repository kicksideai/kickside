local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local registry = require("registry")
local funcs = require("funcs")
local scopes = require("scopes")
local ack_probe = require("ack_probe")

local function define_tests()
    test.describe("native scope write acknowledgements", function()
        test.it("reports commit state without changing the successful row or precommit failure", function()
            local slug = "native_ack_state_" .. uuid.v7():gsub("-", "")
            local row, err, committed = scopes.upsert({slug = slug, policies = {}}, "native-ack-actor")
            local ok, failure = pcall(function()
                test.is_nil(err)
                test.not_nil(row)
                test.eq(row.slug, slug)
                test.eq(committed, true)
                local invalid, validation_err, validation_committed = scopes.upsert({slug = false}, "native-ack-actor")
                test.is_nil(invalid)
                test.is_true(errors.is(validation_err, errors.INVALID))
                test.eq(validation_err:retryable(), false)
                test.is_nil(validation_committed)
            end)
            test.is_true(assert(scopes.delete(slug)))
            if not ok then error(failure) end
        end)
        for _, state in ipairs({"missing", "corrupt", "reader"}) do
        for _, boundary in ipairs({"library", "funcs retry"}) do
            test.it("reports a native " .. state .. " acknowledgement without replaying a committed write through " .. boundary, function()
                local db = assert(sql.get("app:db"))
                local suffix = uuid.v7():gsub("-", "")
                local slug = "native_ack_" .. suffix
                local trigger = "native_ack_" .. suffix
                local effects = "native_ack_effects_" .. suffix
                test.is_nil(select(2, db:execute("CREATE TABLE " .. effects .. " (marker TEXT)")))
                local mutation = state == "reader" and "" or state == "missing" and "DELETE FROM kickside_security_scopes WHERE slug=NEW.slug;"
                    or "UPDATE kickside_security_scopes SET policies='{' WHERE slug=NEW.slug;"
                local postgres = assert(registry.get("app:db")).kind == "db.sql.postgres"
                if postgres then
                    test.is_nil(select(2, db:execute("CREATE FUNCTION " .. trigger .. [[() RETURNS trigger LANGUAGE plpgsql AS $ack$
                        BEGIN IF NEW.slug = ']] .. slug .. [[' THEN
                        INSERT INTO ]] .. effects .. [[ (marker) VALUES ('attempt');
                        ]] .. mutation .. [[
                        END IF; RETURN NEW; END; $ack$]])))
                    test.is_nil(select(2, db:execute("CREATE TRIGGER " .. trigger ..
                        (state == "reader" and " AFTER INSERT OR UPDATE" or " AFTER INSERT") .. " ON kickside_security_scopes FOR EACH ROW EXECUTE FUNCTION " .. trigger .. "()")))
                else
                    test.is_nil(select(2, db:execute("CREATE TRIGGER " .. trigger ..
                        " AFTER INSERT ON kickside_security_scopes WHEN NEW.slug='" .. slug ..
                        "' BEGIN INSERT INTO " .. effects .. " (marker) VALUES ('attempt'); " .. mutation .. " END")))
                    if state == "reader" then
                        test.is_nil(select(2, db:execute("CREATE TRIGGER " .. trigger .. "_update" ..
                            " AFTER UPDATE ON kickside_security_scopes WHEN NEW.slug='" .. slug ..
                            "' BEGIN INSERT INTO " .. effects .. " (marker) VALUES ('attempt'); END")))
                    end
                end
                local ok, failure = pcall(function()
                    local row, err
                    if boundary == "library" then
                        row, err = ack_probe.run({slug = slug, policies = {}, reader_failure = state == "reader"})
                    else
                        local executor = funcs.new():with_options({retry = {max_attempts = 3, initial_delay = 1, jitter = 0}})
                        row, err = executor:call("app:scope_write_ack_probe", {slug = slug, policies = {}, reader_failure = state == "reader"})
                    end
                    local recorded = assert(db:query("SELECT marker FROM " .. effects))
                    if state == "reader" then
                        print("acknowledgement reader durable effects: " .. tostring(#recorded))
                    end
                    test.eq(#recorded, 1)
                    test.is_nil(row)
                    test.is_true(errors.is(err, state == "missing" and errors.CONFLICT or state == "reader" and errors.UNAVAILABLE or errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, state == "missing" and "scope_write_conflict" or state == "reader" and "ack_reader" or "persisted_data")
                    local rows = assert(db:query("SELECT policies FROM kickside_security_scopes WHERE slug=$1", {slug}))
                    if state == "missing" then
                        test.eq(#rows, 0)
                    elseif state == "reader" then
                        test.eq(rows[1].policies, "[]")
                        local cause = err:details().cause
                        test.eq(cause.kind, errors.UNAVAILABLE)
                        test.eq(cause.message, "acknowledgement reader unavailable")
                        test.eq(cause.retryable, true)
                        test.eq(cause.details.code, "ack_reader")
                        test.eq(cause.details.nested.marker, "retained")
                        test.eq(cause.details.cause.marker, "original cause")
                        test.eq(err:details().nested.marker, "retained")
                    else
                        test.eq(rows[1].policies, "{")
                        local _, source_err = scopes.get(slug)
                        local cause = err:details().cause
                        test.eq(cause.kind, source_err:kind())
                        test.eq(cause.message, source_err:message())
                        test.eq(cause.retryable, source_err:retryable())
                        test.eq(cause.details.code, source_err:details().code)
                        test.eq(cause.details.field, source_err:details().field)
                    end
                end)
                test.is_nil(select(2, db:execute("DROP TRIGGER " .. trigger .. (postgres and " ON kickside_security_scopes" or ""))))
                if state == "reader" and not postgres then
                    test.is_nil(select(2, db:execute("DROP TRIGGER " .. trigger .. "_update")))
                end
                if postgres then test.is_nil(select(2, db:execute("DROP FUNCTION " .. trigger .. "()"))) end
                test.is_nil(select(2, db:execute("DELETE FROM kickside_security_scopes WHERE slug=$1", {slug})))
                test.is_nil(select(2, db:execute("DROP TABLE " .. effects)))
                db:release()
                if not ok then error(failure) end
            end)
        end
        end
    end)
end
return {run = test.run_cases(define_tests)}
