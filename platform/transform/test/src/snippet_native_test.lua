local test = require("test")
local snippet = require("snippet")
local nodes = require("nodes")
local registry = require("registry")
local json = require("json")
local uuid = require("uuid")
local funcs = require("funcs")

-- Each attempt rebuilds an owned fixture write from a fresh snapshot. Other
-- registry writers may advance the head; all other errors remain test failures.
local function fixture_write(write)
    local result, err
    for _ = 1, 5 do
        result, err = write()
        if not errors.is(err, errors.CONFLICT) or err:retryable() ~= true then return result, err end
        local details = err:details() or {}
        if details.plan_version == nil or details.current_version == nil then return result, err end
    end
    return result, err
end

local function publish_fixture(artifact, source, sink, options)
    return fixture_write(function() return snippet.publish_snippet(artifact, source, sink, options) end)
end

local function remove_fixture(id)
    local _, err = fixture_write(function()
        local changes = assert(registry.snapshot()):changes()
        changes:delete(id)
        return changes:apply()
    end)
    test.is_nil(err)
end

local function check_schema_error(err, field, raw)
    test.is_true(errors.is(err, errors.INVALID))
    test.eq(err:retryable(), false)
    test.eq(err:details().code, "transform_schema_invalid")
    test.eq(err:details().field, field)
    local _, source = json.decode(raw)
    local cause = err:details().cause
    test.eq(cause.kind, source:kind())
    test.eq(cause.message, source:message())
    test.eq(cause.retryable, source:retryable())
    test.eq(cause.details, source:details())
end

