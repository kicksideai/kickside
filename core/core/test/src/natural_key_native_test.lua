local test = require("test")
local natural = require("natural")
local fixture = require("fixture")
local sql = require("sql")
local key = natural.key("native", "reference")
local legacy = natural.legacy_id(key)
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "natural key guard requires an error"})) end
    return err
end
local function invoke(operation, dialect)
    local db = fixture.database()
    if operation == "lookup" then return natural.lookup(db, dialect, key) end
    if operation == "bind" then return nil, natural.bind(db, dialect, key, legacy, "legacy", true) end
    if operation == "capture" then return natural.capture(db, dialect, legacy, false) end
    if operation == "lock" then return nil, natural.lock(db, dialect, legacy) end
    if operation == "resolve" then return natural.resolve(db, key) end
    return nil, natural.mark_ready(db, legacy)
end
local function retains(actual: error, source: error): ()
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "natural_key_dependency")
        test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
return {run = test.run_cases(function()
    test.describe("native natural key persistence failures", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, path in ipairs({{operation = "lookup", stages = {"lookup"}},
                {operation = "bind", stages = {"write", "lookup"}},
                {operation = "capture", stages = {"mapped", "thread", "decode"}},
                {operation = "lock", stages = {"lock"}},
                {operation = "resolve", stages = {"dialect", "initial", "binding"}},
                {operation = "ready", stages = {"dialect", "write"}}}) do
                for _, stage in ipairs(path.stages) do
                    for _, kind in ipairs(kinds) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            test.it(path.operation .. "/" .. stage .. "/" .. dialect .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "natural key dependency refusal",
                                    details = {code = "natural_key_dependency", nested = {marker = "kept"}}})
                                fixture.reset(path.operation, stage, source, dialect, key, legacy)
                                local value, err = invoke(path.operation, dialect)
                                test.is_nil(value)
                                retains(required(err), source)
                                if path.operation == "resolve" then
                                    test.eq(fixture.writes, 0)
                                    test.eq(fixture.rollbacks, 0)
                                    test.eq(fixture.commits, 0)
                                end
                            end)
                        end
                    end
                end
                test.it("omitted details/" .. path.operation .. "/" .. dialect, function()
                    local source = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "dependency refusal"})
                    fixture.reset(path.operation, path.stages[1], source, dialect, key, legacy)
                    local _, err = invoke(path.operation, dialect)
                    retains(required(err), source)
                end)
            end
            test.it("successful natural key resolution/" .. dialect, function()
                fixture.reset("resolve", "", nil, dialect, key, legacy)
                local resolution, err = invoke("resolve", dialect)
                test.is_nil(err)
                test.eq(resolution.allocate_id, legacy)
                test.eq(resolution.origin, "legacy")
                test.eq(fixture.writes, 0)
                test.eq(fixture.commits, 0)
                test.eq(fixture.rollbacks, 0)
            end)
            test.it("selects v8 when the legacy id already belongs to another key/" .. dialect, function()
                fixture.reset("resolve_v2", "", nil, dialect, key, legacy)
                local resolution, err = invoke("resolve", dialect)
                test.is_nil(err)
                test.eq(resolution.allocate_id, natural.v8_id(key))
                test.eq(resolution.origin, "v2")
                test.eq(fixture.writes, 0)
                test.eq(fixture.commits, 0)
                test.eq(fixture.rollbacks, 0)
            end)
        end
    end)
end)}
