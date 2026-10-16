local test = require("test")
local reader = require("reader")
local fixture = require("fixture")
local sql = require("sql")
local routes = {
    {name = "get", stage = "query"}, {name = "gate", stage = "query"},
    {name = "prune", stage = "query"}, {name = "component", stage = "query"},
    {name = "list", stage = "query"}, {name = "classes", stage = "query"},
    {name = "events", stage = "query", fail_at = 2}, {name = "events", stage = "query", fail_at = 3},
    {name = "external", stage = "query", fail_at = 2}, {name = "children", stage = "query", fail_at = 2},
    {name = "edges", stage = "query", fail_at = 2}, {name = "children", stage = "type"},
    {name = "edges", stage = "type"}, {name = "get", stage = "decode"},
    {name = "loaded", stage = "decode"}, {name = "get", stage = "access"},
    {name = "list", stage = "scope"}, {name = "get", stage = "subject_shape"},
    {name = "get", stage = "subject_version"},
}
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
    errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(route: any): (any?, error?)
    local db = fixture.database()
    if route.name == "get" then return reader.get(db, "thread", "subject") end
    if route.name == "loaded" then return reader.get_loaded(fixture.row) end
    if route.name == "gate" then return reader.gate_read(db, "thread", 1) end
    if route.name == "prune" then return reader.prune_boundary(db, "thread") end
    if route.name == "component" then return reader.get_component_id(db, "thread") end
    if route.name == "list" then return reader.list(db, {}) end
    if route.name == "classes" then return reader.list_classes(db) end
    if route.name == "events" then return reader.list_events(db, "thread", {from_seq = 1, ascending = true}) end
    if route.name == "external" then return reader.find_event_by_external(db, "thread", "event", "source", "id", nil) end
    if route.name == "children" then return reader.list_children(db, "thread", 1) end
    return reader.list_edges(db, "thread", 1)
end
local function dependencies(first: integer, last: integer)
    for index = first, last do
        local route = routes[index]
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(route.name .. "/" .. route.stage .. "/" .. tostring(route.fail_at) .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "reader dependency refusal", retryable = options.retryable,
                        details = {code = "reader_dependency", nested = {operation = route.name, stage = route.stage}}})
                    fixture.reset(route, source)
                    local result, err = invoke(route)
                    test.is_nil(result)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "reader_dependency")
                    test.eq(err:details().nested.operation, route.name)
                    test.eq(err:details().nested.stage, route.stage)
                    test.eq(source:details().nested.operation, route.name)
                    if route.stage == "query" then test.eq(fixture.queries, route.fail_at or 1) end
                end)
            end
        end
    end
