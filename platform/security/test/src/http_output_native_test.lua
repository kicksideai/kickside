local test = require("test")
local funcs = require("funcs")
local uuid = require("uuid")
local scopes = require("scopes")
local reconcile = require("reconcile")
local probe = require("probe")
local channel = require("channel")
local time = require("time")
local sql = require("sql")
local registry = require("registry")

local spawned: string?

local function start_projector()
    local pid, err = process.spawn_monitored("kickside.security.service:scope_projection_proc", "app:processes", {})
    test.is_nil(err)
    if type(pid) ~= "string" then error("projector pid is required") end
    spawned = pid
    local replies = process.listen("native.output.ready")
    local sent, send_err = process.send(pid, "reconcile", {reply_pid = process.pid(), reply_topic = "native.output.ready"})
    test.is_nil(send_err)
    test.is_true(sent)
    local timer = time.after("5s")
    local selected = channel.select({replies:case_receive(), timer:case_receive()})
    process.unlisten(replies)
    test.is_false(selected.channel == timer, "projector becomes ready before output tests")
    test.is_true(selected.value.success)
end

local function stop_projector()
    if not spawned then return end
    local pid = spawned
    local canceled, err = process.cancel(pid)
    test.is_nil(err)
    test.is_true(canceled)
    local events = process.events()
    local timer = time.after("5s")
    while true do
        local selected = channel.select({events:case_receive(), timer:case_receive()})
        test.is_false(selected.channel == timer, "owned projector stops after output tests")
        local event = selected.value
        if event.kind == process.event.EXIT and event.from == pid then
            test.is_nil(event.result.error)
            break
        end
    end
    spawned = nil
end

local function define_tests()
    test.describe("native Security HTTP output errors", function()
        test.before_each(start_projector)
        test.after_each(stop_projector)
        test.it("does not replay committed scope writes after a retryable output failure", function()
            local suffix = uuid.v7():gsub("-", "")
            local slug = "native_output_" .. suffix
            local effects = "native_output_effects_" .. suffix
            local trigger = "native_output_" .. suffix
            local db = assert(sql.get("app:db"))
            test.is_nil(select(2, db:execute("CREATE TABLE " .. effects .. " (marker TEXT)")))
            local postgres = assert(registry.get("app:db")).kind == "db.sql.postgres"
            if postgres then
                test.is_nil(select(2, db:execute("CREATE FUNCTION " .. trigger .. [[() RETURNS trigger LANGUAGE plpgsql AS $output$
                    BEGIN IF NEW.slug = ']] .. slug .. [[' THEN
                    INSERT INTO ]] .. effects .. [[ (marker) VALUES ('attempt');
                    END IF; RETURN NEW; END; $output$]])))
                test.is_nil(select(2, db:execute("CREATE TRIGGER " .. trigger ..
                    " AFTER INSERT OR UPDATE ON kickside_security_scopes FOR EACH ROW EXECUTE FUNCTION " .. trigger .. "()")))
            else
                for _, event in ipairs({"INSERT", "UPDATE"}) do
                    test.is_nil(select(2, db:execute("CREATE TRIGGER " .. trigger .. "_" .. event ..
                        " AFTER " .. event .. " ON kickside_security_scopes WHEN NEW.slug='" .. slug ..
                        "' BEGIN INSERT INTO " .. effects .. " (marker) VALUES ('attempt'); END")))
                end
            end
            local ok, failure = pcall(function()
                local executor = funcs.new():with_options({retry = {max_attempts = 3, initial_delay = 1, jitter = 0}})
                local result, err = executor:call("app:http_output_native_probe",
                    {handler = "save_scope", stage = "json", slug = slug, retryable = true})
                local recorded = assert(db:query("SELECT marker FROM " .. effects))
                test.eq(#recorded, 1)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "http_output_dependency")
                test.eq(err:details().cause.kind, errors.UNAVAILABLE)
                test.eq(err:details().cause.retryable, true)
                test.eq(err:details().cause.details.nested.marker, "retained")
                test.not_nil(assert(scopes.get(slug)))
            end)
            if postgres then
                test.is_nil(select(2, db:execute("DROP TRIGGER " .. trigger .. " ON kickside_security_scopes")))
                test.is_nil(select(2, db:execute("DROP FUNCTION " .. trigger .. "()")))
            else
                for _, event in ipairs({"INSERT", "UPDATE"}) do
                    test.is_nil(select(2, db:execute("DROP TRIGGER " .. trigger .. "_" .. event)))
                end
            end
            test.is_nil(select(2, db:execute("DROP TABLE " .. effects)))
            db:release()
            test.is_true(assert(scopes.delete(slug)))
            test.not_nil(assert(reconcile.trigger({slug = slug})))
            if not ok then error(failure) end
        end)
        for _, handler in ipairs({"list_scopes", "list_policies", "save_scope", "delete_scope"}) do
            for _, stage in ipairs({"header", "status", "json"}) do
                for _, boundary in ipairs({"library", "funcs"}) do
                    test.it("retains " .. handler .. " " .. stage .. " failure through " .. boundary, function()
                        local slug = "native_output_" .. uuid.v7():gsub("-", "")
                        if handler == "delete_scope" then
                            test.not_nil(assert(scopes.upsert({slug = slug, policies = {}}, "native-output-actor")))
                        end
                        local ok, failure = pcall(function()
                            local args = {handler = handler, stage = stage, slug = slug}
                            local result, err, counts
                            if boundary == "library" then
                                result, err, counts = probe.run(args)
                            else
                                local executor = funcs.new():with_options({retry = {max_attempts = 3, initial_delay = 1, jitter = 0}})
                                result, err = executor:call("app:http_output_native_probe", args)
                            end
                            test.is_nil(result)
                            test.is_true(errors.is(err, errors.RATE_LIMITED))
                            test.eq(err:retryable(), false)
                            test.eq(err:details().code, "http_output_dependency")
                            test.eq(err:details().stage, stage)
                            test.eq(err:details().nested.marker, "retained")
                            if counts then
                                test.eq(counts.headers, 1)
                                test.eq(counts.statuses, stage == "header" and 0 or 1)
                                test.eq(counts.writes, stage == "json" and 1 or 0)
                            end
                            local row, read_err = scopes.get(slug)
                            test.is_nil(read_err)
                            if handler == "save_scope" then
                                if stage == "header" then test.is_nil(row) else test.not_nil(row) end
                            elseif handler == "delete_scope" then
                                if stage == "header" then test.not_nil(row) else test.is_nil(row) end
                            else
                                test.is_nil(row)
                            end
                        end)
                        test.is_true(assert(scopes.delete(slug)))
                        test.not_nil(assert(reconcile.trigger({slug = slug})))
                        if not ok then error(failure) end
                    end)
                end
            end
        end
    end)
end
return {run = test.run_cases(define_tests)}
