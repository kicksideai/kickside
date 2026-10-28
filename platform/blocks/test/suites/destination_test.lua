-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local subject = require("subject")
local fixture = require("fixture")
local consts = require("consts")
local function cases()
    test.describe("Blocks Dataflow inspection boundary", function()
        test.before_each(function() fixture.state = {} end)
        test.it("delegates flow reads to Dataflow", function()
            fixture.state.flow = {actor_id = "owner", metadata = {run_id = "run"}}
            local row, err = subject.get("flow")
            test.is_nil(err)
            test.eq(row.actor_id, "owner")
            test.eq(row.metadata.run_id, "run")
            test.eq(fixture.state.flow_id, "flow")
        end)
        test.it("uses Dataflow's signal lookup for the exact Await node type", function()
            fixture.state.node = {node_id = "parked"}
            local node, err = subject.pending("flow", "signal", {status = consts.STATUS.RUNNING})
            test.is_nil(err)
            test.eq(node.node_id, "parked")
            test.eq(fixture.state.flow_id, "flow")
            test.eq(fixture.state.signal_id, "signal")
            test.eq(fixture.state.node_type, "kickside.blocks:await")
        end)
        for _, case in ipairs({
            {source = "DATAFLOW_FLOW_NOT_FOUND", target = "BLOCK_FLOW_NOT_FOUND", kind = errors.NOT_FOUND, flow = true},
            {source = "DATAFLOW_FLOW_METADATA_INVALID", target = "BLOCK_FLOW_METADATA_INVALID", kind = errors.INTERNAL, flow = true},
            {source = "DATAFLOW_SIGNAL_NOT_FOUND", target = "BLOCK_SIGNAL_NOT_FOUND", kind = errors.NOT_FOUND},
            {source = "DATAFLOW_SIGNAL_STATE_INVALID", target = "BLOCK_SIGNAL_STATE_INVALID", kind = errors.INTERNAL},
        }) do
            test.it("maps the owner-confirmed " .. case.source, function()
                fixture.state.failure = errors.new({message = "owner failure", kind = case.kind,
                    retryable = false, details = {code = case.source}})
                local result, err
                if case.flow then result, err = subject.get("flow")
                else result, err = subject.pending("flow", "signal", {status = consts.STATUS.RUNNING}) end
                test.is_nil(result)
                test.is_true(errors.is(err, case.kind))
                test.eq(err:details().code, case.target)
                test.eq(err:retryable(), false)
            end)
        end
        for _, case in ipairs({
            {kind = errors.NOT_FOUND, code = "database_resource_missing", retryable = false},
            {kind = errors.PERMISSION_DENIED, code = "database_denied", retryable = false},
            {kind = errors.UNAVAILABLE, code = "database_temporarily_unavailable", retryable = true},
        }) do
            test.it("does not mistake " .. case.code .. " for an absent destination", function()
                fixture.state.failure = errors.new({message = "read failed", kind = case.kind,
                    retryable = case.retryable, details = {code = case.code, provider = "fixture"}})
                for _, call in ipairs({
                    function() return subject.get("flow") end,
                    function() return subject.pending("flow", "signal", {status = consts.STATUS.RUNNING}) end,
                }) do
                    local result, err = call()
                    test.is_nil(result)
                    test.is_true(errors.is(err, case.kind))
                    test.eq(err:details().code, case.code)
                    test.eq(err:details().provider, "fixture")
                    test.eq(err:retryable(), case.retryable)
                end
            end)
        end
        test.it("recognizes a terminal flow without another read", function()
            local node, err = subject.pending("flow", "signal", {status = consts.STATUS.COMPLETED_SUCCESS})
            test.is_nil(node)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            test.eq(err:details().code, "BLOCK_SIGNAL_NOT_FOUND")
            test.eq(fixture.state.calls, nil)
        end)
    end)
end
return {run = test.run_cases(cases)}
