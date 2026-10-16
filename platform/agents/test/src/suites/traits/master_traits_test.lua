-- Unit tests for the master-trait decision logic: the namespace allow-list matching
-- that bounds what a master can reach, and the id-set math the curator uses to build
-- the recompiled trait set. These are the pure cores; the tool/build-func glue around
-- them is covered by the integration harness.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local master_ns = require("master_ns")
local id_set = require("id_set")
local curator_specs = require("curator_specs")
local capability_context = require("capability_context")

local CURATOR = "kickside.agents.traits:trait_curator"
local MASTER = "kickside.agents.traits:trait_master"
local ROSTER = "kickside.agents.traits:agent_roster"
local FILE_MANAGER = "kickside.uploads.traits:file_manager"
local PROMPT_FUNC = "kickside.agents.traits:active_traits_prompt"
local TOOL_FUNC = "kickside.agents.traits:trait_curator_tool"
local VALIDATE_CONTEXT_FUNC = "kickside.agents.traits:validate_trait_context"
local PROC_SCOPE = "wippy.security:process"

local function executor(context: any?): any
    local actor: any = security.new_actor("master_traits_test_user", {})
    local scope: any = security.named_scope(PROC_SCOPE)
    local e = funcs.new():with_actor(actor):with_scope(scope)
    if context then e = e:with_context(context) end
    return e
end

local function find_spec(specs: { any }, id: string): any
    for _, s in ipairs(specs) do if (s :: any).id == id then return s end end
    return nil
end

local function capability_ids(listed: any): { [string]: any }
    local out: { [string]: any } = {}
    for _, row in ipairs(listed.capabilities) do out[row.id] = row end
    return out
end

