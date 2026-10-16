local test = require("test")
local funcs = require("funcs")
local security = require("security")
local generator = require("generator")
local gen_nodes = require("gen_nodes")
local gen_flow = require("gen_flow")

local M = {}

-- A validated attempt-1 outcome (what generator.advance returns on a gate pass),
-- and a hard-failure outcome (attempts exhausted): the two shapes the cycle emits.
local SUCCESS = {
    ok = true, validated = true, strategy = "expression",
    artifact = "{ content: payload.title }", rationale = "stub success",
    last_errors = {}, continue = false,
}
local FAILURE = {
    ok = false, validated = false, strategy = "expression", artifact = nil,
    errors = { "sample 1: output.content is required" },
    last_errors = { "sample 1: output.content is required" }, continue = false,
}

-- The stub cycle funcs the test flows reference (test_stub_pass / test_stub_fail)
-- live in gen_flow_stubs.lua so their engine-loaded closure stays minimal.

local SIMPLE_SCHEMA = { type = "object", properties = { content = { type = "string" } }, required = { "content" } }
local FLOW_RUNNER = "kickside.transform:test_run_flow"

local function runner(): any
    local actor = security.new_actor("transform_flow_test", { security_groups = { "transform_test" } })
    local policy, policy_err = security.policy("app:user")
    if not policy then error("transform test policy unavailable: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if not scope then error("transform test scope unavailable: " .. tostring(scope_err)) end
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function run_cycle(stub_func_id)
    return runner():call(FLOW_RUNNER, { stub_func_id = stub_func_id })
end

local function define_tests()
    -- The regression: a cycle that validates on attempt 1 MUST surface
    -- validated == true with the artifact as the flow output. The original bug put
    -- the flags in the fat working state behind a downstream finalize node that
    -- never received the cycle output, so validated was dropped.
    test.describe("generator flow cycle->output seam", function()
        test.it("a validated cycle outcome survives to the flow output", function()
            local out, err = run_cycle("kickside.transform:test_stub_pass")
            test.is_nil(err)
            test.not_nil(out)
            test.is_true(out.validated == true)
            test.eq(out.artifact, "{ content: payload.title }")
            test.eq(out.strategy, "expression")
        end)

        test.it("shape_proposal turns a validated outcome into an attachable proposal", function()
            local out = run_cycle("kickside.transform:test_stub_pass")
            local proposal = gen_flow.shape_proposal(out)
            test.is_true(proposal.validated)
            test.eq(proposal.artifact, "{ content: payload.title }")
        end)

        test.it("a failed cycle outcome yields validated=false with no artifact", function()
            local out, err = run_cycle("kickside.transform:test_stub_fail")
            test.is_nil(err)
            test.is_true(out.validated == false)
            test.is_nil(out.artifact)
            local proposal = gen_flow.shape_proposal(out)
            test.is_false(proposal.validated)
            test.is_nil(proposal.artifact)
            test.is_true(#(proposal.errors or {}) > 0)
        end)

        -- The upstream func -> func -> cycle chain delivers into the cycle (proves the
        -- snippet_search -> analyze -> cycle wiring, with identical schemas so analyze
        -- picks expression without an LLM judge call).
        test.it("snippet_search -> analyze -> cycle delivers the validated outcome", function()
            local out, err = runner():call(FLOW_RUNNER, {
                input = { source_schema = SIMPLE_SCHEMA, sink_schema = SIMPLE_SCHEMA, input_shape = "record", samples = { { payload = {} } } },
            })
            test.is_nil(err)
            test.is_true(out.validated == true)
            test.eq(out.artifact, "{ content: payload.title }")
        end)
    end)

    test.describe("generator strategy plumbing", function()
        test.it("resolve_strategy maps the endpoint vocabulary", function()
            test.eq(gen_flow.resolve_strategy("auto"), "auto")
            test.eq(gen_flow.resolve_strategy(nil), "expression")
            test.eq(gen_flow.resolve_strategy("expr"), "expression")
            test.eq(gen_flow.resolve_strategy("llm"), "llm")
            test.eq(gen_flow.resolve_strategy("code"), "code")
            test.eq(gen_flow.resolve_strategy("invalid"), "")
        end)

        test.it("shape_proposal emits the ready transform config for a code outcome", function()
            local proposal = gen_flow.shape_proposal({
                validated = true, strategy = "code", artifact = "return { content = 1 }",
            })
            test.is_true(proposal.validated)
            test.eq(proposal.strategy, "code")
            test.eq(proposal.transform.kind, "code")
            test.eq(proposal.transform.code, "return { content = 1 }")
        end)
    end)

    test.describe("generator build_envelope", function()
        test.it("packs the validated verdict into a compact result", function()
            local env = gen_nodes.build_envelope(SUCCESS)
            test.is_true(env.result.validated)
            test.eq(env.result.artifact, "{ content: payload.title }")
            test.is_false(env.continue)
            -- schemas/samples must NOT ride out in the emitted result
            test.is_nil(env.result.samples)
        end)

        test.it("a failure result carries errors and no artifact", function()
            local env = gen_nodes.build_envelope(FAILURE)
            test.is_false(env.result.validated)
            test.is_nil(env.result.artifact)
            test.is_true(#(env.result.errors or {}) > 0)
        end)
    end)

    -- Safety proof: a real advance() failure never leaves an artifact with empty
    -- errors -- so shape_proposal's validated==true gate can never leak a bad
    -- artifact.
    test.describe("generator advance failure invariant", function()
        test.it("a gate-failing attempt returns no artifact and non-empty errors", function()
            local state = generator.advance({
                strategy = "expression",
                attempt = 2,
                max_attempts = 3,
                allow_llm_fallback = false,
                sink_schema = SIMPLE_SCHEMA,
                input_shape = "record",
                samples = { { payload = { title = "x" } } },
                generate_fn = function() return "{ title: payload.title }" end,
            })
            test.is_false(state.validated == true)
            test.is_nil(state.artifact)
            test.is_true(#(state.last_errors or {}) > 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
function M.run(options) return run_cases(options) end

return M
