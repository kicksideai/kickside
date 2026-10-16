local test = require("test")
local worker_pool = require("worker_pool")
local sql = require("sql")
local process = require("process")
local function exercise(stage: string, source: error, dialect: string)
    local calls = {release = 0, close = 0, unlisten = 0, unregister = 0}
    local events_ch = {case_receive = function(self) return self end}
    local pool = worker_pool.new({
        sql_get = function()
            if stage == "database" then return nil, source end
            return {type = function()
                if stage == "dialect" then return nil, source end
                return dialect, nil
            end, release = function() calls.release = calls.release + 1 end}, nil
        end,
        policy = function()
            if stage == "policy" then return nil, source end
            return {worker_count_sqlite = 1, worker_count_postgres = 1, worker_awaited_slots = 1}, nil
        end,
        process = {event = process.event, pid = function() return "pool-probe" end,
            events = function() return events_ch end, set_options = function() end,
            listen = function() return events_ch end,
            unlisten = function() calls.unlisten = calls.unlisten + 1 end,
            registry = {register = function()
                if stage == "registration" then return nil, source end
                return true, nil
            end, lookup = function() return nil, source end,
                unregister = function() calls.unregister = calls.unregister + 1; return true, nil end}},
        registry = {current_version = function() return nil, source end},
        events = {subscribe = function()
            if stage == "subscription" then return nil, source end
            return {channel = function() return events_ch end,
                close = function() calls.close = calls.close + 1 end}, nil
        end},
    })
    local result, err
    if stage == "database" or stage == "dialect" or stage == "policy" then result, err = pool.detect_size()
    else result, err = pool.main() end
    test.is_nil(result)
    test.eq(calls.release, (stage == "dialect" or stage == "policy") and 1 or 0)
    test.eq(calls.close, (stage == "registration" or stage == "version") and 1 or 0)
    test.eq(calls.unlisten, (stage == "registration" or stage == "version") and 2 or 0)
    test.eq(calls.unregister, stage == "version" and 1 or 0)
    return err
end
return {run = test.run_cases(function()
    test.describe("native pool startup and capacity failures", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, stage in ipairs({"database", "dialect", "policy", "subscription", "registration", "version"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                    errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(dialect .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "pool dependency refusal", retryable = options.retryable,
                                details = {code = "pool_boundary_dependency", nested = {stage = stage}}})
                            local err = exercise(stage, source, dialect)
                            test.not_nil(err)
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "pool_boundary_dependency")
                            test.eq(err:details().nested.stage, stage)
                            test.eq(source:details().nested.stage, stage)
                        end)
                    end
                end
                test.it("absent details/" .. stage .. "/" .. dialect, function()
                    local source = errors.new({kind = errors.UNAVAILABLE, message = "pool dependency refusal", retryable = false})
                    local err = exercise(stage, source, dialect)
                    test.not_nil(err)
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.is_nil(err:details())
                end)
            end
        end
    end)
end)}