local function define_tests()
    test.describe("capability discovery", function()
        test.it("searches string tags and preserves unfiltered discovery", function()
            local listed, err = executor():call(TOOL_FUNC, { action = "list", q = "discoverystringtag" })
            test.is_nil(err)
            test.not_nil(capability_ids(listed)["app:public_trait_probe"])
            local all, all_err = executor():call(TOOL_FUNC, { action = "list", limit = 100 })
            test.is_nil(all_err)
            local probe = capability_ids(all)["app:public_trait_probe"]
            test.not_nil(probe)
            test.eq(probe.state, "available")
            test.is_nil(probe.description)
            test.is_true(all.success)

            local detailed, detailed_err = executor():call(TOOL_FUNC, {
                action = "list", q = "discoverystringtag", fields = { "description" },
            })
            test.is_nil(detailed_err)
            test.eq(type(capability_ids(detailed)["app:public_trait_probe"].description), "string")
        end)
        test.it("filters by title without bypassing namespace scope", function()
            local listed, err = executor():call(TOOL_FUNC, { action = "list", q = "Artifacts" })
            test.is_nil(err)
            local ids = capability_ids(listed)
            test.not_nil(ids["kickside.agents.traits:artifacts"])
            test.is_nil(ids["kickside.agents.traits:platform_manager"])
            local scoped, scope_err = executor({ namespaces = { "unavailable.namespace" } }):call(
                TOOL_FUNC, { action = "list", q = "Artifacts" })
            test.is_nil(scope_err)
            test.is_nil(capability_ids(scoped)["kickside.agents.traits:artifacts"])
        end)
        test.it("pages capabilities in id order with a cursor", function()
            local seen: { string } = {}
            local cursor: string? = nil
            repeat
                local page, err = executor():call(TOOL_FUNC, { action = "list", limit = 2, cursor = cursor })
                test.is_nil(err)
                test.is_true(#page.capabilities <= 2)
                for _, row in ipairs(page.capabilities) do seen[#seen + 1] = row.id end
                cursor = page.next_cursor
            until cursor == nil
            local all = executor():call(TOOL_FUNC, { action = "list", limit = 100 })
            test.eq(#seen, #all.capabilities)
            for index = 2, #seen do test.is_true(seen[index] > seen[index - 1]) end
        end)
    end)

    test.describe("master_ns.namespace_of", function()
        test.it("takes everything before the last colon", function()
            test.eq(master_ns.namespace_of("kickside.agents.traits:trait_curator"), "kickside.agents.traits")
            test.eq(master_ns.namespace_of("wippy.agent.research:agent"), "wippy.agent.research")
        end)
        test.it("maps a user agent to the synthetic user_agent namespace", function()
            test.eq(master_ns.namespace_of("user_agent:abc-123"), "user_agent")
        end)
        test.it("is empty for an id with no namespace", function()
            test.eq(master_ns.namespace_of("bare"), "")
            test.eq(master_ns.namespace_of(""), "")
        end)
    end)

    test.describe("master_ns.allowed", function()
        test.it("allows everything when unconfigured or wildcard", function()
            test.is_true(master_ns.allowed(nil, "anything:here"))
            test.is_true(master_ns.allowed({}, "user_agent:x"))
            test.is_true(master_ns.allowed({ "*" }, "wippy.agent.research:agent"))
        end)
        test.it("matches a namespace exactly", function()
            test.is_true(master_ns.allowed({ "user_agent" }, "user_agent:x"))
            test.is_true(master_ns.allowed({ "wippy.agent.research" }, "wippy.agent.research:agent"))
        end)
        test.it("matches under an entry as a dotted prefix", function()
            test.is_true(master_ns.allowed({ "wippy.agent" }, "wippy.agent.research:agent"))
            test.is_true(master_ns.allowed({ "kickside" }, "kickside.knowledge.traits:kb_reader"))
        end)
        test.it("rejects a namespace outside the list", function()
            test.is_false(master_ns.allowed({ "user_agent" }, "wippy.agent.research:agent"))
            test.is_false(master_ns.allowed({ "wippy.agent" }, "user_agent:x"))
            -- a prefix must be dotted: "wippy.age" must not match "wippy.agent.x"
            test.is_false(master_ns.allowed({ "wippy.age" }, "wippy.agent:agent"))
        end)
        test.it("rejects an id with no namespace under a real list", function()
            test.is_false(master_ns.allowed({ "user_agent" }, "bare"))
        end)
    end)

    -- test.eq compares tables by reference, so assert list contents through their
    -- joined form.
    local function joined(list: { string }): string
        return table.concat(list, ",")
    end

    test.describe("id_set", function()
        test.it("parses arrays and delimited strings into clean id lists", function()
            test.eq(joined(id_set.parse({ "a", "b", "a", "" })), "a,b")
            test.eq(joined(id_set.parse("a, b a")), "a,b")
            test.eq(joined(id_set.parse(nil)), "")
        end)
        test.it("add/remove/has are pure set ops", function()
            local base = { "a", "b" }
            test.eq(joined(id_set.add(base, "c")), "a,b,c")
            test.eq(joined(id_set.add(base, "a")), "a,b")
            test.eq(joined(base), "a,b")
            test.eq(joined(id_set.remove({ "a", "b", "c" }, "b")), "a,c")
            test.is_true(id_set.has(base, "a"))
            test.is_false(id_set.has(base, "z"))
        end)
        test.it("union keeps base ids first and de-duplicates the additions", function()
            -- the curator's full set = base traits + dynamic activations, no dupes
            test.eq(joined(id_set.union({ "curator", "roster" }, { "kb_reader", "roster" })),
                "curator,roster,kb_reader")
            test.eq(joined(id_set.union({}, { "x" })), "x")
        end)
    end)

    -- The curator emits config.traits as {id, context} specs (not plain ids) so the
    -- per-trait context survives the active-traits recompile. The critical property:
    -- the curator re-seeds its own base_traits, so a SECOND activation still unions onto
    -- the full base instead of an empty one (the bug a plain-id list caused).
    test.describe("curator_specs.build", function()
        test.it("carries each trait's config + seeds the curator and roster", function()
            local tc = { [ROSTER] = { namespaces = { "user_agent" } } }
            local specs = curator_specs.build({ CURATOR, ROSTER }, { "kb_reader" }, tc, "user_agent:a")
            test.eq(#specs, 3)
            local cur = find_spec(specs, CURATOR)
            test.not_nil(cur)
            test.eq((cur :: any).context.self_id, "user_agent:a")
            test.is_true(id_set.has(id_set.parse((cur :: any).context.base_traits), ROSTER))
            test.not_nil((cur :: any).context.trait_contexts)
            -- the dynamic set rides the curator's own context, not a separate session key
            test.is_true(id_set.has(id_set.parse((cur :: any).context.master_active), "kb_reader"))
            local ros = find_spec(specs, ROSTER)
            test.eq((ros :: any).context.self_id, "user_agent:a")
            test.eq(((ros :: any).context.namespaces or {})[1], "user_agent")
        end)

        test.it("does not feed curator runtime fields back into trait_contexts", function()
            local tc = {
                [CURATOR] = {
                    namespaces = { "test.agent" },
                    base_traits = { "bad" },
                    master_active = { "bad" },
                    master_contexts = { bad = true },
                    self_id = "bad",
                    trait_contexts = {},
                },
            }
            local specs = curator_specs.build({ CURATOR }, {}, tc, "user_agent:a")
            local cur = find_spec(specs, CURATOR)
            test.not_nil(cur)
            test.eq(((cur :: any).context.namespaces or {})[1], "test.agent")
            test.not_nil((cur :: any).context.trait_contexts)
            test.is_false((cur :: any).context.trait_contexts[CURATOR] == (cur :: any).context)
            test.eq((cur :: any).context.trait_contexts[CURATOR].base_traits, nil)
            test.eq((cur :: any).context.trait_contexts[CURATOR].master_active, nil)
            test.eq((cur :: any).context.trait_contexts[CURATOR].master_contexts, nil)
            test.eq((cur :: any).context.trait_contexts[CURATOR].self_id, nil)
            test.eq((cur :: any).context.trait_contexts[CURATOR].trait_contexts, nil)
        end)

        test.it("carries activation-time context for dynamic traits", function()
            local specs = curator_specs.build({ CURATOR }, { "kickside.knowledge.traits:kb_reader" }, {}, "user_agent:a", {
                ["kickside.knowledge.traits:kb_reader"] = { kb_ids = { "kb-1" } },
            })
            local kb = find_spec(specs, "kickside.knowledge.traits:kb_reader")
            test.not_nil(kb)
            test.eq((kb :: any).context.kb_ids[1], "kb-1")

            local cur = find_spec(specs, CURATOR)
            test.not_nil(cur)
            test.eq((cur :: any).context.master_contexts["kickside.knowledge.traits:kb_reader"].kb_ids[1], "kb-1")
        end)

        test.it("re-seeds base so a second activation keeps the base traits", function()
            local tc = {}
            -- first activation: base = the two master traits, add kb_reader
            local first = curator_specs.build({ CURATOR, ROSTER }, { "kb_reader" }, tc, "user_agent:a")
            -- simulate the recompile: the curator now reads base from its own re-seeded spec
            local cur = find_spec(first, CURATOR)
            local recompiled_base = id_set.parse((cur :: any).context.base_traits)
            -- second activation off that base: add skills
            local second = curator_specs.build(recompiled_base, { "kb_reader", "skills" }, tc, "user_agent:a")
            local ids = {}
            for _, s in ipairs(second) do ids[#ids + 1] = (s :: any).id end
            -- base traits are still present (not dropped) alongside the activations
            test.is_true(id_set.has(ids, CURATOR))
            test.is_true(id_set.has(ids, ROSTER))
            test.is_true(id_set.has(ids, "kb_reader"))
            test.is_true(id_set.has(ids, "skills"))
        end)

        test.it("re-seeds the unrestricted master trait as well as the scoped curator", function()
            local first = curator_specs.build({ MASTER }, { "kickside.fireflies.traits:reader" }, {}, "user_agent:a")
            local master = find_spec(first, MASTER)
            test.not_nil(master)
            test.is_true(id_set.has(id_set.parse((master :: any).context.base_traits), MASTER))
            test.is_true(id_set.has(id_set.parse((master :: any).context.master_active),
                "kickside.fireflies.traits:reader"))

            local second_base = id_set.parse((master :: any).context.base_traits)
            local second = curator_specs.build(second_base, {
                "kickside.fireflies.traits:reader",
                "kickside.uploads.traits:file_manager",
            }, {}, "user_agent:a")
            local ids = {}
            for _, s in ipairs(second) do ids[#ids + 1] = (s :: any).id end
            test.is_true(id_set.has(ids, MASTER))
            test.is_true(id_set.has(ids, "kickside.fireflies.traits:reader"))
            test.is_true(id_set.has(ids, "kickside.uploads.traits:file_manager"))
        end)
    end)

    test.describe("trait_curator_tool", function()
        test.it("validates activation context against the target trait schema", function()
            local result, err = executor({
                base_traits = { CURATOR },
                trait_contexts = {},
                self_id = "user_agent:a",
                namespaces = { "kickside.agents.traits" },
                trait_ids = { ROSTER },
            }):call(TOOL_FUNC, {
                action = "activate",
                trait_id = ROSTER,
                context = { namespaces = "not-a-list" },
            })

            test.is_nil(result)
            test.not_nil(err)
            test.is_true(string.find(tostring(err), "capability context invalid", 1, true) ~= nil, tostring(err))
            test.is_true(string.find(tostring(err), "namespaces expected array", 1, true) ~= nil, tostring(err))
        end)

        test.it("activates an allowed trait and carries activation context through config.traits", function()
            local result: any = executor({
                base_traits = { CURATOR },
                trait_contexts = {},
                self_id = "user_agent:a",
                namespaces = { "kickside.agents.traits" },
                trait_ids = { ROSTER },
            }):call(TOOL_FUNC, {
                action = "activate",
                trait_id = ROSTER,
                context = { namespaces = { "user_agent" } },
            })

            test.not_nil(result)
            local traits = (result._control.config.traits :: { any })
            test.not_nil(traits)

            local roster = find_spec(traits, ROSTER)
            test.not_nil(roster)
            test.eq((roster :: any).context.namespaces[1], "user_agent")
            test.eq((roster :: any).context.self_id, "user_agent:a")

            local curator = find_spec(traits, CURATOR)
            test.not_nil(curator)
            test.eq((curator :: any).context.master_contexts[ROSTER].namespaces[1], "user_agent")
        end)

        test.it("rejects a trait outside the configured trait picker", function()
            local result, err = executor({
                base_traits = { CURATOR },
                trait_contexts = {},
                self_id = "user_agent:a",
                namespaces = { "kickside.agents.traits" },
                trait_ids = { CURATOR },
            }):call(TOOL_FUNC, {
                action = "activate",
                trait_id = ROSTER,
            })

            test.is_nil(result)
            test.not_nil(err)
            test.is_true(string.find(tostring(err), "outside this agent's selected capability scope", 1, true) ~= nil, tostring(err))
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)

        test.it("describes file management as directly activatable", function()
            local result = executor({
                base_traits = { CURATOR },
                trait_contexts = {},
                self_id = "user_agent:a",
                namespaces = { "kickside.uploads.traits" },
                trait_ids = { FILE_MANAGER },
            }):call(TOOL_FUNC, {
                action = "list",
                fields = { "description" },
            })

            local manager = capability_ids(result)[FILE_MANAGER]
            test.not_nil(manager)
            test.contains(manager.description, "activate it directly")
        end)
    end)

    test.describe("capability_context", function()
        test.it("retains field guidance when a context field also has a title", function()
            local summary = capability_context.summary({ properties = {
                root_ids = { type = "array", title = "Roots", role = "picker",
                    description = "Use CollectionFind ids, never names.", items = { type = "string" } },
                limit = { type = "integer", title = "Limit", description = "Maximum result count." },
            } })
            test.contains(summary, "Roots")
            test.contains(summary, "Use CollectionFind ids, never names.")
            test.contains(summary, "Limit")
            test.contains(summary, "Maximum result count.")
        end)

        test.it("preserves absent-description output and the existing summary budget", function()
            test.eq(capability_context.summary({ properties = {
                root_ids = { type = "array", title = "Roots", role = "picker" },
            } }), "Context: root_ids (optional, picker) - Roots")
            local summary = capability_context.summary({ properties = {
                root_ids = { type = "array", title = "Roots", role = "picker",
                    description = string.rep("Resolve ids. ", 50) },
            } })
            test.contains(summary, "Roots")
            test.contains(summary, "Resolve ids.")
            test.is_true(#summary < 260, summary)
            test.contains(summary, "...")
        end)

        test.it("exposes a callable trait context validator", function()
            local bad: any = executor():call(VALIDATE_CONTEXT_FUNC, {
                trait_id = ROSTER,
                context = { namespaces = "wrong" },
            })
            test.eq(bad.ok, false)
            test.ok((tostring(bad.error):find("namespaces expected array", 1, true)))

            local good: any = executor():call(VALIDATE_CONTEXT_FUNC, {
                trait_id = ROSTER,
                context = { namespaces = { "user_agent" } },
            })
            test.eq(good.ok, true)
            test.eq(#good.missing, 0)
            test.eq(#good.mismatched, 0)
        end)

        test.it("validates required fields, extra fields, and array item types", function()
            local schema: any = {
                type = "object",
                required = { "kb_ids" },
                additionalProperties = false,
                properties = {
                    kb_ids = { type = "array", items = { type = "string" } },
                    write_enabled = { type = "boolean" },
                },
            }
            local bad = capability_context.validate(schema, { kb_ids = { "kb", 10 }, extra = true })
            test.is_false(bad.ok)
            test.eq(#bad.missing, 0)
            test.eq(#bad.mismatched, 2)

            local not_object = capability_context.validate(schema, "wrong")
            test.is_false(not_object.ok)
            test.eq(not_object.mismatched[1].field, "context")

            local missing = capability_context.validate(schema, { write_enabled = true })
            test.is_false(missing.ok)
            test.eq(missing.missing[1], "kb_ids")

            local good = capability_context.validate(schema, { kb_ids = { "kb" }, write_enabled = false })
            test.is_true(good.ok)
        end)

        test.it("preserves empty object schemas and contexts at the JSON boundary", function()
            test.is_true(capability_context.validate({ type = "object", properties = {}, additionalProperties = false }, {}).ok)
            test.is_true(capability_context.validate({ type = "object" }, {}).ok)
        end)

        test.it("enforces nested requirements and JSON Schema value constraints", function()
            local schema = { type = "object", properties = {
                settings = { type = "object", required = { "mode" }, additionalProperties = false,
                    properties = { mode = { enum = { "read", "write" } } } },
                count = { type = "integer", minimum = 1, maximum = 10 },
                name = { type = "string", pattern = "^[a-z]+$", maxLength = 4 },
            } }
            for _, context in ipairs({ { settings = {} }, { settings = { mode = "unknown" } },
                { settings = { mode = "read", extra = true } }, { count = 0 }, { count = 11 },
                { name = "INVALID" }, { name = "longname" } }) do
                test.is_false(capability_context.validate(schema, context).ok)
            end
            test.is_true(capability_context.validate(schema, {
                settings = { mode = "read" }, count = 3, name = "name" }).ok)
        end)

        test.it("bounds context size, depth, and summary length", function()
            local schema: any = {
                type = "object",
                properties = {
                    prompt = { type = "string", title = string.rep("x", 220) },
                    ids = { type = "array", items = { type = "string" } },
                    nested = { type = "object" },
                },
                additionalProperties = false,
            }

            local function checked(label: string, context: any): any
                local out: any = nil
                local ok, err = pcall(function()
                    out = capability_context.validate(schema, context)
                end)
                test.is_true(ok, label .. ": " .. tostring(err))
                return out
            end

            local function checked_schema(label: string, s: any, context: any): any
                local out: any = nil
                local ok, err = pcall(function()
                    out = capability_context.validate(s, context)
                end)
                test.is_true(ok, label .. ": " .. tostring(err))
                return out
            end

            checked_schema("minimal string", {
                type = "object",
                properties = { prompt = { type = "string" } },
                additionalProperties = false,
            }, { prompt = "ok" })
            checked_schema("minimal max string", {
                type = "object",
                properties = { prompt = { type = "string" } },
                additionalProperties = false,
            }, { prompt = string.rep("x", 8193) })

            local many_ids: { string } = {}
            for i = 1, 201 do many_ids[#many_ids + 1] = "id-" .. tostring(i) end

            checked("prompt", { prompt = string.rep("x", 8193) })
            checked("ids", { ids = many_ids })
            checked("nested", { nested = { a = { b = { c = { d = true } } } } })
            checked("extra", { extra = true })

            local bad = checked("combined", {
                prompt = string.rep("x", 8193),
                ids = many_ids,
                nested = { a = { b = { c = { d = true } } } },
                extra = true,
            })

            test.is_false(bad.ok)
            local message = capability_context.error_message(bad)
            test.ok(message:find("prompt expected length <= 8192", 1, true), message)
            test.ok(message:find("ids expected at most 200 items", 1, true), message)
            test.ok(message:find("nested.a.b.c.d expected depth <= 4", 1, true), message)
            test.ok(message:find("extra expected declared context field", 1, true), message)

            local summary = capability_context.summary(schema)
            test.is_true(#summary < 260, summary)
            test.ok(summary:find("...", 1, true), summary)
        end)

        test.it("validates selected trait contexts against each trait schema", function()
            local function get_entry(id: string): any
                if id == "trait:kb" then
                    return {
                        id = id,
                        meta = {
                            type = "agent.trait",
                            context_schema = {
                                type = "object",
                                required = { "kb_id" },
                                properties = {
                                    kb_id = { type = "string" },
                                },
                                additionalProperties = false,
                            },
                        },
                    }, nil
                end
                return nil, "not found"
            end

            local bad = capability_context.validate_trait_contexts(
                { "trait:kb" },
                { ["trait:kb"] = { kb_id = 9 }, ["trait:extra"] = {} },
                get_entry
            )
            test.is_false(bad.ok)
            test.ok((capability_context.error_message(bad):find("trait:extra expected selected capability", 1, true)))
            test.ok((capability_context.error_message(bad):find("trait:kb.kb_id expected string", 1, true)))

            local good = capability_context.validate_trait_contexts(
                { "trait:kb" },
                { ["trait:kb"] = { kb_id = "kb-1" } },
                get_entry
            )
            test.is_true(good.ok)
        end)
    end)

    test.describe("active_traits_prompt", function()
        test.it("injects a selected stable trait catalog only when enabled", function()
            local out = tostring(executor({
                inject_trait_catalog = true,
                trait_ids = { CURATOR },
            }):call(PROMPT_FUNC))
            test.is_true(string.find(out, "## Capabilities you can activate", 1, true) ~= nil, out)
            test.is_true(string.find(out, CURATOR, 1, true) ~= nil, out)
            test.is_false(string.find(out, ROSTER, 1, true) ~= nil, out)
        end)

        test.it("is empty when no traits are active and catalog injection is disabled", function()
            local out = tostring(executor({}):call(PROMPT_FUNC))
            test.eq(out, "")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
