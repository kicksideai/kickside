-- End-to-end test of the agent-facing Skill tool.
--
-- This is exactly what an agent does at runtime when it uses the skills trait:
-- it calls the Skill tool with an action, the tool dispatches to the store under
-- the caller's actor, and returns a table. We drive the full loop
-- (save -> list -> use -> refine -> delete) via funcs:call with a framed actor,
-- which is the same path the agent runner takes when the model calls the tool.

local test = require("test")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")
local time = require("time")
local test_identity = require("test_identity")

local TOOL = "kickside.skills.traits:skill_tool"
local FILE_TOOL = "kickside.skills.traits:skill_file_tool"
local ACCESS_DENIED = "Component not found or access denied"

local function new_executor(user_id: string): any
    local exec = test_identity.executor(user_id)
    return exec
end

local function use_text(result: any, err: any): string
    if err then return tostring(err) end
    if type(result) == "table" and type(result.skill) == "table" then return tostring(result.skill.body) end
    return tostring(result)
end

local function wait_for_use(exec: any, skill_id: string, needle: string): string
    local out = ""
    for attempt = 1, 100 do
        local result, err = exec:call(TOOL, { action = "use", skill_id = skill_id })
        out = use_text(result, err)
        if string.find(out, needle, 1, true) ~= nil then return out end
        if attempt < 100 then time.sleep("10ms") end
    end
    return out
end

local function wait_for_denial(exec: any, skill_id: string, forbidden: string): (string, string)
    local out = ""
    local observed: { string } = {}
    for attempt = 1, 100 do
        local result, err = exec:call(TOOL, { action = "use", skill_id = skill_id })
        out = use_text(result, err)
        observed[#observed + 1] = out
        test.is_true(string.find(out, forbidden, 1, true) == nil,
            "unauthorized content observed: " .. table.concat(observed, " | "))
        if errors.is(err, errors.PERMISSION_DENIED) then
            test.is_nil(result)
            return ACCESS_DENIED, table.concat(observed, " | ")
        end
        if attempt < 100 then time.sleep("10ms") end
    end
    return out, table.concat(observed, " | ")
end

local function wait_for_grant(exec: any, skill_id: string, expected: string): (string, string)
    local out = ""
    local observed: { string } = {}
    for attempt = 1, 100 do
        local result, err = exec:call(TOOL, { action = "use", skill_id = skill_id })
        out = use_text(result, err)
        observed[#observed + 1] = out
        if string.find(out, expected, 1, true) ~= nil then return out, table.concat(observed, " | ") end
        test.is_nil(result)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), "unexpected grant output: " .. table.concat(observed, " | "))
        if attempt < 100 then time.sleep("10ms") end
    end
    return out, table.concat(observed, " | ")
end

