local test = require("test")
local subjects = require("subjects")
local function executor(rows: any, err: error?): any
    return {query = function(_self: any, _statement: any, _args: any): (any, error?) return rows, err end}
end
local function call(mode: string, rows: any, err: error?): (any, error?)
    local tx = executor(rows, err)
    if mode == "version" then return subjects.version(tx, "thread", "subject") end
    return nil, subjects.check(tx, "thread", 1, {subject = "subject", version = 1})
end
local function define()
    for _, mode in ipairs({"version", "check"}) do
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(mode .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "subject read refusal", retryable = options.retryable,
                        details = {code = "subject_dependency", nested = {version = "kept"}}})
                    local value, err = call(mode, nil, source)
                    test.is_nil(value)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "subject_dependency")
                    test.eq(err:details().nested.version, "kept")
                    test.eq(source:details().nested.version, "kept")
                end)
            end
        end
        for _, proof in ipairs({{label = "missing rows", field = "rows"},
            {label = "false rows", value = false, field = "rows"},
            {label = "number rows", value = 7, field = "rows"},
            {label = "scalar row", value = {7}, field = "version"},
            {label = "missing version", value = {{}}, field = "version"},
            {label = "false version", value = {{version = false}}, field = "version"},
            {label = "invalid version", value = {{version = "invalid"}}, field = "version"},
            {label = "negative version", value = {{version = -1}}, field = "version"},
            {label = "fractional version", value = {{version = 0.5}}, field = "version"},
            {label = "table version", value = {{version = {}}}, field = "version"},
            {label = "infinite version", value = {{version = math.huge}}, field = "version"}}) do
            test.it("malformed response/" .. mode .. "/" .. proof.label, function()
                local value, err = call(mode, proof.value, nil)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "subject_version_response")
                test.eq(err:details().field, proof.field)
            end)
        end
    end
    for _, valid in ipairs({{label = "absent", rows = {}, expected = 0},
        {label = "zero", rows = {{version = 0}}, expected = 0},
        {label = "integer", rows = {{version = 23}}, expected = 23},
        {label = "numeric text", rows = {{version = "23"}}, expected = 23}}) do
        test.it("valid version/" .. valid.label, function()
            local value, err = subjects.version(executor(valid.rows, nil), "thread", "subject")
            test.is_nil(err)
            test.eq(value, valid.expected)
        end)
    end
    test.it("retains permanent mismatch fields", function()
        local err = subjects.check(executor({{version = 23}}, nil), "thread", 1, {subject = "subject", version = 1})
        test.is_true(errors.is(err, errors.CONFLICT))
        test.is_false(err:retryable())
        test.eq(err:details().reason, "version_mismatch")
        test.eq(err:details().subject, "subject")
        test.eq(err:details().version, 23)
        test.eq(err:details().expected, 1)
    end)
    test.it("accepts matching subject and head", function()
        test.is_nil(subjects.check(executor({{version = 1}}, nil), "thread", 1, {subject = "subject", version = 1, head = 1}))
    end)
    test.it("retains optional absence and head-only checks", function()
        test.is_nil(subjects.check(executor(nil, nil), "thread", 1, nil))
        test.is_nil(subjects.check(executor(nil, nil), "thread", 1, {head = 1}))
        local err = subjects.check(executor(nil, nil), "thread", 2, {head = 1})
        test.is_true(errors.is(err, errors.CONFLICT))
        test.is_false(err:retryable())
        test.eq(err:details().reason, "head_mismatch")
        test.eq(err:details().head, 2)
        test.eq(err:details().expected_head, 1)
    end)
end
return {run = test.run_cases(function() test.describe("native subject versions", define) end)}
