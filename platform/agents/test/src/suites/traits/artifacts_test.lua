local test = require("test")
local funcs = require("funcs")
local registry = require("registry")
local security = require("security")

local TRAIT_ID = "kickside.agents.traits:artifacts"
local TOOL_ID = "kickside.agents.traits:create_artifact"

local function call_tool(args)
    local actor = security.new_actor("artifact_test_user", {})
    local scope = security.named_scope("wippy.security:process")
    return funcs.new():with_actor(actor):with_scope(scope):call(TOOL_ID, args)
end

local function define_tests()
    test.describe("Artifacts capability", function()
        test.it("rejects fenced chart configuration and JSON mislabeled as HTML", function()
            for _, content in ipairs({ '```chart\n{"type":"bar"}\n```', '{"type":"bar"}', '  [47,12]' }) do
                local result, err = call_tool({ title = "Chart", content_type = "text/html", content = content })
                test.is_nil(result)
                test.not_nil(err)
                test.contains(tostring(err), "HTML")
            end
        end)

        test.it("accepts a self-contained SVG bar chart as HTML", function()
            local html = '<!doctype html><html><body><svg viewBox="0 0 100 60"><rect width="47" height="10"/><rect y="20" width="12" height="10"/></svg></body></html>'
            local result, err = call_tool({ title = "Chart", content_type = "text/html", content = html })
            test.is_nil(err, tostring(err))
            test.eq(result._control.artifacts[1].content, html)
            test.eq(result._control.artifacts[1].content_type, "text/html")
        end)

        test.it("registers the public capability and capability-only tool", function()
            local trait, trait_err = registry.get(TRAIT_ID)
            test.is_nil(trait_err, tostring(trait_err))
            test.not_nil(trait)
            test.eq(trait.kind, "registry.entry")
            test.eq(trait.meta.type, "agent.trait")
            test.is_true(trait.meta.public)
            test.eq((trait.data.tools or {})[1], TOOL_ID)

            local tool, tool_err = registry.get(TOOL_ID)
            test.is_nil(tool_err, tostring(tool_err))
            test.not_nil(tool)
            test.eq(tool.kind, "function.lua")
            test.eq(tool.meta.type, "tool")
            test.is_nil(tool.meta.public)
            test.eq(tool.meta.llm_alias, "CreateArtifact")
        end)

        test.it("emits standalone artifact control data by default", function()
            local result, err = call_tool({
                title = "Standalone notes",
                content = "# Notes",
                content_type = "text/markdown",
            })
            test.is_nil(err, tostring(err))
            test.is_true(result.success)
            local artifact = result._control.artifacts[1]
            test.eq(artifact.title, "Standalone notes")
            test.eq(artifact.content, "# Notes")
            test.eq(artifact.content_type, "text/markdown")
            test.eq(artifact.display_type, "standalone")
            test.is_false(artifact.instructions)
        end)

        test.it("defaults omitted text content types to published Markdown semantics", function()
            for _, content in ipairs({ "# Notes", '<div id="chart"></div>' }) do
                local result, err = call_tool({ title = "Typed artifact", content = content })
                test.is_nil(err, tostring(err))
                test.eq(result._control.artifacts[1].content, content)
                test.eq(result._control.artifacts[1].content_type, "text/markdown")
            end
        end)

        test.it("keeps inline mode explicit", function()
            local result, err = call_tool({
                title = "Inline notes",
                content = "Supporting detail",
                content_type = "text/markdown",
                instructions = true,
            })
            test.is_nil(err, tostring(err))
            local artifact = result._control.artifacts[1]
            test.eq(artifact.display_type, "inline")
            test.is_true(artifact.instructions)
        end)

        test.it("rejects component tags outside the approved live catalog", function()
            local result, err = call_tool({
                title = "Status card",
                tag_name = "unregistered-example-status-card",
                props = { status = "ready" },
            })
            test.is_nil(result)
            test.not_nil(err)
            test.contains(tostring(err), "not an approved auto-registered component", tostring(err))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
