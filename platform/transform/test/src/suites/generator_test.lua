local test = require("test")
local json = require("json")
local generator = require("generator")
local snippet = require("snippet")

-- Sink: the KB embed input_schema (content required, optional content_type +
-- metadata). This is what every generated output is validated against.
local KB_SINK_SCHEMA = {
    ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
    type = "object",
    properties = {
        content = { type = "string" },
        content_type = { type = "string" },
        metadata = { type = "object" },
    },
    required = { "content" },
}

-- Source: the Fireflies transcript item shape.
local FIREFLIES_SCHEMA = {
    type = "object",
    properties = {
        id = { type = "string" },
        title = { type = "string" },
        date = { type = "string" },
        duration = { type = "number" },
        host_email = { type = "string" },
        organizer_email = { type = "string" },
        transcript_url = { type = "string" },
        attendees = { type = "array", items = { type = "string" } },
        summary = {
            type = "object",
            properties = {
                overview = { type = "string" },
                keywords = { type = "array", items = { type = "string" } },
                action_items = { type = "string" },
                outline = { type = "string" },
                topics_discussed = { type = "array", items = { type = "string" } },
            },
        },
    },
}

-- The concrete fireflies -> KB expr artifact. Optional nested paths use ?. so a
-- missing summary falls back to the title instead of raising.
local GOOD_EXPR = '{ content: payload.summary?.overview ?? payload.title, content_type: "text/plain", metadata: { title: payload.title, date: payload.date, host_email: payload.host_email, source: "fireflies" } }'

-- Two transcript items reaching the transform: one with a summary, one without.
local function samples()
    return {
        { item_key = "t1", payload = {
            id = "t1", title = "Q3 Planning", date = "2026-06-01", host_email = "a@x.com",
            transcript_url = "https://f/1", summary = { overview = "We aligned on Q3 goals." },
        } },
        { item_key = "t2", payload = {
            id = "t2", title = "Standup", date = "2026-06-02", host_email = "b@x.com",
            transcript_url = "https://f/2",
        } },
    }
end

-- The KB embed sink takes content input.
local CONTENT = { input_shape = "content" }

