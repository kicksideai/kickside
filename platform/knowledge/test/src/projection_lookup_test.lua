local test = require("test")
local status = require("status")

local function executor(pair, failure)
    return setmetatable({}, { __index = function(_, method)
        return function(_, args)
            test.eq(method, "get_projection_cursor")
            test.eq(args.thread_id, "kb")
            test.eq(args.kind, "knowledge.injection.source")
            test.eq(args.projection_key, "source")
            test.eq(args.cursor_key, "source")
            return pair, failure
        end
    end })
end

return { run = test.run_cases(function()
    test.describe("Knowledge addressed projection lookup", function()
        test.it("reads its declared pair without enumerating projections", function()
            local found, err = status.lookup_source_projection(executor({
                projection = { id = "projection", kind = "knowledge.injection.source", projection_key = "source",
                    body = { meta = { worker_ref = "proc://fixture:source" } } },
                cursor = { id = "cursor", cursor_key = "source", status = "active", generation = 2,
                    last_seq = 7, job_id = "slot", debounce_idle_ms = 13, debounce_max_ms = 21 },
            }), "kb")
            test.is_nil(err)
            test.eq(found.projection_id, "projection")
            test.eq(found.cursor_id, "cursor")
            test.eq(found.projection.worker_ref, "proc://fixture:source")
            test.eq(found.projection.last_seq, 7)
            test.eq(found.projection.debounce_max_ms, 21)
        end)
        test.it("propagates graph append failures after one owner call", function()
            local calls = 0
            local failure = errors.new({ kind = errors.CONFLICT, message = "database is locked" })
            local exec = { emit = function(_, args)
                calls = calls + 1
                test.eq(args.type, "graph.changed")
                return nil, failure
            end }
            local result, err = status.emit_event(exec, "kb", { type = "graph.changed", body = {} })
            test.is_nil(result)
            test.eq(err, failure)
            test.eq(calls, 1)
        end)

        test.it("rejects corrupt projection bodies rather than reporting partial status", function()
            for _, body in ipairs({ "{broken", "false", "42" }) do
                local found, err = status.lookup_source_projection(executor({
                    projection = { id = "projection", body = body }, cursor = { id = "cursor" },
                }), "kb")
                test.is_nil(found)
                test.not_nil(err)
            end
        end)

        test.it("treats only typed NOT_FOUND as unprovisioned", function()
            local found, err = status.lookup_source_projection(executor(nil,
                errors.new({ kind = errors.NOT_FOUND, message = "absent" })), "kb")
            test.is_nil(found)
            test.is_nil(err)
        end)
        test.it("propagates access and infrastructure failures even when prose names absence", function()
            for _, kind in ipairs({ errors.PERMISSION_DENIED, errors.UNAVAILABLE }) do
                local failure = errors.new({ kind = kind, message = "projection not found in an unavailable read" })
                local found, err = status.lookup_source_projection(executor(nil, failure), "kb")
                test.is_nil(found)
                test.not_nil(err)
                test.contains(tostring(err), "unavailable read")
                test.is_true(errors.is(err, kind), "lookup preserves the typed failure")
            end
        end)
        test.it("refuses an incomplete pair instead of reporting it as unprovisioned", function()
            for _, pair in ipairs({ false, {}, { projection = {} }, { projection = {}, cursor = {} } }) do
                local found, err = status.lookup_source_projection(executor(pair), "kb")
                test.is_nil(found)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.INTERNAL))
            end
        end)
    end)
end) }
