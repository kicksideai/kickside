-- Real-LLM eval for the transform generator. Unlike the stubbed unit suites, this
-- drives kickside.transform:generate_transform against a LIVE model: it produces a
-- transform for each fixture's (source -> sink) shape, asserts the generator's own
-- gate validated it, then re-runs the returned transform through the generator
-- gate over the samples and asserts the produced output.
--
-- Two-level self-skip keeps `wippy run test` green offline:
--   1. GATE   -- KICKSIDE_INTEGRATION_TESTS must be truthy, else the suite skips.
--   2. PROBE  -- a tiny llm.generate must succeed, else the suite skips (no model).
-- The code fixture skips additionally when kickside.code_execution:run_code (the
-- sandbox backend, shipped in the external providers repo) is unreachable.

local test = require("test")
local json = require("json")
local env = require("env")
local funcs = require("funcs")
local time = require("time")
local llm = require("llm")
local prompt = require("prompt")
local generator = require("generator")

local M = {}

local GATE_VAR = "KICKSIDE_INTEGRATION_TESTS"
local MODEL_VAR = "KICKSIDE_TRANSFORM_EVAL_MODEL"
local DEFAULT_MODEL = "class:fast"
local GEN_FUNC = "kickside.transform:generate_transform"
local RUN_CODE = "kickside.code_execution:run_code"

-- Truthy env flag: present and not one of the falsey spellings.
local function env_truthy(name: string): boolean
    local v, err = env.get(name)
    if err ~= nil or v == nil then return false end
    local s = tostring(v):lower()
    return s ~= "" and s ~= "0" and s ~= "false" and s ~= "no" and s ~= "off"
end

local function env_value(name: string, fallback: string): string
    local v, err = env.get(name)
    if err ~= nil or v == nil or tostring(v) == "" then return fallback end
    return tostring(v)
end

local function now_ms(): number
    return (time.now():unix_nano() :: number) / 1000000.0
end

-- Tiny generation to confirm a model is actually reachable.
local function probe_model(model: string): (boolean, string?)
    local p = prompt.new()
    p:add_user("Reply with the single word: ok")
    local resp, err = llm.generate(p, { model = model, temperature = 0 })
    if err ~= nil then return false, tostring(err) end
    if type(resp) ~= "table" then return false, "empty model response" end
    return true, nil
end

-- run_code reachable? A benign funcs.call; a missing entry surfaces as an error.
local function probe_run_code(): boolean
    local out, err = funcs.call(RUN_CODE, {
        input = { payload = { title = "probe" } },
        config = { code = "return { content = __cx_args.payload.title }" },
    })
    return err == nil and type(out) == "table"
end

-- Non-empty string content on the first produced output.
local function nonempty_content(outputs: {any}): boolean
    local o = outputs[1]
    return type(o) == "table" and type(o.content) == "string" and o.content ~= ""
end

-- Exact content match on the first produced output.
local function content_eq(expected: string): (({any}) -> boolean)
    return function(outputs: {any}): boolean
        local o = outputs[1]
        return type(o) == "table" and o.content == expected
    end
end

local KB_SINK = {
    type = "object",
    properties = { content = { type = "string" } },
    required = { "content" },
}

local FIREFLIES_OVERVIEW = "Team aligned on the Q3 roadmap and agreed to ship the transform assist first."
local NESTED_LEAF = "The build passed on the third attempt after the flaky test was quarantined."

-- Each fixture: name, source_schema, sink_schema, samples, hint?, strategy?, expect(outputs).
local function fixtures(): {any}
    return {
        {
            name = "fireflies_to_kb",
            -- Nested source (payload.summary.overview) extracted verbatim into
            -- {content}. Forced expr so the extraction is exact, not paraphrased.
            strategy = "expr",
            source_schema = {
                type = "object",
                properties = {
                    summary = {
                        type = "object",
                        properties = { overview = { type = "string" }, action_items = { type = "array" } },
                    },
                },
            },
            sink_schema = KB_SINK,
            samples = { { payload = { summary = { overview = FIREFLIES_OVERVIEW, action_items = {} } } } },
            expect = content_eq(FIREFLIES_OVERVIEW),
        },
        {
            name = "flat_rename",
            -- Flat {title,id} -> {content}: a plain field rename the model resolves.
            source_schema = {
                type = "object",
                properties = { title = { type = "string" }, id = { type = "string" } },
            },
            sink_schema = KB_SINK,
            samples = { { payload = { title = "Weekly engineering sync notes", id = "evt_9182" } } },
            expect = nonempty_content,
        },
        {
            name = "nested_extract",
            -- Deeper nesting (payload.data.body.text) extracted verbatim.
            strategy = "expr",
            source_schema = {
                type = "object",
                properties = {
                    data = {
                        type = "object",
                        properties = {
                            body = {
                                type = "object",
                                properties = { text = { type = "string" }, html = { type = "string" } },
                            },
                        },
                    },
                },
            },
            sink_schema = KB_SINK,
            samples = { { payload = { data = { body = { text = NESTED_LEAF, html = "<p>...</p>" } } } } },
            expect = content_eq(NESTED_LEAF),
        },
        {
            name = "needs_llm",
            -- Free-form: a raw transcript must become a short summary in {content}.
            -- No clean field maps, so auto strategy picks llm (or expr if it finds a
            -- direct field); we only require a validated, non-empty result.
            hint = "Summarize the meeting transcript into a short paragraph.",
            source_schema = {
                type = "object",
                properties = { transcript = { type = "string" }, speaker_count = { type = "number" } },
            },
            sink_schema = KB_SINK,
            samples = { { payload = {
                transcript = "Alice: the migration is done. Bob: great, I'll flip the flag tonight. "
                    .. "Alice: keep the old path for a week. Bob: agreed, I'll add a rollback note.",
                speaker_count = 2,
            } } },
            expect = nonempty_content,
        },
        {
            name = "code_case",
            -- Forced code strategy: the model writes sandboxed Lua the run_code
            -- backend executes. Skipped unless run_code is reachable.
            strategy = "code",
            requires_run_code = true,
            source_schema = {
                type = "object",
                properties = {
                    title = { type = "string" },
                    summary = { type = "object", properties = { overview = { type = "string" } } },
                },
            },
            sink_schema = KB_SINK,
            samples = { { payload = { title = "Standup", summary = { overview = FIREFLIES_OVERVIEW } } } },
            expect = content_eq(FIREFLIES_OVERVIEW),
        },
    }
