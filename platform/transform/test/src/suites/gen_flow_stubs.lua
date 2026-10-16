-- Stub cycle funcs for the flow seam regression test. Kept in their own file (no
-- test/flow requires at module scope) because the dataflow engine loads and runs
-- these as ordinary funcs -- their import closure must be minimal.

local gen_nodes = require("gen_nodes")

local M = {}

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

-- Emit the exact envelope build_envelope produces for a validated attempt-1 result.
function M.stub_pass(context: any): any return gen_nodes.build_envelope(SUCCESS) end

-- Emit a hard-failure envelope (attempts exhausted): validated=false, no artifact.
function M.stub_fail(context: any): any return gen_nodes.build_envelope(FAILURE) end

return M
