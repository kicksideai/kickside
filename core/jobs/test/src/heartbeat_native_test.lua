local test = require("test")
local heartbeat = require("heartbeat")
local fixture = require("fixture")
local sql = require("sql")
local function invoke(operation)
    if operation == "mark" then return nil, heartbeat.mark(fixture.database(), fixture.dialect, "worker", "version") end
    if operation == "pulse" then return nil, heartbeat.pulse(fixture.database(), fixture.dialect, "worker", "version") end
    if operation == "start" then return heartbeat.start("worker", "version", "1s") end
    local ok, err = pcall(heartbeat.main, {worker_id = "worker", registry_version = "version", interval = "1s"})
    test.is_false(ok)
    return nil, err
end
local function preserves(err: error?, source: error)
    if not err then
        error(errors.new({kind = errors.INTERNAL, retryable = false, message = "heartbeat test expects an error"}))
    end
    test.eq(err:kind(), source:kind())
    test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, "heartbeat_dependency")
    test.eq(err:details().nested.marker, "kept")
end
local paths = {{operation = "mark", stages = {"begin", "worker", "registration", "commit"}},
    {operation = "pulse", stages = {"update"}}, {operation = "start", stages = {"spawn"}},
    {operation = "main", stages = {"database", "dialect", "update"}}}
return {run = test.run_cases(function()
    test.describe("native worker heartbeat failures", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, path in ipairs(paths) do
                for _, stage in ipairs(path.stages) do
                    for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                        errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                        errors.RATE_LIMITED, errors.UNKNOWN}) do
                        for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            test.it(path.operation .. "/" .. stage .. "/" .. dialect .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                                local source = errors.new({kind = kind, message = "heartbeat dependency refusal", retryable = options.retryable,
                                    details = {code = "heartbeat_dependency", nested = {marker = "kept"}}})
                                fixture.reset(path.operation, stage, source, dialect)
                                local value, err = invoke(path.operation)
                                test.is_nil(value)
                                preserves(err, source)
                                test.eq(source:details().nested.marker, "kept")
                                if stage == "worker" or stage == "registration" then
                                    test.eq(fixture.rollbacks, 1)
                                    test.eq(fixture.commits, 0)
                                end
                                if path.operation == "main" then test.eq(fixture.releases, stage == "database" and 0 or 1) end
                            end)
                        end
                    end
                end
            end
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                test.it("rollback/" .. dialect .. "/" .. kind, function()
                    local source = errors.new({kind = kind, message = "rollback refusal", retryable = false,
                        details = {code = "heartbeat_dependency", nested = {marker = "kept"}}})
                    local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "registration refusal", retryable = false,
                        details = {code = "registration_refusal", nested = {operation = "worker"}}})
                    fixture.reset("mark", "rollback", source, dialect)
                    fixture.primary = primary
                    local value, err = invoke("mark")
                    test.is_nil(value)
                    preserves(err, source)
                    local encoded = err:details().operation_error
                    test.eq(encoded.kind, primary:kind())
                    test.eq(encoded.retryable, primary:retryable())
                    test.eq(encoded.details.code, "registration_refusal")
                    test.eq(encoded.details.nested.operation, "worker")
                    test.eq(fixture.rollbacks, 1)
                    test.eq(fixture.commits, 0)
                end)
            end
        end
    end)
    test.describe("worker heartbeat dependency response proofs", function()
        for _, case in ipairs({{operation = "mark", stage = "begin", field = "transaction"},
            {operation = "mark", stage = "worker", field = "worker.rows_affected"},
            {operation = "mark", stage = "registration", field = "pulse.rows_affected"},
            {operation = "pulse", stage = "update", field = "pulse.rows_affected"},
            {operation = "start", stage = "spawn", field = "process.id"},
            {operation = "main", stage = "database", field = "database"},
            {operation = "main", stage = "dialect", field = "database.type"}}) do
            test.it(case.operation .. "/" .. case.stage .. "/missing", function()
                fixture.reset(case.operation, case.stage, nil, sql.type.SQLITE)
                fixture.missing = true
                local value, err = invoke(case.operation)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "job_heartbeat_response")
                test.eq(err:details().field, case.field)
            end)
        end
        for _, proof in ipairs({{rows_affected = -1}, {rows_affected = 0.5}, {rows_affected = 2}, {rows_affected = "bad"}, {}}) do
            test.it("invalid pulse count/" .. tostring(proof.rows_affected), function()
                fixture.reset("pulse", "update", nil, sql.type.SQLITE)
                fixture.missing, fixture.proof = true, proof
                local value, err = invoke("pulse")
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "job_heartbeat_response")
                test.eq(err:details().field, "pulse.rows_affected")
            end)
        end
        test.it("real zero pulse rows retain permanent NotFound", function()
            fixture.reset("pulse", nil, nil, sql.type.SQLITE)
            fixture.count = 0
            local _, err = invoke("pulse")
            test.is_true(errors.is(err, errors.NOT_FOUND))
            test.is_false(err:retryable())
        end)
        test.it("missing worker identity raises permanent Invalid", function()
            fixture.reset("main", nil, nil, sql.type.SQLITE)
            local ok, err = pcall(heartbeat.main, {})
            test.is_false(ok)
            test.is_true(errors.is(err, errors.INVALID))
            test.is_false(err:retryable())
        end)
        for _, operation in ipairs({"mark", "pulse", "start", "main"}) do
            test.it("successful boundary/" .. operation, function()
                fixture.reset(operation, nil, nil, sql.type.SQLITE)
                if operation == "main" then
                    heartbeat.main({worker_id = "worker", registry_version = "version"})
                    test.eq(fixture.releases, 1)
                else
                    local value, err = invoke(operation)
                    test.is_nil(err)
                    if operation == "start" then test.eq(value, "heartbeat-process") end
                    if operation == "mark" then test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0) end
                end
            end)
        end
    end)
end)}