local function define_tests()
    test.describe("transform generator gate", function()
        test.it("validates every strategy that declares install evaluation", function()
            local ok, failures = generator.validate_install({ kind = "test_upper" },
                { type = "object", properties = { text = { type = "string" } } },
                { type = "object", required = { "content" }, properties = { content = { type = "string" } } },
                { input_shape = "record" })
            test.is_false(ok)
            test.eq(failures[1], "sample 1: a record sink needs a table, got string")
        end)
        test.it("leaves strategies without install evaluation unexecuted", function()
            local calls = 0
            local ok = generator.validate_install({ kind = "llm" }, {}, {}, {
                input_shape = "record", apply_fn = function() calls = calls + 1; return nil, "unexpected execution" end,
            })
            test.is_true(ok)
            test.eq(calls, 0)
        end)

        -- (a) a valid expr mapping over the fireflies samples passes and produces
        -- schema-valid, sink-shaped output.
        test.it("valid expr artifact passes the gate on all samples", function()
            local ok, errors = generator.run_gate("expression", GOOD_EXPR, KB_SINK_SCHEMA, samples(), CONTENT)
            if not ok then error("gate rejected valid artifact: " .. json.encode(errors)) end
            test.is_true(ok)
            test.eq(#errors, 0)
        end)

        test.it("the concrete expr output matches the sink shape", function()
            local valid, errors, outputs = generator.validate_transform({ kind = "expr", expr = GOOD_EXPR }, KB_SINK_SCHEMA, samples(), CONTENT)
            test.is_true(valid, json.encode(errors))
            test.eq(outputs[1].content, "We aligned on Q3 goals.")
            test.eq(outputs[1].content_type, "text/plain")
            test.eq(outputs[1].metadata.title, "Q3 Planning")
            -- missing summary falls back to title
            test.eq(outputs[2].content, "Standup")
        end)

        -- The gate shapes every value into the sink's declared input, as the
        -- round writes it: a content sink takes a string as its content, a
        -- record sink refuses one, and an undeclared shape validates nothing.
        test.it("preserves configured content when validating a mapped record", function()
            local valid, failures, outputs = generator.validate_transform({ kind = "expr", expr = "{title: input.title}" },
                { type = "object", required = { "content" }, properties = { content = { type = "string" } } },
                { { payload = { title = "Source receipt" } } }, { input_shape = "content", configured_content = "Configured receipt" })
            test.is_true(valid, json.encode(failures))
            test.eq(outputs[1].content, "Configured receipt")
            test.eq(outputs[1].title, "Source receipt")
        end)
        test.it("normalizes each value into the sink's declared input shape", function()
            local text = { kind = "expr", expr = "payload.title" }
            local content_ok, content_errors, content_outputs = generator.validate_transform(text, KB_SINK_SCHEMA, samples(), CONTENT)
            test.is_true(content_ok, json.encode(content_errors))
            test.eq(content_outputs[1].content, "Q3 Planning")
            local record_ok, record_errors = generator.validate_transform(text, KB_SINK_SCHEMA, samples(), { input_shape = "record" })
            test.is_false(record_ok)
            test.contains(record_errors[1], "record sink needs a table")
            local undeclared_ok, undeclared_errors = generator.validate_transform(text, KB_SINK_SCHEMA, samples())
            test.is_false(undeclared_ok)
            test.contains(undeclared_errors[1], "record or content")
        end)

        test.it("reports a false value as an output and nil as none", function()
            local _, false_errors = generator.validate_transform({ kind = "expr", expr = "false" }, KB_SINK_SCHEMA, samples(), { input_shape = "record" })
            test.contains(false_errors[1], "record sink needs a table")
            local _, nil_errors = generator.validate_transform({ kind = "expr", expr = "nil" }, KB_SINK_SCHEMA, samples(), CONTENT)
            test.contains(nil_errors[1], "produced no output")
        end)

        -- (b) an artifact referencing a variable outside item/payload fails the
        -- gate and is never treated as valid.
        test.it("expr referencing an unknown var fails the gate", function()
            local ok, errors = generator.run_gate("expression", "{ content: meeting.summary }", KB_SINK_SCHEMA, samples(), CONTENT)
            test.is_false(ok)
            test.is_true(#errors > 0)
        end)

        -- (b) an artifact whose output is missing the required content fails the
        -- gate against the sink schema.
        test.it("expr missing required content fails the gate", function()
            local ok, errors = generator.run_gate("expression", "{ title: payload.title }", KB_SINK_SCHEMA, samples(), CONTENT)
            test.is_false(ok)
            test.is_true(#errors > 0)
        end)

        test.it("a gate with no samples cannot pass", function()
            local ok, errors = generator.run_gate("expression", GOOD_EXPR, KB_SINK_SCHEMA, {}, CONTENT)
            test.is_false(ok)
            test.is_true(#errors > 0)
        end)

        -- Callers with no real data synthesize a sample from the source schema so the
        -- gate runs for any schema-bearing source, rather than hard-failing.
        test.it("synthesize_sample builds a { payload } item from the source schema", function()
            local s = generator.synthesize_sample(FIREFLIES_SCHEMA)
            test.is_true(type(s) == "table")
            test.is_true(type(s.payload) == "table")
            test.is_true(type(s.payload.summary) == "table")
        end)

        test.it("a synthesized sample lets the gate run for a schema-bearing source", function()
            local synth = generator.synthesize_sample(FIREFLIES_SCHEMA)
            local ok, errors = generator.run_gate("expression", GOOD_EXPR, KB_SINK_SCHEMA, { synth }, CONTENT)
            if not ok then error("gate rejected on synthesized sample: " .. json.encode(errors)) end
            test.is_true(ok)
        end)

        test.it("executes an expression against the declared event body schema", function()
            local schema = { type = "object", properties = { filename = { type = "string" } }, required = { "filename" } }
            local sample = generator.synthesize_sample(schema)
            test.eq(sample.payload.filename, "")
            test.is_nil(sample.payload.body)
            local ok, errors = generator.run_gate("expression", '{ content: "Receipt upload " + payload.filename }',
                KB_SINK_SCHEMA, { sample }, CONTENT)
            test.is_true(ok, json.encode(errors))
        end)

        test.it("synthesize_sample on a shapeless schema yields an empty payload, not an error", function()
            local s = generator.synthesize_sample({ type = "object" })
            test.is_true(type(s.payload) == "table")
        end)
    end)

    test.describe("transform generator orchestration", function()
        test.it("returns a validated proposal when generation succeeds", function()
            local result = generator.generate({
                source_schema = FIREFLIES_SCHEMA,
                sink_schema = KB_SINK_SCHEMA,
                input_shape = "content",
                samples = samples(),
                strategy = "expression",
                generate_fn = function() return GOOD_EXPR end,
            })
            test.is_true(result.ok)
            test.is_true(result.validated)
            test.eq(result.strategy, "expression")
            test.eq(result.artifact, GOOD_EXPR)
        end)

        -- Three failed expression attempts carry no attachable artifact.
        test.it("bad generation never returns an attachable artifact", function()
            local calls: { [string]: number } = { expression = 0, llm = 0 }
            -- llm execution is stubbed to a deterministically invalid output (no
            -- content); the expression branch uses the real strategy apply.
            local function apply_fn(config, item, index)
                if config.kind == "expr" then return generator.apply_strategy(config, item, index) end
                return { present = true, value = { note = "no content" } }, nil
            end
            local function bad_gen(ctx)
                calls[ctx.strategy] = (calls[ctx.strategy] or 0) + 1
                if ctx.strategy == "expression" then return "{ content: missingvar.x }" end
                return { prompt = "map it" }
            end

            local result = generator.generate({
                source_schema = FIREFLIES_SCHEMA,
                sink_schema = KB_SINK_SCHEMA,
                input_shape = "content",
                samples = samples(),
                strategy = "expression",
                generate_fn = bad_gen,
                apply_fn = apply_fn,
                allow_llm_fallback = true,
            })

            test.is_false(result.ok)
            test.is_false(result.validated)
            test.is_nil(result.artifact)
            test.is_true(#(result.errors or {}) > 0)
            -- Only the requested expression strategy executes.
            test.eq(calls.expression, 3)
            test.eq(calls.llm, 0)
        end)

        test.it("hard-fails without touching llm when fallback is disabled", function()
            local calls: { [string]: number } = { expression = 0, llm = 0 }
            local result = generator.generate({
                source_schema = FIREFLIES_SCHEMA,
                sink_schema = KB_SINK_SCHEMA,
                input_shape = "content",
                samples = samples(),
                strategy = "expression",
                allow_llm_fallback = false,
                generate_fn = function(ctx)
                    calls[ctx.strategy] = (calls[ctx.strategy] or 0) + 1
                    return "{ content: missingvar.x }"
                end,
            })
            test.is_false(result.ok)
            test.is_nil(result.artifact)
            test.eq(calls.expression, 3)
            test.eq(calls.llm, 0)
        end)

        test.it("a corrected second attempt validates and attaches", function()
            local n = 0
            local result = generator.generate({
                source_schema = FIREFLIES_SCHEMA,
                sink_schema = KB_SINK_SCHEMA,
                input_shape = "content",
                samples = samples(),
                strategy = "expression",
                generate_fn = function()
                    n = n + 1
                    if n == 1 then return "{ content: missingvar.x }" end
                    return GOOD_EXPR
                end,
            })
            test.is_true(result.validated)
            test.eq(result.artifact, GOOD_EXPR)
            test.eq(result.attempts, 2)
        end)
    end)

    test.describe("transform code strategy", function()
        -- The code strategy runs the artifact through the SAME gate: the code
        -- strategy dispatches to the sandboxed executor (the harness stub),
        -- whose mapped output is validated against the sink schema. A forced code
        -- strategy never ladders to another kind.
        test.it("strategy=code produces a gate-validated code artifact", function()
            local result = generator.generate({
                source_schema = FIREFLIES_SCHEMA,
                sink_schema = KB_SINK_SCHEMA,
                input_shape = "content",
                samples = samples(),
                strategy = "code",
                generate_fn = function()
                    return [[
                        local summary = type(__cx_args.payload.summary) == "table" and __cx_args.payload.summary or {}
                        return { content = summary.overview or __cx_args.payload.title }
                    ]]
                end,
            })
            if not result.ok then error("code generation failed: " .. json.encode(result.errors)) end
            test.is_true(result.ok)
            test.is_true(result.validated)
            test.eq(result.strategy, "code")
            test.eq(type(result.artifact), "string")
        end)

        test.it("a code artifact passes run_gate on all samples", function()
            local ok, errors = generator.run_gate("code", "return { content = __cx_args.payload.title }", KB_SINK_SCHEMA, samples(), CONTENT)
            if not ok then error("gate rejected code artifact: " .. json.encode(errors)) end
            test.is_true(ok)
            test.eq(#errors, 0)
        end)

        test.it("to_transform maps a code artifact to the code kind config", function()
            local config = generator.to_transform("code", "return { content = 1 }")
            test.eq(config.kind, "code")
            test.eq(config.code, "return { content = 1 }")
        end)

        test.it("to_transform preserves only the code SDK capability seam", function()
            local config = generator.to_transform("code", {
                code = "return { content = 1 }",
                tool_ids = { "test:tool" },
            })
            local saw_kind = false
            local saw_code = false
            local saw_tool_ids = false
            local count = 0
            for key, _ in pairs(config) do
                count = count + 1
                if key == "kind" then saw_kind = true end
                if key == "code" then saw_code = true end
                if key == "tool_ids" then saw_tool_ids = true end
            end
            test.eq(count, 3)
            test.is_true(saw_kind)
            test.is_true(saw_code)
            test.is_true(saw_tool_ids)
            test.eq(config.tool_ids[1], "test:tool")
        end)
    end)

    -- validate_transform is what POST /transform/validate returns verbatim: it runs a
    -- ready config over the samples, validates each output against the sink schema,
    -- and reports valid + errors + the produced outputs for a UI preview.
    test.describe("transform config validation (validate endpoint)", function()
        test.it("a valid config reports valid with the produced outputs", function()
            local valid, errors, outputs = generator.validate_transform(
                { kind = "expr", expr = GOOD_EXPR }, KB_SINK_SCHEMA, samples(), CONTENT)
            test.is_true(valid)
            test.eq(#errors, 0)
            test.eq(#outputs, 2)
            test.eq(outputs[1].content, "We aligned on Q3 goals.")
        end)

        test.it("a config whose output misses required content is invalid", function()
            local valid, errors, outputs = generator.validate_transform(
                { kind = "expr", expr = "{ title: payload.title }" }, KB_SINK_SCHEMA, samples(), CONTENT)
            test.is_false(valid)
            test.is_true(#errors > 0)
            -- the produced (invalid) items still ride out for the preview
            test.eq(#outputs, 2)
        end)

        test.it("validates a code-kind config through the executor", function()
            local valid, errors, outputs = generator.validate_transform(
                { kind = "code", code = "return { content = __cx_args.payload.title }" }, KB_SINK_SCHEMA, samples(), CONTENT)
            test.is_true(valid)
            test.eq(#errors, 0)
            test.eq(#outputs, 2)
        end)
    end)

    test.describe("transform strategy analysis", function()
        test.it("identical schemas prefer expression", function()
            local strategy = generator.analyze_strategy(KB_SINK_SCHEMA, KB_SINK_SCHEMA, nil)
            test.eq(strategy, "expression")
        end)

        test.it("similarity is 1 for identical, 0 for disjoint", function()
            test.eq(generator.schema_similarity(KB_SINK_SCHEMA, KB_SINK_SCHEMA), 1)
            local disjoint = { type = "object", properties = { zzz = { type = "string" } } }
            test.eq(generator.schema_similarity(KB_SINK_SCHEMA, disjoint), 0)
        end)

        test.it("low overlap consults the judge and can pick llm", function()
            local disjoint = { type = "object", properties = { zzz = { type = "string" }, www = { type = "string" } } }
            local strategy = generator.analyze_strategy(FIREFLIES_SCHEMA, disjoint, {
                judge_fn = function() return "llm" end,
            })
            test.eq(strategy, "llm")
        end)
    end)

    test.describe("transform snippet fingerprint", function()
        test.it("fingerprint is deterministic and order-independent", function()
            local a = { type = "object", properties = { x = { type = "string" }, y = { type = "number" } } }
            local b = { type = "object", properties = { y = { type = "number" }, x = { type = "string" } } }
            test.eq(snippet.fingerprint(a), snippet.fingerprint(b))
        end)

        test.it("different shapes yield different fingerprints", function()
            local a = { type = "object", properties = { x = { type = "string" } } }
            local b = { type = "object", properties = { x = { type = "number" } } }
            test.is_true(snippet.fingerprint(a) ~= snippet.fingerprint(b))
        end)

        test.it("accepts a JSON-string schema (sink input_schema form)", function()
            local as_table = snippet.fingerprint(KB_SINK_SCHEMA)
            local as_string = snippet.fingerprint(json.encode(KB_SINK_SCHEMA))
            test.eq(as_table, as_string)
        end)
    end)

    test.describe("transform snippet registry", function()
        test.it("publishes then resolves a snippet by shape pair", function()
            local miss = snippet.search_snippet(FIREFLIES_SCHEMA, KB_SINK_SCHEMA)
            test.is_nil(miss)

            local pub, perr = snippet.publish_snippet(GOOD_EXPR, FIREFLIES_SCHEMA, KB_SINK_SCHEMA, {
                strategy = "expression",
                rationale = "confirmed fireflies->KB mapping",
            })
            test.is_nil(perr)
            test.not_nil(pub)

            local hit, herr = snippet.search_snippet(FIREFLIES_SCHEMA, KB_SINK_SCHEMA)
            test.is_nil(herr)
            test.not_nil(hit)
            test.eq(hit.strategy, "expression")
            test.eq(hit.artifact, GOOD_EXPR)
        end)

        test.it("rejects a publish without a strategy", function()
            local _, err = snippet.publish_snippet(GOOD_EXPR, FIREFLIES_SCHEMA, KB_SINK_SCHEMA, {})
            test.not_nil(err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
local function run(options) return run_cases(options) end
return { run = run }
