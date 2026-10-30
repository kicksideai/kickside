local test = require("test")
local visibility = require("tool_visibility")
local capability_visibility = require("capability_visibility")

local function define_tests()
    test.describe("tool discovery visibility", function()
        test.it("requires an exact public boolean and canonical tool shape", function()
            test.is_true(visibility.entry_is_public_tool({
                kind = "function.lua",
                meta = { type = "tool", public = true },
            }))
            test.is_false(visibility.entry_is_public_tool({
                kind = "function.lua",
                meta = { type = "tool", class = "public", tags = { "public" } },
            }))
            test.is_false(visibility.entry_is_public_tool({
                kind = "function.lua",
                meta = { type = "tool", public = false },
            }))
            test.is_false(visibility.entry_is_public_tool({
                kind = "function.lua",
                meta = { type = "tool", public = "true" },
            }))
            test.is_false(visibility.entry_is_public_tool({
                kind = "function.lua",
                meta = { type = "tool", public = 1 },
            }))
            test.is_false(visibility.entry_is_public_tool({
                kind = "function.lua",
                meta = { type = "tool", public = true, private = true },
            }))
            test.is_false(visibility.entry_is_public_tool({
                kind = "function.lua",
                meta = { type = "tool", public = true, private = "false" },
            }))
            test.is_false(visibility.entry_is_public_tool({
                kind = "library.lua",
                meta = { type = "tool", public = true },
            }))
            test.is_false(visibility.entry_is_public_tool({
                kind = "function.lua",
                meta = { type = "agent.trait", public = true },
            }))
            test.is_false(visibility.entry_is_public_tool({ kind = "function.lua" }))
            test.is_false(visibility.entry_is_public_tool(nil))
        end)

        test.it("treats private metadata as opted out and malformed flags as closed", function()
            test.is_true(visibility.meta_is_private({ type = "tool", private = true }))
            test.is_true(visibility.meta_is_private({ type = "tool", public = true, private = "yes" }))
            test.is_true(visibility.meta_is_private(nil))
            test.is_false(visibility.meta_is_private({ type = "tool" }))
            test.is_false(visibility.meta_is_private({ type = "tool", public = true, private = false }))
        end)

        test.it("requires the canonical public trait shape", function()
            test.is_true(capability_visibility.entry_is_public_trait({
                kind = "registry.entry",
                meta = { type = "agent.trait", public = true },
            }))
            test.is_false(capability_visibility.entry_is_public_trait({
                kind = "function.lua",
                meta = { type = "agent.trait", public = true },
            }))
            test.is_false(capability_visibility.entry_is_public_trait({
                kind = "registry.entry",
                meta = { type = "tool", public = true },
            }))
            test.is_false(capability_visibility.entry_is_public_trait({
                kind = "registry.entry",
                meta = { type = "agent.trait", public = "true" },
            }))
            test.is_false(capability_visibility.entry_is_public_trait({
                kind = "registry.entry",
                meta = { type = "agent.trait", public = true, private = true },
            }))
        end)

        test.it("preserves transient registry error details and stops at the failed read", function()
            for _, capability_type in ipairs({"trait", "tool"}) do
                local reads = 0
                local cause = errors.new({kind = errors.UNAVAILABLE, message = "registry offline",
                    retryable = true, details = {provider = "test-registry"}})
                local ok, err = capability_visibility.validate_ids({"test:first", "test:second"}, capability_type, function()
                    reads = reads + 1
                    return nil, cause
                end)
                test.is_false(ok)
                test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
                test.is_true(err:retryable())
                test.eq(err:details().provider, "test-registry")
                test.contains(tostring(err), "registry offline")
                test.eq(reads, 1)
            end
        end)
        test.it("keeps missing capabilities as validation errors", function()
            for _, missing_error in ipairs({false, true}) do
                local ok, err = capability_visibility.validate_ids({"test:missing"}, "trait", function()
                    if missing_error then return nil, errors.new({kind = errors.NOT_FOUND, message = "missing entry"}) end
                    return nil, nil
                end)
                test.is_false(ok)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.contains(tostring(err), "trait not found: test:missing")
            end
        end)

        test.it("validates ids through the caller-provided registry seam", function()
            local entries = {
                ["test:public_trait"] = {
                    id = "test:public_trait",
                    kind = "registry.entry",
                    meta = { type = "agent.trait", public = true },
                },
                ["test:internal_trait"] = {
                    id = "test:internal_trait",
                    kind = "registry.entry",
                    meta = { type = "agent.trait" },
                },
                ["test:public_tool"] = {
                    id = "test:public_tool",
                    kind = "function.lua",
                    meta = { type = "tool", public = true },
                },
                ["test:wrong_kind_tool"] = {
                    id = "test:wrong_kind_tool",
                    kind = "library.lua",
                    meta = { type = "tool", public = true },
                },
            }
            local function get_entry(id)
                if not entries[id] then return nil, errors.new({kind = errors.NOT_FOUND, message = "not found"}) end
                return entries[id], nil
            end

            local ok, err = capability_visibility.validate_ids({ "test:public_trait" }, "trait", get_entry)
            test.is_true(ok)
            test.is_nil(err)
            ok, err = capability_visibility.validate_ids({ "test:public_tool" }, "tool", get_entry)
            test.is_true(ok)
            test.is_nil(err)

            ok, err = capability_visibility.validate_ids({ "test:internal_trait" }, "trait", get_entry)
            test.is_false(ok)
            test.ok((tostring(err):find("not public", 1, true)))
            ok, err = capability_visibility.validate_ids({ "test:wrong_kind_tool" }, "tool", get_entry)
            test.is_false(ok)
            test.ok((tostring(err):find("invalid registry shape", 1, true)))
            ok, err = capability_visibility.validate_ids({ "keeper.hub.tools:dependencies" }, "tool", get_entry)
            test.is_false(ok)
            test.ok((tostring(err):find("not found", 1, true)))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
