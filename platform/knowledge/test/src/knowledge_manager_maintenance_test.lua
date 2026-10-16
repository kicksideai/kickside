local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local security = require("security")

local DB = "app:db"
local TOOL = "kickside.knowledge.traits:knowledge_manager_tool"

local function db(): any
    local d, err = sql.get(DB)
    if err then error("db connect failed: " .. tostring(err)) end
    return d
end

local function insert_meta(d: any, component_id: string, key: string, value: string): ()
    local _, err = sql.builder.insert("kickside_component_meta")
        :set_map({
            meta_id = uuid.v7(), component_id = component_id, key = key, value = value,
            created_at = 0, updated_at = 0,
        }):run_with(d):exec()
    if err then error("meta insert failed: " .. tostring(err)) end
end

local function seed_component(component_id: string, owner: string?, kb_type: string, class: string): ()
    local d = db()
    local _, comp_err = sql.builder.insert("kickside_components")
        :set_map({
            component_id = component_id,
            impl_id = kb_type == "wiki" and "test.kb:embeddable" or "test.kb:no_maintenance",
            private_context = "{}",
            created_at = 0, updated_at = 0,
        }):run_with(d):exec()
    if comp_err then d:release() error("component insert failed: " .. tostring(comp_err)) end
    if owner then
        local _, access_err = sql.builder.insert("kickside_component_access")
            :set_map({
                access_id = uuid.v7(), subject_id = owner, subject_type = "user", component_id = component_id,
                source_component_id = component_id, access_mask = 15, inherited = 0, created_at = 0,
            }):run_with(d):exec()
        if access_err then d:release() error("access insert failed: " .. tostring(access_err)) end
    end
    insert_meta(d, component_id, "class", class)
    insert_meta(d, component_id, "kb_type", kb_type)
    insert_meta(d, component_id, "status", "ready")
    d:release()
end

local function cleanup(component_id: string): ()
    local d = db()
    sql.builder.delete("kickside_component_access"):where("component_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_component_meta"):where("component_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_components"):where("component_id = ?", component_id):run_with(d):exec()
    d:release()
end

local function executor(owner: string): any
    return funcs.new()
        :with_actor(security.new_actor(owner, { user_id = owner, status = "active" }))
        :with_scope(security.named_scope("wippy.security:process"))
end

local function define_tests()
    test.describe("Knowledge manager optional maintenance dispatch", function()
        test.it("uses the KB engine's bound contract and preserves the KB context", function()
            local owner = "maintenance-owner-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_component(component_id, owner, "wiki", "knowledge_base")
            local exec = executor(owner)

            local summary, summary_err = exec:call(TOOL, {
                action = "resummarize_knowledge_base", component_id = component_id,
            })
            test.is_nil(summary_err)
            test.eq(component_id, summary.kb_id)
            test.eq("resummarize", summary.run_type)
            test.eq("test-job-resummarize", summary.job_id)
            test.is_true(summary.scheduled)

            local vectors, vectors_err = exec:call(TOOL, {
                action = "reembed_knowledge_base", component_id = component_id,
            })
            test.is_nil(vectors_err)
            test.eq("reembed", vectors.run_type)
            test.eq("test-job-reembed", vectors.job_id)

            local status, status_err = exec:call(TOOL, {
                action = "knowledge_base_maintenance", component_id = component_id,
            })
            test.is_nil(status_err)
            test.eq(component_id, status.kb_id)
            test.eq("test-run-resummarize", status.resummarize.id)
            test.eq("test-run-reembed", status.reembed.id)

            cleanup(component_id)
        end)

        test.it("denies scheduling and status before any engine dispatch when the actor lacks KB access", function()
            local component_id = uuid.v7()
            seed_component(component_id, nil, "wiki", "knowledge_base")
            local exec = executor("maintenance-denied-" .. uuid.v4())
            for _, action in ipairs({ "resummarize_knowledge_base", "reembed_knowledge_base", "knowledge_base_maintenance" }) do
                local result, err = exec:call(TOOL, { action = action, component_id = component_id })
                test.is_nil(result)
                test.not_nil(err)
                test.contains(tostring(err), "access denied")
            end
            cleanup(component_id)
        end)

        test.it("refuses all maintenance actions when the selected engine offers no binding", function()
            local owner = "maintenance-optional-" .. uuid.v4()
            local component_id = uuid.v7()
            seed_component(component_id, owner, "no_maintenance", "knowledge_base")
            local exec = executor(owner)
            for _, action in ipairs({ "resummarize_knowledge_base", "reembed_knowledge_base", "knowledge_base_maintenance" }) do
                local result, err = exec:call(TOOL, { action = action, component_id = component_id })
                test.is_nil(result)
                test.not_nil(err)
                test.contains(tostring(err), "this knowledge base's engine does not support maintenance")
            end
            cleanup(component_id)
        end)

        test.it("does not route a non-KB component through a knowledge engine", function()
            local owner = "maintenance-non-kb-" .. uuid.v4()
            local component_id = uuid.v7()
            seed_component(component_id, owner, "wiki", "agent")
            local result, err = executor(owner):call(TOOL, {
                action = "knowledge_base_maintenance", component_id = component_id,
            })
            test.is_nil(result)
            test.not_nil(err)
            test.contains(tostring(err), "component is not a knowledge base")
            cleanup(component_id)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
