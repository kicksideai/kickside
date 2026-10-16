local test = require("test")
local child = require("child")
local child_fixture = require("child_fixture")
local heartbeat = require("heartbeat")
local heartbeat_fixture = require("heartbeat_fixture")
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "release guard requires failure"})) end
    return err
end
return {run = test.run_cases(function()
    test.describe("native Jobs database release causes", function()
        local paths = {{route = "child", stage = ""}, {route = "child", stage = "dialect"}, {route = "child", stage = "lease"},
            {route = "child", stage = "settle_dialect", release_at = 2}, {route = "child", stage = "fence", release_at = 2},
            {route = "heartbeat", stage = ""}, {route = "heartbeat", stage = "dialect"}, {route = "heartbeat", stage = "update"}}
        for _, path in ipairs(paths) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(path.route .. "/" .. path.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "release refusal", retryable = options.retryable,
                            details = {code = "release_dependency", nested = {marker = "kept"}}})
                        local primary: error? = nil
                        if path.stage ~= "" then primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                            message = "operation denied", details = {code = "operation_refusal", nested = {stage = path.stage}}}) end
                        local actual: error? = nil
                        if path.route == "child" then
                            child_fixture.reset(path.stage, primary); child_fixture.release_error, child_fixture.release_at = source, path.release_at or 1
                            actual = select(1, child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1}))
                            test.eq(child_fixture.spawns, path.stage == "fence" and 1 or 0)
                        else
                            heartbeat_fixture.reset("main", path.stage, primary, "sqlite"); heartbeat_fixture.release_error = source
                            local ok, err = pcall(heartbeat.main, {worker_id = "worker", registry_version = "version"})
                            test.is_false(ok); actual = err; test.eq(heartbeat_fixture.releases, 1)
                        end
                        local cause = required(actual)
                        test.eq(cause:kind(), source:kind()); test.eq(cause:retryable(), source:retryable())
                        test.eq(cause:details().code, "release_dependency"); test.eq(cause:details().nested.marker, "kept")
                        if primary then
                            local encoded = cause:details().operation_error
                            test.eq(encoded.kind, primary:kind()); test.eq(encoded.retryable, false)
                            test.eq(encoded.details.code, "operation_refusal"); test.eq(encoded.details.nested.stage, path.stage)
                        end
                        test.eq(source:details().nested.marker, "kept")
                    end)
                end
            end
        end
        test.it("successful child and heartbeat release remain", function()
            child_fixture.reset("", nil)
            local err = select(1, child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1}))
            test.is_nil(err); test.eq(child_fixture.spawns, 1); test.eq(child_fixture.releases, 1)
            heartbeat_fixture.reset("main", "", nil, "sqlite")
            heartbeat.main({worker_id = "worker", registry_version = "version"}); test.eq(heartbeat_fixture.releases, 1)
        end)
    end)
end)}
