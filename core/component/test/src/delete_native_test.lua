local test = require("test")
local ops = require("ops")
local fixture = require("fixture")
local sql = require("sql")
local routes = {"tree", "children", "lock", "owner_delete_1", "owner_delete_2", "owner_delete_3", "owner_delete_4",
    "owner_read_1", "owner_read_2", "owner_read_3", "owner_read_4", "parent", "dialect", "paths", "path_write",
    "relink", "detach", "more_children", "unlink", "delete"}
local function call(): (any, error?)
    local tx = fixture.transaction()
    return ops.delete_component(tx, tx, {type = "DELETE_COMPONENT", payload = {component_id = "parent", child_policy = "reparent_root"}})
end
local function dependencies(first: integer, last: integer)
    for index = first, last do
        local stage = routes[index]
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. dialect .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "deletion dependency refusal", retryable = options.retryable,
                            details = {code = "delete_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, dialect)
                        local value, err = call()
                        test.is_nil(value)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "delete_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(source:details().nested.stage, stage)
                        if stage == "tree" or stage == "children" then test.eq(fixture.writes, 0) end
                    end)
                end
            end
        end
    end
end
local function proofs()
    local fields = {children = "children.rows", lock = "component.lock", owner_delete_1 = "owner.delete",
        owner_delete_2 = "owner.delete", owner_delete_3 = "owner.delete", owner_delete_4 = "owner.delete",
        owner_read_1 = "owner.rows", owner_read_2 = "owner.rows", owner_read_3 = "owner.rows", owner_read_4 = "owner.rows",
        parent = "parent", dialect = "database.type", paths = "child.paths", path_write = "child.path_update",
        detach = "child.detach", more_children = "children.remaining", delete = "component.delete"}
    for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
        for _, stage in ipairs(routes) do
            if fields[stage] then
                for _, proof in ipairs({{name = "missing"}, {name = "false", value = false}, {name = "number", value = 7}}) do
                    test.it("required proof/" .. dialect .. "/" .. stage .. "/" .. proof.name, function()
                        fixture.reset(stage, nil, dialect)
                        fixture.missing, fixture.proof = true, proof.value
                        local value, err = call()
                        test.is_nil(value)
                        test.is_true(errors.is(err, errors.INTERNAL))
                        test.is_false(err:retryable())
                        test.eq(err:details().code, "component_delete_response")
                        test.eq(err:details().field, fields[stage])
                    end)
                end
            end
        end
        for _, stage in ipairs({"owner_delete_1", "lock", "path_write", "detach", "delete"}) do
            for _, count in ipairs({-1, 0.5, 101}) do
                test.it("invalid affected count/" .. dialect .. "/" .. stage .. "/" .. count, function()
                    fixture.reset(stage, nil, dialect)
                    fixture.missing, fixture.proof = true, {rows_affected = count}
                    local value, err = call()
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "component_delete_response")
                    test.eq(err:details().field, fields[stage])
                end)
            end
        end
        test.it("deletion keeps its response/" .. dialect, function()
            fixture.reset("", nil, dialect)
            local value, err = call()
            test.is_nil(err)
            test.eq(value.component_id, "parent")
            test.is_true(value.deleted)
            test.is_true(value.changes_made)
            test.eq(value.rows_affected, 1)
            test.eq(fixture.owner_writes, 4)
            test.eq(fixture.owner_reads, 4)
        end)
        for _, stage in ipairs({"owner_read_1", "relink", "more_children", "unlink"}) do
            test.it("bounded continuation/" .. dialect .. "/" .. stage, function()
                fixture.reset(stage, nil, dialect)
                fixture.missing, fixture.proof = true, (stage == "relink" or stage == "unlink") and true or {{}}
                local value, err = call()
                test.is_nil(err)
                test.is_true(value.pending)
                test.is_false(value.deleted)
                test.eq(value.rows_affected, 0)
            end)
        end
        test.it("bounded owner drain stays at one hundred/" .. dialect, function()
            fixture.reset("owner_delete_1", nil, dialect)
            fixture.missing, fixture.proof = true, {rows_affected = 100}
            local value, err = call()
            test.is_nil(err)
            test.is_true(value.deleted)
            test.eq(fixture.owner_writes, 1)
        end)
        test.it("numeric affected counts stay accepted/" .. dialect, function()
            fixture.reset("delete", nil, dialect)
            fixture.missing, fixture.proof = true, {rows_affected = "1"}
            local value, err = call()
            test.is_nil(err)
            test.eq(tonumber(value.rows_affected), 1)
        end)
    end
end
local function group(label: string, define: any): any
    return test.run_cases(function() test.describe(label, define) end)
end
return {
    run = group("native component deletion dependencies 1", function() dependencies(1, 4) end),
    run_dependencies_2 = group("native component deletion dependencies 2", function() dependencies(5, 8) end),
    run_dependencies_3 = group("native component deletion dependencies 3", function() dependencies(9, 12) end),
    run_dependencies_4 = group("native component deletion dependencies 4", function() dependencies(13, 16) end),
    run_dependencies_5 = group("native component deletion dependencies 5", function() dependencies(17, 20) end),
    run_proofs = group("native component deletion proofs", proofs),
}