local function define_tests()
    test.describe("kickside.skills Skill tool (agent surface, e2e)", function()
        local exec: any
        local prefix = "skilltool_" .. uuid_v4():sub(1, 8) .. "_"
        local skill_id: string?
        local paged_id: string?
        local file_paged_id: string?

        test.before_all(function()
            exec = new_executor("skilltool_test_user")
        end)

        test.after_all(function()
            if skill_id then
                pcall(function() exec:call(TOOL, { action = "delete", skill_id = skill_id }) end)
            end
            if paged_id then
                pcall(function() exec:call(TOOL, { action = "delete", skill_id = paged_id }) end)
            end
            if file_paged_id then
                pcall(function() exec:call(TOOL, { action = "delete", skill_id = file_paged_id }) end)
            end
        end)

        test.it("rejects an unknown action", function()
            local out, err = exec:call(TOOL, { action = "frobnicate" })
            test.is_nil(out)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(tostring(err), "unknown action")
        end)

        test.it("save authors a skill and returns its id", function()
            local out = exec:call(TOOL, {
                action = "save",
                name = prefix .. "triage",
                description = "Triage an incoming bug report into severity + owner.",
                body = "1. Read the report.\n2. Assign severity.\n3. Route to the owner.",
            })
            test.contains(out.message, "Saved skill")
            skill_id = out.skill_id
            test.eq(type(skill_id), "string")
        end)

        test.it("list returns compact skill rows without descriptions", function()
            local out, err = exec:call(TOOL, { action = "list", limit = 100 })
            test.is_nil(err, tostring(err))
            local found: any = nil
            for _, row in ipairs(out.skills) do
                if row.skill_id == skill_id then found = row end
            end
            test.not_nil(found)
            test.eq(found.name, prefix .. "triage")
            test.is_nil(found.description, "list rows must not expose the full description")
        end)

        test.it("pages the skill catalog with limit and cursor", function()
            local extra, extra_err = exec:call(TOOL, {
                action = "save", name = prefix .. "paged", description = "Second skill.", body = "steps",
            })
            test.is_nil(extra_err, tostring(extra_err))
            paged_id = extra.skill_id
            local seen: { [string]: boolean } = {}
            local cursor: string? = nil
            repeat
                local page, page_err = exec:call(TOOL, { action = "list", limit = 1, cursor = cursor })
                test.is_nil(page_err, tostring(page_err))
                test.is_true(#page.skills <= 1)
                test.eq(page.count, #page.skills)
                for _, row in ipairs(page.skills) do
                    test.is_nil(seen[row.skill_id], "a skill repeats across pages")
                    seen[row.skill_id] = true
                end
                cursor = page.next_cursor
            until cursor == nil
            test.is_true(seen[skill_id :: string])
            test.is_true(seen[paged_id :: string])
        end)

        test.it("use loads the full skill record with its body (progressive disclosure)", function()
            if not skill_id then error("saved skill ID is missing") end
            local out = wait_for_use(exec, skill_id, "Route to the owner")
            test.is_true(string.find(out, "Route to the owner", 1, true) ~= nil, "loaded output: " .. out)
            local loaded, err = exec:call(TOOL, { action = "use", skill_id = skill_id })
            test.is_nil(err, tostring(err))
            test.is_true(loaded.success)
            test.eq(loaded.skill.name, prefix .. "triage")
            test.eq(loaded.skill.description, "Triage an incoming bug report into severity + owner.")
            test.eq(type(loaded.files), "table")
        end)

        test.it("use returns a large body whole", function()
            local body = string.rep("é", 10000) .. " FINAL-SKILL-BODY-MARKER"
            local saved, save_err = exec:call(TOOL, {
                action = "save", name = prefix .. "large", description = "Large body.", body = body,
            })
            test.is_nil(save_err, tostring(save_err))
            local large_id = saved.skill_id
            local loaded = wait_for_use(exec, large_id, "FINAL-SKILL-BODY-MARKER")
            test.eq(loaded, body)
            exec:call(TOOL, { action = "delete", skill_id = large_id })
        end)

        test.it("lists and reads bundled files as records", function()
            local files: { any } = {}
            for index = 1, 3 do
                files[#files + 1] = { path = "references/" .. tostring(index) .. ".md", content = "reference " .. tostring(index) }
            end
            local saved, save_err = exec:call(TOOL, {
                action = "save", name = prefix .. "file-page", description = "Paged file manifest.",
                body = "Read references on demand.", files = files,
            })
            test.is_nil(save_err, tostring(save_err))
            file_paged_id = saved.skill_id
            local first, first_err = exec:call(FILE_TOOL, { action = "list", skill_id = file_paged_id, limit = 2 })
            test.is_nil(first_err, tostring(first_err))
            test.eq(first.count, 2)
            test.eq(first.files[1].path, "references/1.md")
            test.eq(first.files[1].kind, "reference")
            test.is_nil(first.files[1].sha256, "list rows expose only file selection fields")
            test.is_nil(first.files[1].metadata, "list rows must not expose full file metadata")
            test.eq(first.next_cursor, "references/2.md")
            local second, second_err = exec:call(FILE_TOOL, { action = "list", skill_id = file_paged_id, limit = 2, cursor = first.next_cursor })
            test.is_nil(second_err, tostring(second_err))
            test.eq(second.files[1].path, "references/3.md")
            test.is_nil(second.next_cursor)
            local read, read_err = exec:call(FILE_TOOL, { action = "read", skill_id = file_paged_id, path = "references/2.md" })
            test.is_nil(read_err, tostring(read_err))
            test.is_true(read.success)
            test.eq(read.path, "references/2.md")
            test.eq(read.encoding, "text")
            test.eq(read.content, "reference 2")

            local detail, detail_err = exec:call(TOOL, { action = "use", skill_id = file_paged_id })
            test.is_nil(detail_err, tostring(detail_err))
            test.not_nil(detail.skill.files[1].sha256, "detail retains the full file descriptor")
            test.not_nil(detail.skill.files[1].metadata, "detail retains file metadata")
        end)

        test.it("refine improves the skill into a new version", function()
            local out = exec:call(TOOL, {
                action = "refine",
                skill_id = skill_id,
                body = "1. Read.\n2. Severity.\n3. Owner.\n4. Post a summary.",
                description = "Triage and publish the ownership summary.",
            })
            test.eq(out.skill_id, skill_id)
            test.eq(out.version, 2)
            if not skill_id then error("saved skill ID is missing") end
            local loaded = wait_for_use(exec, skill_id, "Post a summary")
            test.is_true(string.find(loaded, "Post a summary", 1, true) ~= nil, "loaded output: " .. loaded)
            local detail, detail_err = exec:call(TOOL, { action = "use", skill_id = skill_id })
            test.is_nil(detail_err, tostring(detail_err))
            test.eq(detail.skill.description, "Triage and publish the ownership summary.",
                "detail must retain the refined description")
        end)

        test.it("description-only refine reports an update, not a nil version", function()
            local out = exec:call(TOOL, {
                action = "refine", skill_id = skill_id, description = "Sharper description.",
            })
            test.contains(out.message, "Updated skill")
            test.is_nil(out.version)
        end)

        test.it("delete removes the skill", function()
            local result, err = exec:call(TOOL, { action = "delete", skill_id = skill_id })
            test.is_nil(err, "delete error: " .. tostring(err))
            test.eq(result.skill_id, skill_id)
            test.contains(result.message, "Deleted skill")
            local listed, list_err = exec:call(TOOL, { action = "list", limit = 100 })
            test.is_nil(list_err, tostring(list_err))
            for _, row in ipairs(listed.skills) do
                test.is_true(row.skill_id ~= skill_id, "deleted skill stays listed")
            end
            local loaded, load_err = exec:call(TOOL, { action = "use", skill_id = skill_id })
            test.is_nil(loaded)
            test.is_true(errors.is(load_err, errors.PERMISSION_DENIED), tostring(load_err))
            skill_id = nil
        end)

        test.describe("share + unshare", function()
            local exec2: any
            local exec2_user_id: string = ""
            local shared_id: string?

            test.before_all(function()
                exec2, exec2_user_id = test_identity.executor("skilltool_test_user2")
            end)
            test.after_all(function()
                if shared_id then pcall(function() exec:call(TOOL, { action = "delete", skill_id = shared_id }) end) end
            end)

            test.it("share grants read, unshare revokes it", function()
                local out = exec:call(TOOL, {
                    action = "save", name = prefix .. "shared", description = "Shared.", body = "secret steps",
                })
                shared_id = out.skill_id
                test.not_nil(shared_id)
                local owner_view = wait_for_use(exec, shared_id, "secret steps")
                test.is_true(string.find(owner_view, "secret steps", 1, true) ~= nil,
                    "owner should read before share: " .. owner_view)

                -- grantee cannot read before share
                local before, before_observed = wait_for_denial(exec2, shared_id, "secret steps")
                test.eq(before, ACCESS_DENIED, "unexpected pre-share output: " .. before_observed)

                local sout = exec:call(TOOL, { action = "share", skill_id = shared_id, user_id = exec2_user_id })
                test.eq(sout.skill_id, shared_id)
                test.eq(sout.user_id, exec2_user_id)

                -- now readable
                local after, after_observed = wait_for_grant(exec2, shared_id, "secret steps")
                test.is_true(string.find(after, "secret steps", 1, true) ~= nil,
                    "grantee should read after share: " .. after_observed)

                -- unshare revokes
                local uout = exec:call(TOOL, { action = "unshare", skill_id = shared_id, user_id = exec2_user_id })
                test.contains(uout.message, "Unshared skill")
                local revoked, revoked_observed = wait_for_denial(exec2, shared_id, "secret steps")
                test.eq(revoked, ACCESS_DENIED, "unexpected post-unshare output: " .. revoked_observed)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