end
local function proofs()
    for _, route in ipairs({{name = "get", stage = "query", field = "thread.rows"},
        {name = "prune", stage = "query", field = "prune.rows"},
        {name = "component", stage = "query", field = "component.rows"},
        {name = "list", stage = "query", field = "list.rows"},
        {name = "classes", stage = "query", field = "classes.rows"},
        {name = "events", stage = "query", fail_at = 2, field = "events.rows"},
        {name = "events", stage = "query", fail_at = 3, field = "prune.rows"},
        {name = "external", stage = "query", fail_at = 2, field = "external.rows"},
        {name = "children", stage = "query", fail_at = 2, field = "children.rows"},
        {name = "edges", stage = "query", fail_at = 2, field = "edges.rows"},
        {name = "children", stage = "type", field = "database.type"},
        {name = "edges", stage = "type", field = "database.type"},
        {name = "get", stage = "decode", field = "attrs"},
        {name = "loaded", stage = "decode", field = "attrs"},
        {name = "list", stage = "scope", field = "component.ids"}}) do
        for _, proof in ipairs({{label = "missing"}, {label = "false", value = false}, {label = "number", value = 7}}) do
            test.it("missing successful response/" .. route.name .. "/" .. route.field .. "/" .. proof.label, function()
                fixture.reset(route, nil)
                fixture.missing, fixture.proof = true, proof.value
                local result, err = invoke(route)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "thread_reader_response")
                test.eq(err:details().field, route.field)
            end)
        end
    end
    for _, name in ipairs({"get", "loaded", "prune", "component", "list", "classes", "events", "external", "children", "edges"}) do
        test.it("valid read/" .. name, function()
            fixture.reset({stage = "", name = name}, nil)
            local result, err = invoke({name = name})
            test.is_nil(err)
            test.not_nil(result)
            if name == "get" or name == "loaded" then test.eq(type(result.attrs), "table") end
        end)
    end
    test.it("loaded hydration preserves the caller's source row", function()
        fixture.reset({stage = "decode"}, errors.new({kind = errors.INVALID, message = "decoder refusal", retryable = false,
            details = {code = "invalid_attrs"}}))
        local result, err = reader.get_loaded(fixture.row)
        test.is_nil(result)
        test.is_true(errors.is(err, errors.INVALID))
        test.eq(fixture.row.attrs, "{}")
    end)
    test.it("a real query returns an empty collection for an absent row", function()
        local db, err = sql.get("app:db")
        if err then error(err) end
        if not db then error(errors.new({kind = errors.INTERNAL, message = "test database is missing", retryable = false})) end
        local rows, query_err = db:query("SELECT id FROM kickside_thread WHERE 1=0")
        local _, release_err = db:release()
        test.is_nil(query_err)
        test.is_nil(release_err)
        test.eq(type(rows), "table")
        test.eq(#rows, 0)
    end)
    for _, name in ipairs({"component", "external", "list", "classes", "children", "edges"}) do
        test.it("legitimate absence stays empty/" .. name, function()
            local route: any = {name = name, stage = "query", fail_at = (name == "external" or name == "children" or name == "edges") and 2 or 1}
            fixture.reset(route, nil)
            fixture.missing, fixture.proof = true, {}
            local result, err = invoke(route)
            test.is_nil(err)
            if name == "component" or name == "external" then test.is_nil(result) else test.eq(#result, 0) end
        end)
    end
end
local function sdk()
    test.it("actual JSON decoder fields reach a loaded read", function()
        fixture.reset({stage = ""}, nil)
        fixture.row.attrs = "invalid JSON"
        local _, native = fixture.decode(fixture.row.attrs)
        test.eq(type(native), "userdata")
        if not native then error(errors.new({kind = errors.INTERNAL, message = "decoder refusal is missing", retryable = false})) end
        local result, err = reader.get_loaded(fixture.row)
        test.is_nil(result)
        test.eq(err:kind(), native:kind())
        test.eq(err:retryable(), native:retryable())
        test.eq(err:details(), native:details())
        test.eq(fixture.row.attrs, "invalid JSON")
    end)
    test.it("valid JSON scalar is a permanent attrs shape refusal", function()
        fixture.reset({stage = ""}, nil)
        fixture.row.attrs = "17"
        local result, err = reader.get_loaded(fixture.row)
        test.is_nil(result)
        test.is_true(errors.is(err, errors.INTERNAL))
        test.is_false(err:retryable())
        test.eq(err:details().code, "thread_reader_response")
        test.eq(err:details().field, "attrs")
        test.eq(fixture.row.attrs, "17")
    end)
    test.it("absent optional attrs retain their existing behavior", function()
        fixture.reset({stage = ""}, nil)
        fixture.row.attrs = nil
        local result, err = reader.get_loaded(fixture.row)
        test.is_nil(err)
        test.eq(type(result), "table")
        test.is_nil(result.attrs)
    end)
end
local function group(label: string, define: any): any
    return test.run_cases(function() test.describe(label, define) end)
end
return {
    run = group("native thread reads 1", function() dependencies(1, 6) end),
    run_dependencies_2 = group("native thread reads 2", function() dependencies(7, 12) end),
    run_dependencies_3 = group("native thread reads 3", function() dependencies(13, #routes) end),
    run_proofs = group("native thread read proofs", proofs),
    run_sdk = group("native thread read SDK", sdk),
}
