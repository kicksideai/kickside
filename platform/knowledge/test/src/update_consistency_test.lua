local test = require("test")
local consistency = require("update_consistency")

local function changes(): any
    return {
        meta_fields = { title = "After", comment = "New description" },
        config_patch = { chunk_size = 500 },
    }
end

local function collaborators(overrides: any?): any
    local calls: { any } = {}
    local c: any = {
        calls = calls,
        get_component = function(component_id: string): (any, any)
            calls[#calls + 1] = { op = "get_component", component_id = component_id }
            return { component_id = component_id, impl_id = "test:kb", meta = { kb_type = "test" } }, nil
        end,
        prepare_config = function(_component_id: string, _component: any, patch: any): (any, any)
            calls[#calls + 1] = { op = "prepare_config", patch = patch }
            return {
                current_config = { chunk_size = 100, retained = true },
                effective_config = { chunk_size = 100, retained = true },
                desired_config = { chunk_size = 500, retained = true },
            }, nil
        end,
        update_config = function(_component_id: string, _plan: any, config: any): (any, any)
            calls[#calls + 1] = { op = "update_config", config = config }
            return true, nil
        end,
        set_meta = function(_component_id: string, fields: any): (boolean, any)
            calls[#calls + 1] = { op = "set_meta", fields = fields }
            return true, nil
        end,
    }
    for key, value in pairs(overrides or {}) do c[key] = value end
    return c
end

local function define_tests()
    test.describe("knowledge update compensated consistency", function()
        test.it("compares maintenance edits with descriptor defaults before scheduling", function()
            local plan, err = consistency.config_plan({}, { summary_prompt = "" }, function(config: any): any
                config.summary_prompt = ""
                config.summary_max_chars = 2400
                return config
            end)
            test.is_nil(err)
            test.eq(plan.effective_config.summary_max_chars, 2400)
            local c = collaborators({ prepare_config = function() return plan, nil end })
            plan.config_maintenance = { schedule_resummarize = { "summary_prompt", "summary_max_chars" } }
            c.request_maintenance = function() error("default-only save schedules maintenance") end
            local ok, apply_err = consistency.apply("kb-1", { config_patch = {} }, c)
            test.is_nil(apply_err)
            test.is_true(ok)
        end)

        test.it("writes only changed effective config and metadata on repeated updates", function()
            local current = {}
            local meta = { comment = "Before", icon = "book" }
            local config_writes, meta_writes = 0, 0
            local last_meta: any = nil
            local c = collaborators({
                get_component = function() return { meta = meta }, nil end,
                prepare_config = function(_, _, patch)
                    return consistency.config_plan(current, patch, function(config)
                        if config.enabled == nil then config.enabled = false end
                        return config
                    end)
                end,
                update_config = function(_, _, config)
                    config_writes = config_writes + 1
                    current = config
                    return true, nil
                end,
                set_meta = function(_, fields)
                    meta_writes = meta_writes + 1
                    last_meta = fields
                    for key, value in pairs(fields) do meta[key] = value end
                    return true, nil
                end,
            })
            local function apply(fields, patch)
                local ok, err = consistency.apply("kb-repeat", { meta_fields = fields, config_patch = patch }, c)
                test.is_nil(err, tostring(err))
                test.is_true(ok)
            end
            apply({ comment = "Before", icon = "book" }, { enabled = false })
            test.eq(config_writes, 0, "effective defaults cause no store write")
            test.eq(meta_writes, 0, "matching metadata causes no write")
            local fields = { comment = "After", icon = "" }
            local patch = { enabled = true, nested = { labels = { "one", "two" } } }
            apply(fields, patch)
            test.eq(config_writes, 1)
            test.eq(meta_writes, 1)
            apply(fields, { nested = { labels = { "one", "two" } }, enabled = true })
            test.eq(config_writes, 1, "identical config causes no second write")
            test.eq(meta_writes, 1, "identical metadata causes no second write")
            apply({ comment = "", icon = "" }, { enabled = true })
            test.eq(config_writes, 1, "a partial matching config causes no write")
            test.eq(meta_writes, 2)
            test.is_nil(last_meta.icon, "only changed metadata fields are written")
            test.eq(meta.comment, "")
            test.eq(meta.icon, "")
            apply(nil, { enabled = false })
            test.eq(config_writes, 2, "false remains a change from true")
            test.eq(meta_writes, 2)
        end)

        for _, key in ipairs({ "summary_model", "summary_prompt", "summary_max_chars" }) do
            test.it("schedules maintenance after saving a changed " .. key, function()
                local c = collaborators({ prepare_config = function()
                    return { current_config = {}, effective_config = { [key] = "old" },
                        desired_config = { [key] = "new" },
                        config_maintenance = { schedule_resummarize = { key } } }, nil
                end })
                c.request_maintenance = function(id: string, _plan: any, method: string)
                    test.eq(id, "kb-1")
                    test.eq(method, "schedule_resummarize")
                    test.eq(c.calls[#c.calls].op, "update_config")
                    c.calls[#c.calls + 1] = { op = "maintenance" }
                    return true, nil
                end
                local ok, err = consistency.apply("kb-1", changes(), c)
                test.is_nil(err)
                test.is_true(ok)
                test.eq(c.calls[#c.calls - 1].op, "maintenance")
                test.eq(c.calls[#c.calls].op, "set_meta")
            end)
        end

        test.it("restores configuration after a refused summary maintenance request", function()
            local c = collaborators({ prepare_config = function()
                return { current_config = {}, effective_config = { summary_prompt = "old" },
                    desired_config = { summary_prompt = "new" },
                    config_maintenance = { schedule_resummarize = { "summary_prompt" } } }, nil
            end })
            c.request_maintenance = function() return nil, "maintenance schedule refused" end
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(ok)
            test.eq(err.stage, "maintenance_request")
            test.contains(err.message, "maintenance schedule refused")
            test.eq(c.calls[#c.calls].op, "update_config")
            test.is_nil(next(c.calls[#c.calls].config))
            for _, call in ipairs(c.calls) do test.neq(call.op, "set_meta") end
        end)

        test.it("schedules engine-declared maintenance for a changed engine-specific config key", function()
            local scheduled = 0
            local c = collaborators({ prepare_config = function()
                return { current_config = { outline_style = "old" }, effective_config = { outline_style = "old" },
                    desired_config = { outline_style = "new" },
                    config_maintenance = { schedule_resummarize = { "outline_style" } } }, nil
            end })
            c.request_maintenance = function(id, plan, method)
                test.eq(id, "kb-1")
                test.eq(method, "schedule_resummarize")
                test.eq(c.calls[#c.calls].op, "update_config")
                scheduled = scheduled + 1
                return { scheduled = true }, nil
            end
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(err)
            test.is_true(ok)
            test.eq(scheduled, 1)
        end)

        test.it("restores config and leaves metadata untouched when declared maintenance refuses scheduling", function()
            local c = collaborators({ prepare_config = function()
                return { current_config = { outline_style = "old" }, effective_config = { outline_style = "old" },
                    desired_config = { outline_style = "new" },
                    config_maintenance = { schedule_resummarize = { "outline_style" } } }, nil
            end })
            c.request_maintenance = function() return nil, "maintenance unavailable" end
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(ok)
            test.eq(err.stage, "maintenance_request")
            test.contains(err.message, "maintenance unavailable")
            test.eq(c.calls[#c.calls].op, "update_config")
            test.eq(c.calls[#c.calls].config.outline_style, "old")
            for _, call in ipairs(c.calls) do test.neq(call.op, "set_meta") end
        end)

        test.it("keeps the rollback snapshot isolated from defaults and nested patch values", function()
            local current = { nested = { keep = "old" } }
            local patch = { nested = { keep = "new" } }
            local plan, err = consistency.config_plan(current, patch, function(config: any): any
                config.defaulted = true
                return config
            end)
            test.is_nil(err)
            test.eq(plan.current_config.nested.keep, "old")
            test.is_nil(plan.current_config.defaulted)
            test.eq(plan.desired_config.nested.keep, "new")
            test.is_true(plan.desired_config.defaulted == true)

            patch.nested.keep = "mutated later"
            plan.desired_config.nested.keep = "mutated during write"
            test.eq(plan.current_config.nested.keep, "old")
            test.eq(current.nested.keep, "old")
        end)

        test.it("does not write when component preflight fails", function()
            local c = collaborators({
                get_component = function() return nil, { message = "component service unavailable", status = 503 } end,
            })
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(ok)
            test.eq(err.stage, "component_preflight")
            test.eq(err.status, 503)
            test.contains(err.message, "component service unavailable")
            test.eq(#c.calls, 0)
        end)

        test.it("does not write when config preflight fails", function()
            local c = collaborators({
                prepare_config = function()
                    return nil, { message = "store contract unavailable", status = 500 }
                end,
            })
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(ok)
            test.eq(err.stage, "config_preflight")
            test.contains(err.message, "store contract unavailable")
            test.eq(#c.calls, 1)
            test.eq(c.calls[1].op, "get_component")
        end)

        test.it("does not write metadata when the config update fails", function()
            local c = collaborators({
                update_config = function()
                    return nil, "engine write failed"
                end,
            })
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(ok)
            test.eq(err.stage, "config_update")
            test.contains(err.message, "engine write failed")
            test.eq(#c.calls, 2)
            test.eq(c.calls[2].op, "prepare_config")
        end)

        test.it("restores the exact prior config when metadata update fails", function()
            local c = collaborators({
                set_meta = function()
                    return false, { message = "metadata write failed", status = 400 }
                end,
            })
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(ok)
            test.eq(err.stage, "metadata_update")
            test.eq(err.status, 400)
            test.contains(err.message, "metadata write failed")
            test.is_nil(err.rollback)
            test.eq(#c.calls, 4)
            test.eq(c.calls[3].op, "update_config")
            test.eq(c.calls[3].config.chunk_size, 500)
            test.eq(c.calls[4].op, "update_config")
            test.eq(c.calls[4].config.chunk_size, 100)
            test.is_true(c.calls[4].config.retained == true)
        end)

        test.it("surfaces rollback failure instead of hiding divergent state", function()
            local writes = 0
            local c = collaborators({
                update_config = function()
                    writes = writes + 1
                    if writes == 1 then return true, nil end
                    return nil, "rollback engine write failed"
                end,
                set_meta = function()
                    return false, "metadata write failed"
                end,
            })
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(ok)
            test.eq(err.stage, "metadata_update")
            test.eq(err.status, 500)
            test.not_nil(err.rollback)
            test.eq(err.rollback.stage, "config_rollback")
            test.contains(err.rollback.message, "rollback engine write failed")
        end)

        test.it("updates both representations in deterministic order", function()
            local c = collaborators()
            local ok, err = consistency.apply("kb-1", changes(), c)
            test.is_nil(err)
            test.is_true(ok == true)
            test.eq(#c.calls, 4)
            test.eq(c.calls[1].op, "get_component")
            test.eq(c.calls[2].op, "prepare_config")
            test.eq(c.calls[3].op, "update_config")
            test.eq(c.calls[4].op, "set_meta")
        end)

        test.it("metadata-only updates do not open or write an engine store", function()
            local c = collaborators()
            local ok, err = consistency.apply("kb-1", {
                meta_fields = { title = "After" },
            }, c)
            test.is_nil(err)
            test.is_true(ok == true)
            test.eq(#c.calls, 2)
            test.eq(c.calls[1].op, "get_component")
            test.eq(c.calls[2].op, "set_meta")
        end)

        test.it("config-only updates do not write component metadata", function()
            local c = collaborators()
            local ok, err = consistency.apply("kb-1", {
                config_patch = { chunk_size = 500 },
            }, c)
            test.is_nil(err)
            test.is_true(ok == true)
            test.eq(#c.calls, 3)
            test.eq(c.calls[3].op, "update_config")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
