local test = require("test")
local sql = require("sql")
local reader = require("reader")
local fixture = require("fixture")
local routes = {
    {name = "list_projections", stage = "query", fail_at = 1},
    {name = "get_projection", stage = "query", fail_at = 1},
    {name = "list_cursors", stage = "query", fail_at = 1},
    {name = "cursor_anchor", stage = "query", fail_at = 2},
    {name = "find_projection_cursor", stage = "query", fail_at = 1},
    {name = "select_projection_cursor", stage = "query", fail_at = 1},
    {name = "selected_cursor", stage = "query", fail_at = 2, first_rows = {{id = "projection"}}},
    {name = "find_id", stage = "type", fail_at = 1},
    {name = "find_key", stage = "type", fail_at = 1},
    {name = "find_id", stage = "query", fail_at = 1},
    {name = "find_key", stage = "query", fail_at = 1},
}
local function invoke(route: any, db: any): (any?, error?)
    if route.name == "list_projections" then return reader.list_projections(db, "thread", 2, {kind = "model", projection_key = "default"}) end
    if route.name == "get_projection" then return reader.get_projection(db, "thread", "projection") end
    if route.name == "list_cursors" then return reader.list_cursors(db, "thread", 2, nil) end
    if route.name == "cursor_anchor" then return reader.list_cursors(db, "thread", 2, {id = "cursor"}) end
    if route.name == "find_projection_cursor" then return reader.find_projection_cursor(db, "thread", {kind = "model"}) end
    if route.name == "find_id" then return reader.find_cursor(db, "thread", {cursor_id = "cursor"}) end
    if route.name == "find_key" then return reader.find_cursor(db, "thread", {kind = "model"}) end
    return reader.select_projection_cursor(db, "thread", {kind = "model", projection_key = "default", cursor_key = "default"})
end
return {run = test.run_cases(function()
    test.describe("native projection reader dependencies", function()
        for _, route in ipairs(routes) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route.name .. "/" .. route.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local db, open_err = sql.get("app:db")
                        if open_err then error(open_err) end
                        if not db then error(errors.new({kind = errors.INTERNAL, message = "reader guard has no database", retryable = false})) end
                        local source = errors.new({kind = kind, message = "projection reader dependency refusal", retryable = options.retryable,
                            details = {code = "projection_reader_dependency", nested = {route = route.name, stage = route.stage}}})
                        fixture.reset(db, route.stage, source, route.fail_at, route.first_rows or {})
                        local result, err = invoke(route, fixture.database())
                        db:release()
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "projection_reader_dependency")
                        test.eq(err:details().nested.route, route.name)
                        test.eq(err:details().nested.stage, route.stage)
                        test.eq(fixture.queries, route.stage == "type" and 0 or route.fail_at)
                        test.eq(fixture.dialects, (route.name == "find_id" or route.name == "find_key") and 1 or 0)
                        test.eq(source:details().nested.route, route.name)
                    end)
                end
            end
        end
    end)
end)}
