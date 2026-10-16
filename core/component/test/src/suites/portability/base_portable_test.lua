local test = require("test")
local base = require("base_portable")

-- A binding's trusted, locally-installed schema (what import authority comes from).
local AGENT_SCHEMA = { context = true, refs = { { key = "memory_target_id", path = "/memory_target_id", contract = "kickside.contract:embeddable", required = false } } }
local AGENT_CRED = { fields = {} }
local CONN_SCHEMA = nil -- shell only, nothing portable
local CONN_CRED = { fields = { { key = "api_key" } } }

local function define_tests()
    test.describe("base_portable domain", function()
        test.it("extracts credential keys", function()
            local keys = base.credential_keys({ fields = { { key = "api_key" }, { key = "site_url" }, { bad = 1 } } })
            test.eq(#keys, 2)
            test.eq(keys[1], "api_key")
            test.eq(#base.credential_keys(nil), 0)
        end)

        test.it("portable_context honors the allowlist and drops credentials at EVERY depth", function()
            local ctx = { prompt = "hi", model = "m", api_key = "TOP", settings = { api_key = "NESTED", region = "eu" } }
            local all = base.portable_context(ctx, { context = true }, { "api_key" })
            test.eq(all.prompt, "hi")
            test.is_nil(all.api_key)              -- top-level credential gone
            test.eq(all.settings.region, "eu")
            test.is_nil(all.settings.api_key)     -- nested credential gone too
            -- deep copy: mutating the source must not change the export
            ctx.settings.region = "us"
            test.eq(all.settings.region, "eu")
            -- list mode
            local some = base.portable_context(ctx, { context = { "prompt", "api_key" } }, { "api_key" })
            test.eq(some.prompt, "hi")
            test.is_nil(some.model)
            test.is_nil(some.api_key)
        end)

        test.it("portable_meta is an allowlist: drops owner/unlisted, keeps safe + schema-declared", function()
            local m = base.portable_meta(
                { title = "Agent", class = "agent", owner = "u1", access = "secret", kb_type = "document" },
                { meta = { "kb_type" } }
            )
            test.eq(m.title, "Agent")
            test.eq(m.class, "agent")
            test.eq(m.kb_type, "document")   -- schema-declared config carried
            test.is_nil(m.owner)
            test.is_nil(m.access)            -- unlisted key dropped
        end)

        test.it("build_envelope is versioned and secret-free", function()
            local env = base.build_envelope({
                impl_id = "kickside.agents:user_agent", source_component_id = "src-1",
                meta = { title = "A", owner = "u1" },
                private_context = { prompt = "p", api_key = "SECRET" },
                portable_schema = { context = true }, credential_schema = { fields = { { key = "api_key" } } },
            })
            test.eq(env.schema_version, base.SCHEMA_VERSION)
            test.eq(env.context.prompt, "p")
            test.is_nil(env.context.api_key)
            test.is_nil(env.meta.owner)
            test.eq(env.slots[1].key, "api_key")
        end)

        test.it("parse_envelope validates version and impl_id", function()
            local ok = base.parse_envelope({ schema_version = base.SCHEMA_VERSION, impl_id = "x" })
            test.not_nil(ok)
            local _, e1 = base.parse_envelope({ schema_version = 999, impl_id = "x" })
            test.not_nil(e1)
            test.is_true(errors.is(e1, errors.INVALID))
            local _, e2 = base.parse_envelope({ schema_version = base.SCHEMA_VERSION, impl_id = "" })
            test.not_nil(e2)
            test.is_true(errors.is(e2, errors.INVALID))
        end)

        test.it("set_path: strict — rejects empty/root and non-table collisions", function()
            local t: any = {}
            local ok = base.set_path(t, "/trait_contexts/kickside.foo:trait/connection_id", "C")
            test.is_true(ok)
            test.eq(t.trait_contexts["kickside.foo:trait"].connection_id, "C")
            local ok2, e2 = base.set_path(t, "", "x")
            test.is_true(not ok2); test.not_nil(e2)
            test.is_true(errors.is(e2, errors.INVALID))
            local ok3, e3 = base.set_path(t, "/", "x")
            test.is_true(not ok3); test.not_nil(e3)
            test.is_true(errors.is(e3, errors.INVALID))
            local clash: any = { a = "scalar" }
            local ok4, e4 = base.set_path(clash, "/a/b", "x")   -- would clobber a scalar
            test.is_true(not ok4); test.not_nil(e4)
            test.is_true(errors.is(e4, errors.INVALID))
            test.eq(clash.a, "scalar")                          -- untouched
        end)

        test.it("resolve_context derives slots from TRUSTED schema, ignoring blob-fabricated slots/paths", function()
            -- hostile envelope: a fabricated slot pointing at an arbitrary path, plus a
            -- credential nested in context. The trusted schema (AGENT) has no such slot.
            local hostile = {
                schema_version = base.SCHEMA_VERSION, impl_id = "kickside.agents:user_agent",
                context = { prompt = "p", creds = { api_key = "LEAK" } },
                slots = { { key = "anything", kind = "component_ref", path = "/evil/x", required = false } },
            }
            -- A slot_value for the blob's fabricated slot is rejected — only trusted slots exist.
            local _, e1 = base.resolve_context(AGENT_SCHEMA, AGENT_CRED, hostile, { anything = "z" }, { components = {} })
            test.not_nil(e1)
            test.is_true(errors.is(e1, errors.INVALID))
            -- And nothing was ever written to the fabricated "/evil/x" path.
            local ctx = base.resolve_context(AGENT_SCHEMA, AGENT_CRED, hostile, {}, { components = {} })
            test.eq(ctx.prompt, "p")
            test.is_nil(ctx.evil)
        end)

        test.it("resolve_context remaps component_ref via id_map and errors on dangling", function()
            local env = { schema_version = base.SCHEMA_VERSION, impl_id = "kickside.agents:user_agent", context = { prompt = "p" }, slots = {} }
            local ctx, err = base.resolve_context(AGENT_SCHEMA, AGENT_CRED, env,
                { memory_target_id = "src-kb" }, { components = { ["src-kb"] = "new-kb" } })
            test.is_nil(err)
            test.eq(ctx.memory_target_id, "new-kb")
            -- dangling: provided ref not in id_map -> error, never persists the source id
            local _, e2 = base.resolve_context(AGENT_SCHEMA, AGENT_CRED, env,
                { memory_target_id = "ghost" }, { components = {} })
            test.not_nil(e2)
            test.is_true(errors.is(e2, errors.INVALID))
        end)

        test.it("resolve_context enforces required credential slots", function()
            local env = { schema_version = base.SCHEMA_VERSION, impl_id = "x", context = {}, slots = {} }
            local ctx, err = base.resolve_context(CONN_SCHEMA, CONN_CRED, env, { api_key = "K" }, {})
            test.is_nil(err)
            test.eq(ctx.api_key, "K")
            local _, e2 = base.resolve_context(CONN_SCHEMA, CONN_CRED, env, {}, {})
            test.not_nil(e2)   -- required credential not provided
            test.is_true(errors.is(e2, errors.INVALID))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