end

-- Run one fixture end to end: generate, assert the gate validated, re-apply the
-- returned transform over the samples, assert expect(). Returns a per-case record.
local function run_fixture(fx: any, model: string): any
    local t0 = now_ms()
    local proposal, err = funcs.call(GEN_FUNC, {
        source_schema = fx.source_schema,
        sink_schema = fx.sink_schema,
        input_shape = "content",
        samples = fx.samples,
        hint = fx.hint,
        strategy = fx.strategy,
        model = model,
    })
    local latency = now_ms() - t0

    test.is_nil(err, "generate_transform errored: " .. tostring(err))
    test.not_nil(proposal, "generate_transform returned no proposal")
    local p = proposal :: any

    if p.validated ~= true then
        local errs = type(p.errors) == "table" and json.encode(p.errors) or "(none)"
        test.fail(fx.name .. " did not validate; strategy=" .. tostring(p.strategy) .. " errors=" .. errs)
    end
    test.not_nil(p.transform, fx.name .. " validated without a transform config")

    local applied, apply_errors, outputs = generator.validate_transform(p.transform, fx.sink_schema, fx.samples,
        { input_shape = "content" })
    test.is_true(applied, fx.name .. " apply failed: " .. json.encode(apply_errors))

    test.is_true(fx.expect(outputs), fx.name .. " expectation failed; output=" .. json.encode(outputs))

    return { name = fx.name, strategy = tostring(p.strategy), validated = true, latency_ms = latency, pass = true }
end

local function define_tests()
    local model = env_value(MODEL_VAR, DEFAULT_MODEL)

    test.describe("transform generator eval (real LLM)", function()
        -- GATE: integration tests disabled -> pass as a single skip.
        if not env_truthy(GATE_VAR) then
            test.it("skipped: " .. GATE_VAR .. " unset", function()
                print("[transform_eval] skipped: " .. GATE_VAR .. " is not truthy; set it to run the real-LLM eval")
            end)
            return
        end

        -- PROBE: no reachable model -> pass as a single skip.
        local ok, perr = probe_model(model)
        if not ok then
            test.it("skipped: no live model", function()
                print("[transform_eval] skipped: no live model (" .. model .. "): " .. tostring(perr))
            end)
            return
        end

        local run_code_ok = probe_run_code()
        local records: {any} = {}

        for _, fx in ipairs(fixtures()) do
            if fx.requires_run_code == true and not run_code_ok then
                test.it(fx.name .. " [skipped: run_code unreachable]", function()
                    print("[transform_eval] " .. fx.name .. " skipped: kickside.code_execution:run_code unreachable")
                end)
            else
                test.it(fx.name, function()
                    local rec = run_fixture(fx, model)
                    records[#records + 1] = rec
                    print(string.format("[transform_eval] %-16s strategy=%-10s validated=%s latency=%dms pass=%s",
                        rec.name, rec.strategy, tostring(rec.validated), math.floor(rec.latency_ms + 0.5), tostring(rec.pass)))
                end)
            end
        end

        test.after_all(function()
            local total, passed, total_ms = 0, 0, 0.0
            for _, r in ipairs(records) do
                total = total + 1
                if r.pass then passed = passed + 1 end
                total_ms = total_ms + r.latency_ms
            end
            print(string.format("[transform_eval] summary: %d/%d passed, total %dms, model=%s",
                passed, total, math.floor(total_ms + 0.5), model))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
function M.run(options) return run_cases(options) end

return M