local function define_tests()
    test.describe("native snippet errors", function()
        for _, raw in ipairs({"{", "[", '"unterminated'}) do
            test.it("rejects malformed schema JSON instead of assigning an empty-schema fingerprint: " .. raw, function()
                local fingerprint, err = snippet.fingerprint(raw)
                test.is_nil(fingerprint)
                check_schema_error(err, "schema", raw)
            end)
            for _, field in ipairs({"source_schema", "sink_schema"}) do
                test.it("rejects malformed " .. field .. " before reading or overwriting a confirmed shape pair: " .. raw, function()
                    local marker = "native_snippet_" .. uuid.v7():gsub("-", "")
                    local shape = {type = "object", properties = {[marker] = {type = "string"}}}
                    local source, sink = {}, shape
                    if field == "sink_schema" then source, sink = shape, {} end
                    local expected_id = "kickside.transform.snippets:" .. assert(snippet.fingerprint(source))
                        .. "_" .. assert(snippet.fingerprint(sink))
                    test.is_nil((registry.get(expected_id)))
                    local seed = assert(publish_fixture("confirmed-owned-artifact", source, sink, {strategy = "expression"}))
                    test.eq(seed.id, expected_id)
                    local ok, failure = pcall(function()
                        local bad_source, bad_sink = source, sink
                        if field == "source_schema" then bad_source = raw else bad_sink = raw end
                        local written, write_err = snippet.publish_snippet("malformed-schema-artifact", bad_source, bad_sink,
                            {strategy = "expression"})
                        local preserved = assert(registry.get(seed.id))
                        test.eq(preserved.data.artifact, "confirmed-owned-artifact")
                        test.is_nil(written)
                        check_schema_error(write_err, field, raw)
                        local hit, search_err = snippet.search_snippet(bad_source, bad_sink)
                        test.is_nil(hit)
                        check_schema_error(search_err, field, raw)
                        local result, node_err = funcs.call("kickside.transform:node_snippet_search",
                            {source_schema = bad_source, sink_schema = bad_sink})
                        test.is_nil(result)
                        check_schema_error(node_err, field, raw)
                    end)
                    remove_fixture(seed.id)
                    if not ok then error(failure) end
                end)
            end
        end
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("propagates " .. kind .. " snippet lookup failures with source retryability " .. tostring(policy.retryable), function()
                    local source = errors.new({kind = kind, retryable = policy.retryable, message = "snippet lookup dependency",
                        details = {code = "snippet_lookup_dependency", nested = {marker = "retained"}}})
                    local node = nodes.new({snippet = {search_snippet = function() return nil, source end}})
                    local result, err = node.snippet_search({source_schema = {}, sink_schema = {}})
                    test.is_nil(result)
                    test.eq(err:kind(), source:kind())
                    test.eq(err:message(), source:message())
                    test.eq(tostring(err), tostring(source))
                    test.eq(err:retryable(), policy.retryable)
                    test.eq(err:details().code, "snippet_lookup_dependency")
                    test.eq(err:details().nested.marker, "retained")
                end)
            end
        end
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("does not write after a " .. kind .. " registry lookup failure with retryability " .. tostring(policy.retryable), function()
                    local source = errors.new({kind = kind, retryable = policy.retryable,
                        message = "snippet registry lookup dependency", details = {code = "registry_lookup_dependency", nested = {marker = "retained"}}})
                    local store = snippet.new({registry = {
                        snapshot = function() return registry.snapshot() end,
                        find = function() return nil, source end,
                    }})
                    local marker = "native_lookup_" .. uuid.v7():gsub("-", "")
                    local shape = {type = "object", properties = {[marker] = {type = "string"}}}
                    local id = "kickside.transform.snippets:" .. assert(snippet.fingerprint({})) .. "_" .. assert(snippet.fingerprint(shape))
                    test.is_nil((registry.get(id)))
                    local result, err = store.publish_snippet("lookup-write", {}, shape, {strategy = "expression"})
                    local entry = registry.get(id)
                    if entry then
                        remove_fixture(id)
                    end
                    test.is_nil(entry)
                    test.is_nil(result)
                    test.eq(err:kind(), source:kind())
                    test.eq(err:message(), source:message())
                    test.eq(tostring(err), tostring(source))
                    test.eq(err:retryable(), policy.retryable)
                    test.eq(err:details().code, "registry_lookup_dependency")
                    test.eq(err:details().nested.marker, "retained")
                end)
            end
        end
        for _, stage in ipairs({"search", "snapshot", "apply"}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("retains native " .. stage .. " failure with retryability " .. tostring(policy.retryable), function()
                    local source = errors.new({kind = errors.UNAVAILABLE, retryable = policy.retryable,
                        message = "snippet store dependency", details = {code = "snippet_store_dependency", nested = {marker = "retained"}}})
                    local store = snippet.new({registry = {
                        find = function()
                            if stage == "search" then return nil, source end
                            return {}
                        end,
                        snapshot = function()
                            if stage == "snapshot" then return nil, source end
                            return {changes = function()
                                return {create = function() end, apply = function() return nil, source end}
                            end}
                        end,
                    }})
                    local result, err
                    if stage == "search" then result, err = store.search_snippet({}, {})
                    else result, err = store.publish_snippet("artifact", {}, {}, {strategy = "expression"}) end
                    test.is_nil(result)
                    test.eq(err:kind(), source:kind())
                    test.eq(err:message(), source:message())
                    test.eq(tostring(err), tostring(source))
                    test.eq(err:retryable(), policy.retryable)
                    test.eq(err:details().code, "snippet_store_dependency")
                    test.eq(err:details().nested.marker, "retained")
                end)
            end
        end
        test.it("returns native Unavailable when a registry snapshot is absent", function()
            local store = snippet.new({registry = {snapshot = function() return nil end}})
            local result, err = store.publish_snippet("artifact", {}, {}, {strategy = "expression"})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:retryable(), true)
            test.eq(err:details().code, "registry_snapshot_missing")
        end)
        for _, case in ipairs({
            {args = {artifact = "artifact", source_schema = {}, sink_schema = {}, opts = {}}, field = "strategy"},
            {args = {source_schema = {}, sink_schema = {}, opts = {strategy = "expression"}}, field = "artifact"},
        }) do
            test.it("returns native publication validation for " .. case.field, function()
                local result, err = snippet.publish_snippet(case.args.artifact, case.args.source_schema,
                    case.args.sink_schema, case.args.opts)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "transform_snippet_invalid")
                test.eq(err:details().field, case.field)
                local bound, bound_err = funcs.call("kickside.transform:publish_transform_snippet", {
                    artifact = case.args.artifact, source_schema = case.args.source_schema,
                    sink_schema = case.args.sink_schema, strategy = case.args.opts.strategy,
                })
                test.is_nil(bound)
                test.is_true(errors.is(bound_err, errors.INVALID))
                test.eq(bound_err:retryable(), false)
                test.eq(bound_err:details().code, "transform_snippet_invalid")
                test.eq(bound_err:details().field, case.field)
            end)
        end
        test.it("retains absent and empty schema defaults and legitimate fingerprints", function()
            test.eq(snippet.fingerprint(nil), snippet.fingerprint({}))
            test.eq(snippet.fingerprint(""), snippet.fingerprint({}))
            local shape = {type = "object", properties = {marker = {type = "string"}}}
            test.eq(snippet.fingerprint(shape), snippet.fingerprint(assert(json.encode(shape))))
        end)
        test.it("returns the gate diagnostics when a reused snippet violates request constraints", function()
            local marker = "snippet_gate_" .. uuid.v7():gsub("-", "")
            local source = {type = "object", properties = {value = {type = "string"}}}
            local published_sink = {type = "object", required = {"content"}, properties = {
                content = {type = "string"},
            }}
            local request_sink = {type = "object", required = {"content"}, properties = {
                content = {type = "string", enum = {marker}},
            }}
            test.eq(snippet.fingerprint(published_sink), snippet.fingerprint(request_sink))
            local stored = assert(publish_fixture("{ content: payload.value }", source, published_sink,
                {strategy = "expression"}))
            local ok, failure = pcall(function()
                local state, err = nodes.snippet_search({
                    source_schema = source,
                    sink_schema = request_sink,
                    input_shape = "record",
                    samples = {{payload = {value = "not-approved"}}},
                })
                test.is_nil(err)
                test.is_true(state.done)
                test.is_false(state.ok)
                test.is_false(state.validated)
                test.is_nil(state.artifact)
                test.is_true(#(state.errors or {}) > 0)
            end)
            remove_fixture(stored.id)
            if not ok then error(failure) end
        end)
        test.it("returns a failed gate result when a reused snippet has no request samples", function()
            local source = {type = "object", properties = {value = {type = "string"}}}
            local sink = {type = "object", required = {"content"}, properties = {
                content = {type = "string"},
            }}
            local stored = assert(publish_fixture("{ content: payload.value }", source, sink,
                {strategy = "expression"}))
            local ok, failure = pcall(function()
                local state, err = nodes.snippet_search({
                    source_schema = source,
                    sink_schema = sink,
                    input_shape = "record",
                })
                test.is_nil(err)
                test.is_true(state.done)
                test.is_false(state.ok)
                test.is_false(state.validated)
                test.is_nil(state.artifact)
                test.is_true(#(state.errors or {}) > 0)
            end)
            remove_fixture(stored.id)
            if not ok then error(failure) end
        end)
        test.it("marks a reused snippet validated after its request sample passes the gate", function()
            local source = {type = "object", properties = {value = {type = "string"}}}
            local sink = {type = "object", required = {"content"}, properties = {
                content = {type = "string"},
            }}
            local artifact = "{ content: payload.value }"
            local stored = assert(publish_fixture(artifact, source, sink, {strategy = "expression"}))
            local ok, failure = pcall(function()
                local state, err = nodes.snippet_search({
                    source_schema = source,
                    sink_schema = sink,
                    input_shape = "record",
                    samples = {{payload = {value = "accepted"}}},
                })
                test.is_nil(err)
                test.is_true(state.done)
                test.is_true(state.ok)
                test.is_true(state.validated)
                test.eq(state.artifact, artifact)
            end)
            remove_fixture(stored.id)
            if not ok then error(failure) end
        end)
    end)
end
return {run = test.run_cases(define_tests)}
