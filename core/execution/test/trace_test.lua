local test = require("test")
local errors = require("errors")
local trace = require("trace")

local function define_tests()
    test.describe("Trace Context", function()
        test.it("begins a run with only canonical fields", function()
            local ctx = trace.begin("kb.ingest", "kb:1:source:a")
            test.eq(type(ctx.trace_id), "string")
            test.eq(ctx.run_id, ctx.trace_id)
            test.eq(ctx.correlation_key, "kb:1:source:a")
            test.is_nil(ctx.workflow_id)
            test.is_nil(ctx.request_id)
        end)

        test.it("inherits from an event and records the direct cause", function()
            local child, err = trace.inherit({
                id = "event-1",
                trace_context = {
                    trace_id = "trace-1",
                    run_id = "run-1",
                    correlation_key = "kb:1",
                },
            })
            test.is_nil(err)
            test.eq(child.trace_id, "trace-1")
            test.eq(child.run_id, "run-1")
            test.eq(child.correlation_key, "kb:1")
            test.eq(child.caused_by_event_id, "event-1")
        end)

        test.it("normalizes row fields back to trace_context", function()
            local row = {
                id = "event-2",
                trace_id = "trace-2",
                run_id = "run-2",
                caused_by_event_id = "event-1",
                correlation_key = "kb:2",
            }
            trace.attach_to_event(row)
            local normalized = row :: any
            test.eq(normalized.trace_context.trace_id, "trace-2")
            test.eq(normalized.trace_context.run_id, "run-2")
            test.eq(normalized.trace_context.caused_by_event_id, "event-1")
            test.eq(normalized.trace_context.correlation_key, "kb:2")
            test.is_nil(row.trace_id)
            test.is_nil(row.run_id)
        end)

        test.it("rejects aliases and partial trace records", function()
            local ctx, err = trace.normalize({ workflow_id = "w1" })
            test.is_nil(ctx)
            test.eq(errors.is(err, errors.INVALID), true)
            test.eq((err :: any):retryable(), false)
            test.eq((err :: any):details().code, "trace_context_noncanonical_field")
            test.eq((err :: any):message(), "trace_context.workflow_id is not canonical")
            local bad, berr = trace.normalize({ run_id = "run-only" })
            test.is_nil(bad)
            test.eq(errors.is(berr, errors.INVALID), true)
            test.eq((berr :: any):retryable(), false)
            test.eq((berr :: any):details().code, "trace_context_trace_id_required")
            test.eq((berr :: any):message(), "trace_context.trace_id is required")
            local scalar, serr = trace.normalize("trace-1")
            test.is_nil(scalar)
            test.eq(errors.is(serr, errors.INVALID), true)
            test.eq((serr :: any):retryable(), false)
            test.eq((serr :: any):details().code, "trace_context_invalid_type")
            test.eq((serr :: any):message(), "trace_context must be an object")
        end)

        test.it("normalizes blanks and defaults run_id to trace_id", function()
            local empty, empty_err = trace.normalize({ trace_id = " ", run_id = " " })
            test.is_nil(empty)
            test.is_nil(empty_err)

            local ctx, err = trace.normalize({
                trace_id = " trace-3 ",
                run_id = " ",
                caused_by_event_id = " event-2 ",
                correlation_key = " kb:3 ",
            })
            test.is_nil(err)
            test.eq(ctx.trace_id, "trace-3")
            test.eq(ctx.run_id, "trace-3")
            test.eq(ctx.caused_by_event_id, "event-2")
            test.eq(ctx.correlation_key, "kb:3")
        end)

        test.it("packs correlation data into one opaque token", function()
            local token, err = trace.pack_correlation("kb", { "123", "source", "abc:with space" })
            test.is_nil(err)
            test.eq(token, "kb:123:source:abc%3Awith%20space")
            local unpacked, uerr = trace.unpack_correlation(token)
            test.is_nil(uerr)
            test.eq(unpacked.kind, "kb")
            test.eq(unpacked.parts[1], "123")
            test.eq(unpacked.parts[3], "abc:with space")

            local mapped = trace.pack_correlation("kb", { source_id = "abc", kb_id = "123" })
            test.eq(mapped, "kb:kb_id=123:source_id=abc")
            local parsed = trace.unpack_correlation(mapped)
            test.eq(parsed.fields.kb_id, "123")
            test.eq(parsed.fields.source_id, "abc")
        end)

        test.it("returns native invalid errors for correlation validation", function()
            local token, kind_err = trace.pack_correlation(" ")
            test.is_nil(token)
            test.eq(errors.is(kind_err, errors.INVALID), true)
            test.eq((kind_err :: any):retryable(), false)
            test.eq((kind_err :: any):details().code, "correlation_kind_required")

            local unpacked, token_err = trace.unpack_correlation("")
            test.is_nil(unpacked)
            test.eq(errors.is(token_err, errors.INVALID), true)
            test.eq((token_err :: any):retryable(), false)
            test.eq((token_err :: any):details().code, "correlation_token_required")
        end)

        test.it("preserves every array part through correlation and event row codecs", function()
            for _, parts in ipairs({ { "0", "source" }, { 0, "source" },
                { "", "source", "" }, { "a=b", "a:b", "%3D", "with space" } }) do
                local token, err = trace.pack_correlation("kind:with=delimiters", parts)
                test.is_nil(err)
                local row, row_err = trace.apply_to_row({}, {
                    trace_id = "trace", run_id = "run", correlation_key = token,
                })
                test.is_nil(row_err)
                local event = trace.attach_to_event(row)
                local decoded, decode_err = trace.unpack_correlation(event.trace_context.correlation_key)
                test.is_nil(decode_err)
                test.eq(decoded.kind, "kind:with=delimiters")
                test.eq(#decoded.parts, #parts)
                for i, part in ipairs(parts) do test.eq(decoded.parts[i], tostring(part)) end
                test.is_nil(next(decoded.fields))
            end
        end)

        test.it("preserves encoded map delimiters and empty values through the correlation codec", function()
            local fields = { ["key=part"] = "value:part=other", ["empty"] = "", ["percent%"] = "%3D" }
            local token, err = trace.pack_correlation("map", fields)
            test.is_nil(err)
            local decoded, decode_err = trace.unpack_correlation(token)
            test.is_nil(decode_err)
            for key, value in pairs(fields) do test.eq(decoded.fields[key], value) end
            test.eq(#decoded.parts, 3)
        end)

        test.it("derives common context only when a batch is unambiguous", function()
            local one = trace.common({
                {
                    id = "event-1",
                    trace_context = { trace_id = "trace-1", run_id = "run-1", correlation_key = "same" },
                },
            })
            test.eq(one.trace_id, "trace-1")
            test.eq(one.run_id, "run-1")
            test.eq(one.correlation_key, "same")
            test.eq(one.caused_by_event_id, "event-1")

            local mixed_corr = trace.common({
                { id = "event-1", trace_context = { trace_id = "trace-1", run_id = "run-1", correlation_key = "a" } },
                { id = "event-2", trace_context = { trace_id = "trace-1", run_id = "run-1", correlation_key = "b" } },
            })
            test.eq(mixed_corr.trace_id, "trace-1")
            test.eq(mixed_corr.run_id, "run-1")
            test.is_nil(mixed_corr.correlation_key)
            test.is_nil(mixed_corr.caused_by_event_id)

            local mixed_trace = trace.common({
                { trace_context = { trace_id = "trace-1", run_id = "run-1" } },
                { trace_context = { trace_id = "trace-2", run_id = "run-2" } },
            })
            test.is_nil(mixed_trace)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
