local test = require("test")
local funcs = require("funcs")
local registry = require("registry")
local types = require("types")

local WORKER = "kickside.skills:projection_worker"

local EV = {
    CREATED = "kickside.skills.events:skill.created",
    UPDATED = "kickside.skills.events:skill.updated",
    FILE_TRANSFERRED = "kickside.skills.events:file.transferred",
}

local function ev(etype: string, body: any, extra: any?): any
    local out = { type = etype, body = body }
    if type(extra) == "table" then
        for k, v in pairs(extra) do out[k] = v end
    end
    return out
end

local function fold(prior: any, events: any, to_seq: any, component: any?): any
    return funcs.call(WORKER, {
        projection = { body = prior },
        events = events,
        range = { to_seq = to_seq },
        component = component,
    })
end

local function define_tests()
    test.describe("Skills Projection Worker", function()
        test.it("folds versions and syncs flat public meta", function()
            local writes = {}
            local component = {
                set_meta = function(component_id: string, meta: any)
                    writes[#writes + 1] = { component_id = component_id, meta = meta }
                    return true
                end,
            }

            local out = fold({}, {
                ev(EV.CREATED, {
                    skill_id = "skill-1",
                    version = 1,
                    body = "# Skill",
                    file_count = 1,
                    bundle_size = 10,
                }, { created_at = "2026-01-01T00:00:00Z" }),
                ev(EV.UPDATED, {
                    skill_id = "skill-1",
                    version = 2,
                    body = "# Skill v2",
                    file_count = 3,
                    bundle_size = 30,
                }, { created_at = "2026-01-02T00:00:00Z" }),
            }, 2, component)

            test.eq((out :: any).last_seq, 2)
            test.eq((out :: any).body.skill_id, "skill-1")
            test.eq((out :: any).body.current_version, 2)
            test.eq(#((out :: any).body.versions), 2)
            test.eq(#writes, 1)
            test.eq((writes[1] :: any).component_id, "skill-1")
            test.eq((writes[1] :: any).meta.version, 2)
            test.eq((writes[1] :: any).meta.version_count, 2)
            test.eq((writes[1] :: any).meta.file_count, 3)
            test.eq((writes[1] :: any).meta.bundle_size, 30)
            test.eq((writes[1] :: any).meta.last_version_at, "2026-01-02T00:00:00Z")
            test.is_nil((writes[1] :: any).meta.stats)
        end)

        test.it("preserves projection metadata across folds", function()
            local prior = {
                meta = { worker_input_mode = "prefetch_events" },
                versions = {},
            }
            local out = fold(prior, {
                ev(EV.CREATED, { skill_id = "skill-2", version = 1, body = "Body" }),
            }, 1, { set_meta = function() return true end })

            test.eq((out :: any).body.meta.worker_input_mode, "prefetch_events")
            test.eq((out :: any).body.current_version, 1)
        end)

        test.it("replays a transferred legacy file into its version manifest", function()
            local digest = string.rep("a", 64)
            local out = fold({}, {
                ev(EV.CREATED, {
                    skill_id = "skill-transfer", version = 1, body = "Body",
                    files = {{path = "guide.bin", artifact_id = "artifact-1"}},
                }),
                ev(EV.FILE_TRANSFERRED, {artifact_id = "artifact-1", sha256 = digest}),
            }, 2, { set_meta = function() return true end })

            local file = (out :: any).body.versions[1].files[1]
            test.eq(file.sha256, digest)
            test.is_nil(file.artifact_id)
        end)

        test.it("ignores non-canonical skill event type names", function()
            local out = fold({}, {
                ev("kickside.skills.events:created", { skill_id = "skill-old", version = 1, body = "Body" }),
                ev("kickside.skills.events:updated", { skill_id = "skill-old", version = 2, body = "Body v2" }),
            }, 2, { set_meta = function() return true end })

            test.eq((out :: any).last_seq, 2)
            test.is_nil((out :: any).body.skill_id)
            test.eq((out :: any).body.current_version, 0)
            test.eq(#((out :: any).body.versions), 0)
        end)

        test.it("does not write public meta when the owning skill id is absent", function()
            local writes = 0
            local out = fold({}, {
                ev(EV.CREATED, { version = 1, body = "Body" }),
            }, 1, {
                set_meta = function()
                    writes = writes + 1
                    return true
                end,
            })

            test.eq((out :: any).body.current_version, 1)
            test.eq(writes, 0)
        end)

        test.it("thread class constant matches the skill binding declaration", function()
            local entry, err = registry.get("kickside.skills:skill")
            test.is_nil(err)
            test.not_nil(entry)
            local meta: any = entry.meta or {}
            local classes: any = meta.class or {}
            test.eq(classes[1], types.THREAD_CLASS)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
